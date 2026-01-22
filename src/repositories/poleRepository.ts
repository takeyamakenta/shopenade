"use server";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
} from "@aws-sdk/lib-dynamodb";

import { Pole } from "@/@types/Pole";
import { gridKey } from "@/libs/geo/webMercator";

type PolesGetter = (lat: number, lng: number, radius: number) => Promise<Pole[]>;

import { doGetNearbyPoles } from "@/libs/geo/getNearByPoles";

/**
 * ユーザーデータのリポジトリクラス(インスタンス)
 * DynamoDBをキャッシュとして使用し、キャッシュミスの場合はPrismaからデータを取得する
 */
export const poleRepository = new (class {
    private polesGetter: PolesGetter;
    private dynamoClient: DynamoDBDocumentClient;
    private readonly tableName: string =
        process.env.AWS_DYNAMODB_TABLE_NAME || "tasks";
    private readonly ttlInSeconds: number = 3600; // キャッシュの有効期限（1時間）
    private readonly cacheKeyPrefix: string =
        process.env.POLE_CACHE_KEY_PREFIX || "poles_";

    /**
     * コンストラクタ
     * @param dynamoDBClient DynamoDBクライアントのインスタンス（オプション）
     */
    constructor(polesGetter: PolesGetter, dynamoDBClient?: DynamoDBClient) {
        this.polesGetter = polesGetter;

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
     * ポールデータの取得
     * @param lat 緯度
     * @param lng 経度
     * @param distance セルの一辺 (m)
     * @param versionNo バージョン番号
     * @returns ポールデータまたはnull
     */
    async getNearbyPoles(lat: number, lng: number, distance: number, versionNo: number): Promise<Pole[]> {
        try {
            const cachedPoles = await this.getNearbyPolesFromCache(lat, lng, distance, versionNo);

            if (cachedPoles?.length !== null && cachedPoles?.length !== undefined) {
                console.log(`Cache hit for poles: ${lat}, ${lng}`);
                return cachedPoles;
            }

            console.log(
                `Cache miss for user: ${lat}, ${lng}, fetching from database`
            );

            const poles = await this.polesGetter(lat, lng, 1000);

            if (poles.length !== null) {
                this.cachePoles(lat, lng, distance, versionNo, poles);
            }

            return poles;
        } catch (error) {
            console.error(`Error fetching poles ${lat}, ${lng}:`, error);
            throw error;
        }
    }

    /**
     * DynamoDBキャッシュからポールデータを取得
     * @param lat 緯度
     * @param lng 経度
     * @returns キャッシュされたポールデータまたはnull
     */
    private async getNearbyPolesFromCache(
        lat: number,
        lng: number,
        distance: number,
        versionNo: number
    ): Promise<Pole[] | null> {
        try {
            const command = new GetCommand({
                TableName: this.tableName,
                Key: {
                    partition_key: `${this.cacheKeyPrefix}${versionNo}`,
                    sort_key: `${gridKey(lat, lng, distance)}`,
                },
            });

            const response = await this.dynamoClient.send(command);
            const item = response.Item;

            // キャッシュアイテムが存在し、TTLが有効な場合のみ返す
            if (
                item &&
                item.polesData &&
                (!item.expires_at ||
                    item.expires_at > Math.floor(Date.now() / 1000))
            ) {
                return JSON.parse(item.polesData) as Pole[];
            }

            return null;
        } catch (error) {
            console.error(`Cache retrieval error for poles ${lat}, ${lng}:`, error);
            return null;
        }
    }

    /**
     * ユーザー情報をDynamoDBキャッシュに保存
     * @param user キャッシュするユーザー情報
     */
    private async cachePoles(lat: number, lng: number, distance: number, versionNo: number, poles: Pole[]): Promise<void> {
        try {
            const ttl = Math.floor(Date.now() / 1000) + this.ttlInSeconds;

            const command = new PutCommand({
                TableName: this.tableName,
                Item: {
                    partition_key: `${this.cacheKeyPrefix}${versionNo}`,
                    sort_key: `${gridKey(lat, lng, distance)}`,
                    polesData: JSON.stringify(poles),
                    expires_at: ttl,
                },
            });

            await this.dynamoClient.send(command);
            console.log(`Poles ${lat}, ${lng} cached successfully with TTL: ${ttl}`);
        } catch (error) {
            console.error(`Failed to cache poles ${lat}, ${lng}:`, error);
            // キャッシュの失敗はアプリケーションの動作に影響しないため、エラーは記録するだけ
        }
    }

    /**
     * キャッシュの手動無効化
     * @param lat 緯度
     * @param lng 経度
     * @param distance セルの一辺 (m)
     * @param versionNo バージョン番号
     */
    async invalidateCache(lat: number, lng: number, distance: number, versionNo: number): Promise<void> {
        try {
            const command = new PutCommand({
                TableName: this.tableName,
                Item: {
                    partition_key: `${this.cacheKeyPrefix}${versionNo}`,
                    sort_key: `${gridKey(lat, lng, distance)}`,
                    expires_at: Math.floor(Date.now() / 1000) - 1, // 即時期限切れにする
                },
            });

            await this.dynamoClient.send(command);
            console.log(`Cache invalidated for poles: ${lat}, ${lng}`);
        } catch (error) {
            console.error(
                `Failed to invalidate cache for poles ${lat}, ${lng}:`,
                error
            );
        }
    }
})(doGetNearbyPoles);
