// メートル正方グリッドにスナップして代表緯度経度を返す実装（Web Mercator ベース）

export type Point = { lat: number; lng: number };
type Result = {
    rep: Point; // 代表点（ここではセル中心）
    index: { x: number; y: number }; // グリッドの整数インデックス
    distance: number; // セルサイズ（m）
};

// Web Mercator の定数
const R = 6378137; // Earth radius for Web Mercator (meters)
const MAX_LAT = 85.05112878; // Web Mercator の有効緯度上限

// 経度を [-180, 180) に正規化
function normalizeLng(lng: number): number {
    const x = ((((lng + 180) % 360) + 360) % 360) - 180;
    return x === -180 ? 180 : x;
}

// 緯度を投影可能範囲にクランプ
function clampLat(lat: number): number {
    return Math.max(-MAX_LAT, Math.min(MAX_LAT, lat));
}

// 緯度経度 -> Web Mercator (meters)
function project({ lat, lng }: Point): { x: number; y: number } {
    const clampedLat = clampLat(lat);
    const radiant = (normalizeLng(lng) * Math.PI) / 180;
    const phi = (clampedLat * Math.PI) / 180;
    const x = R * radiant;
    const y = R * Math.log(Math.tan(Math.PI / 4 + phi / 2));
    return { x, y };
}

// Web Mercator (meters) -> 緯度経度
function unproject({ x, y }: { x: number; y: number }): Point {
    const radiant = x / R; // radians
    const phi = 2 * Math.atan(Math.exp(y / R)) - Math.PI / 2;
    const lat = (phi * 180) / Math.PI;
    // 経度は -180..180 に戻す
    const lng = normalizeLng((radiant * 180) / Math.PI);
    return { lat, lng };
}

/**
 * 任意点をメートルサイズの正方グリッドにスナップ
 * @param point 緯度経度
 * @param distance セルの一辺 (m)
 * @param originMeters 任意の原点(メートル)を指定したい場合（デフォルトは (0,0)）
 *                     同じ原点 & セルサイズなら、どこで計算しても同じセルに入ります
 */
export function snapToGrid(
    lat: number,
    lng: number,
    distance: number,
    originMeters: { x: number; y: number } = { x: 0, y: 0 }
): Result {
    const point = { lat, lng };
    if (!(distance > 0)) throw new Error("distance must be > 0");

    // 1) 投影してメートル座標へ
    const p = project(point);

    // 2) 原点からのオフセットでグリッド丸め
    const gx = Math.floor((p.x - originMeters.x) / distance);
    const gy = Math.floor((p.y - originMeters.y) / distance);

    // 3) セル中心のメートル座標（代表点）を算出
    const centerX = originMeters.x + (gx + 0.5) * distance;
    const centerY = originMeters.y + (gy + 0.5) * distance;

    // 4) 代表点を緯度経度に戻す
    const rep = unproject({ x: centerX, y: centerY });

    return {
        rep,
        index: { x: gx, y: gy },
        distance,
    };
}

/** 同じセルを同じキーで扱いたいときのユーティリティ */
export function gridKey(lat: number, lng: number, distance: number): string {
    const { index } = snapToGrid(lat, lng, distance);
    return `${index.x}:${index.y}`;
}
