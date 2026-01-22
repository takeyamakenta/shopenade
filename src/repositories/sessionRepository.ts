"use server";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
} from "@aws-sdk/lib-dynamodb";

import { UserCredentials } from "@/@types/UserCredentials";

/**
 * ユーザーセッションデータのリポジトリクラス(インスタンス)
 */
export const sessionRepository = new (class {
    private dynamoClient: DynamoDBDocumentClient;
    private readonly tableName: string =
        process.env.AWS_DYNAMODB_TABLE_NAME || "tasks";
    private readonly ttlInSeconds: number = 86400; // キャッシュの有効期限（24時間）
    private readonly cacheKeyPrefix: string =
        process.env.SESSION_CACHE_KEY_PREFIX || "tasks_";

    /**
     * コンストラクタ
     * @param dynamoDBClient DynamoDBクライアントのインスタンス（オプション）
     */
    constructor(dynamoDBClient?: DynamoDBClient) {
        // DynamoDBクライアントが提供されない場合は新しく作成
        const client =
            dynamoDBClient ||
            new DynamoDBClient({
                region: process.env.AWS_REGION || "ap-northeast-1",
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
                },
            });

        // DynamoDBドキュメントクライアントを初期化
        this.dynamoClient = DynamoDBDocumentClient.from(client);
    }

    /**
     * ユーザーIDによるユーザー情報の取得
     * 最初にDynamoDBキャッシュを確認し、キャッシュミスの場合はデータベースから取得
     * @param userUid ユーザのUid
     * @returns ユーザー情報またはnull
     */
    async get(
        userUid: string
    ): Promise<UserCredentials | null> {
        try {
            return await this.getFromCache(userUid);
        } catch (error) {
            console.error(
                `Error fetching userCredentials ${userUid}:`,
                error
            );
            return null;
        }
    }

    /**
     * DynamoDBからユーザー情報を取得
     * @param userUid ユーザーID
     * @returns キャッシュされたユーザー情報またはnull
     */
    private async getFromCache(
        userUid: string
    ): Promise<UserCredentials | null> {
        try {
            const command = new GetCommand({
                TableName: this.tableName,
                Key: {
                    partition_key: `${this.cacheKeyPrefix + userUid}`,
                    sort_key: "#",
                },
            });

            const response = await this.dynamoClient.send(command);
            const item = response.Item;

            // キャッシュアイテムが存在し、TTLが有効な場合のみ返す
            if (
                item &&
                item.userData &&
                (!item.expires_at ||
                    item.expires_at > Math.floor(Date.now() / 1000))
            ) {
                return JSON.parse(item.userData) as UserCredentials;
            }

            return null;
        } catch (error) {
            console.error(`Cache retrieval error for user ${userUid}:`, error);
            return null;
        }
    }

    /**
     * ユーザー情報をDynamoDBキャッシュに保存
     * @param userUid
     * @param data
     */
    private async cache(
        userUid: string,
        data: Partial<UserCredentials>
    ): Promise<void> {
        const ttl = Math.floor(Date.now() / 1000) + this.ttlInSeconds;

        const command = new PutCommand({
            TableName: this.tableName,
            Item: {
                partition_key: `${this.cacheKeyPrefix + userUid}`,
                sort_key: "#",
                userData: JSON.stringify(data),
                expires_at: ttl,
            },
        });

        await this.dynamoClient.send(command);
        console.log(`User ${userUid} cached successfully with TTL: ${ttl}`);
    }

    /**
     * ユーザー情報の更新
     * データベースを更新し、キャッシュも更新する
     * @param userId ユーザーID
     * @param userData 更新するユーザーデータ
     * @returns 更新されたユーザー情報
     */
    async put(
        userUid: string,
        credentials: Partial<UserCredentials>
    ): Promise<Partial< UserCredentials>> {
        // キャッシュを更新
        await this.cache(userUid, credentials);

        return credentials;
    }

    /**
     * 削除
     * @param userUid ユーザーID
     */
    async delete(userUid: string): Promise<void> {
        try {
            const command = new PutCommand({
                TableName: this.tableName,
                Item: {
                    partition_key: `${this.cacheKeyPrefix + userUid}`,
                    sort_key: "#",
                    expires_at: Math.floor(Date.now() / 1000) - 1, // 即時期限切れにする
                },
            });

            await this.dynamoClient.send(command);
            console.log(`Cache invalidated for user: ${userUid}`);
        } catch (error) {
            console.error(
                `Failed to invalidate cache for user ${userUid}:`,
                error
            );
        }
    }
})();
