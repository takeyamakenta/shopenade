"use server";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
} from "@aws-sdk/lib-dynamodb";

import { Busstop } from "@/@types/Busstop";
import { doGetNearbyBusstops } from "@/libs/geo/getNearByBusstops";
import { gridKey } from "@/libs/geo/webMercator";

type BusstopsGetter = (
    lat: number,
    lng: number,
    radius: number
) => Promise<Busstop[]>;

/**
 * ユーザーデータのリポジトリクラス(インスタンス)
 * DynamoDBをキャッシュとして使用し、キャッシュミスの場合はPrismaからデータを取得する
 */
export const busstopRepository = new (class {
    private busstopsGetter: BusstopsGetter;
    private dynamoClient: DynamoDBDocumentClient;
    private readonly tableName: string =
        process.env.AWS_DYNAMODB_TABLE_NAME || "tasks";
    private readonly ttlInSeconds: number = 3600; // キャッシュの有効期限（1時間）
    private readonly cacheKeyPrefix: string =
        process.env.BUSSTOP_CACHE_KEY_PREFIX || "busstops_";

    /**
     * コンストラクタ
     * @param dynamoDBClient DynamoDBクライアントのインスタンス（オプション）
     */
    constructor(
        busstopsGetter: BusstopsGetter,
        dynamoDBClient?: DynamoDBClient
    ) {
        this.busstopsGetter = busstopsGetter;

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
    async getNearbyBusstops(
        lat: number,
        lng: number,
        distance: number,
        versionNo: number
    ): Promise<Busstop[]> {
        try {
            const cachedBusstops = await this.getNearbyBusstopsFromCache(
                lat,
                lng,
                distance,
                versionNo
            );

            if (
                cachedBusstops?.length !== null &&
                cachedBusstops?.length !== undefined
            ) {
                console.log(`Cache hit for busstops: ${lat}, ${lng}`);
                return cachedBusstops;
            }

            console.log(
                `Cache miss for user: ${lat}, ${lng}, fetching from database`
            );

            const busstops = await this.busstopsGetter(lat, lng, 1000);

            if (busstops.length !== null) {
                this.cacheBusstops(lat, lng, distance, versionNo, busstops);
            }

            return busstops;
        } catch (error) {
            console.error(`Error fetching busstops ${lat}, ${lng}:`, error);
            throw error;
        }
    }

    /**
     * DynamoDBキャッシュからポールデータを取得
     * @param lat 緯度
     * @param lng 経度
     * @returns キャッシュされたポールデータまたはnull
     */
    private async getNearbyBusstopsFromCache(
        lat: number,
        lng: number,
        distance: number,
        versionNo: number
    ): Promise<Busstop[] | null> {
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
                item.busstopsData &&
                (!item.expires_at ||
                    item.expires_at > Math.floor(Date.now() / 1000))
            ) {
                return JSON.parse(item.busstopsData) as Busstop[];
            }

            return null;
        } catch (error) {
            console.error(
                `Cache retrieval error for busstops ${lat}, ${lng}:`,
                error
            );
            return null;
        }
    }

    /**
     * ユーザー情報をDynamoDBキャッシュに保存
     * @param user キャッシュするユーザー情報
     */
    private async cacheBusstops(
        lat: number,
        lng: number,
        distance: number,
        versionNo: number,
        busstops: Busstop[]
    ): Promise<void> {
        try {
            const ttl = Math.floor(Date.now() / 1000) + this.ttlInSeconds;

            const command = new PutCommand({
                TableName: this.tableName,
                Item: {
                    partition_key: `${this.cacheKeyPrefix}${versionNo}`,
                    sort_key: `${gridKey(lat, lng, distance)}`,
                    busstopsData: JSON.stringify(busstops),
                    expires_at: ttl,
                },
            });

            await this.dynamoClient.send(command);
            console.log(
                `Busstops ${lat}, ${lng} cached successfully with TTL: ${ttl}`
            );
        } catch (error) {
            console.error(`Failed to cache busstops ${lat}, ${lng}:`, error);
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
    async invalidateCache(
        lat: number,
        lng: number,
        distance: number,
        versionNo: number
    ): Promise<void> {
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
            console.log(`Cache invalidated for busstops: ${lat}, ${lng}`);
        } catch (error) {
            console.error(
                `Failed to invalidate cache for busstops ${lat}, ${lng}:`,
                error
            );
        }
    }
})(doGetNearbyBusstops);
