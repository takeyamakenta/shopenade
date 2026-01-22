import { cookieStorage } from "@solid-primitives/storage";

/* ------------------------------------------------------------------ *
 * 型
 * ------------------------------------------------------------------ */
interface SessionOptions {
    password: string; // 32 文字以上推奨
    name?: string; // Cookie 名
    maxAge?: number; // 秒 (既定: 30 日)
    httpOnly?: boolean; // デフォルト: true
    secure?: boolean; // デフォルト: true
    sameSite?: "Strict" | "Lax" | "None"; // デフォルト: "lax"
}

export interface Session<T> {
    data: T;
    update(newData: Partial<T>): Promise<void>;
    clear(): Promise<void>;
}

/* ------------------------------------------------------------------ *
 * 公開 API（vinxi/http 互換）
 * ------------------------------------------------------------------ */
export async function useSession<T extends Record<string, unknown>>(
    opts: SessionOptions
): Promise<Session<T>> {
    const { password, name = "h3", maxAge = 60 * 60 * 24 * 30, httpOnly = true, secure = true, sameSite = "Lax" } = opts;

    // 既存 Cookie の復号
    let sessionData = {} as T;
    const raw = await readCookie(name);
    if (raw) {
        try {
            sessionData = await decryptCookie<T>(raw, password);
        } catch {
            console.log("data is broken");
            /* 壊れた／期限切れ Cookie は無視して新規セッション */
        }
    }

    /* 内部ヘルパー --------------------------------------------------------- */
    const persist = async (data: Record<string, unknown>) => {
        const sealed = await encryptCookie(data, password, maxAge);
        await writeCookie(name, sealed, { maxAge, httpOnly, secure, sameSite }); // ★ stub
    };

    return {
        data: sessionData,
        async update(newData) {
            sessionData = { ...sessionData, ...newData };
            await persist(sessionData);
        },
        async clear() {
            sessionData = {} as T;
            await writeCookie(name, "", { maxAge: 0, httpOnly, secure, sameSite });
        },
    };
}

/* 追加のショートカット --------------------------------------------------- */
export const getSession = useSession;
export async function updateSession<T>(opts: SessionOptions, data: Partial<T>) {
    const s = await useSession(opts);
    await s.update(data);
}
export async function clearSession(opts: SessionOptions) {
    const s = await useSession(opts);
    await s.clear();
}

/* ------------------------------------------------------------------ *
 * Crypto 実装 – Web Crypto だけで完結
 * ------------------------------------------------------------------ */

// === 共通ユーティリティ ===============================================
const text = new TextEncoder();
const untxt = new TextDecoder();

const b64url = {
    enc(buf: Uint8Array) {
        const str =
            typeof Buffer !== "undefined"
                ? Buffer.from(buf).toString("base64")
                : btoa(String.fromCharCode(...buf));
        return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
    },
    dec(str: string) {
        str = str.replace(/-/g, "+").replace(/_/g, "/");
        while (str.length % 4) str += "=";
        if (typeof Buffer !== "undefined") {
            return new Uint8Array(Buffer.from(str, "base64"));
        }
        const bin = atob(str);
        return Uint8Array.from([...bin].map((c) => c.charCodeAt(0)));
    },
};

function concat(a: Uint8Array, b: Uint8Array) {
    const ab = new Uint8Array(a.length + b.length);
    ab.set(a, 0);
    ab.set(b, a.length);
    return ab;
}

function equal(a: Uint8Array, b: Uint8Array) {
    if (a.length !== b.length) return false;
    let v = 0;
    for (let i = 0; i < a.length; i++) v |= a[i] ^ b[i];
    return v === 0;
}

// === キー導出（password → AES & HMAC key） ==============================
async function deriveKey(password: string, usage: KeyUsage[]) {
    const pw = text.encode(password);
    const hash = await crypto.subtle.digest("SHA-256", pw); // 32 byte
    return crypto.subtle.importKey(
        "raw",
        hash,
        {
            name: usage[0] === "sign" ? "HMAC" : "AES-GCM",
            hash: "SHA-256",
            length: 256,
        },
        false,
        usage
    );
}

// === AES-GCM で暗号化 + HMAC-SHA256 で署名 =============================
async function encryptCookie(
    obj: Record<string, unknown>,
    password: string,
    maxAge: number
): Promise<string> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, ["encrypt"]);
    const plain = text.encode(
        JSON.stringify({ exp: Date.now() + maxAge * 1_000, v: obj })
    );

    const cipherBuf = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        plain
    );
    const cipher = new Uint8Array(cipherBuf); // tag 含む

    const payload = concat(iv, cipher); // iv | ciphertext+tag
    const sig = await hmacSign(payload, password);

    return `${b64url.enc(payload)}.${b64url.enc(sig)}`;
}

async function decryptCookie<T>(cookie: string, password: string): Promise<T> {
    const [payStr, sigStr] = cookie.split(".");
    if (!payStr || !sigStr) throw new Error("Malformed cookie");

    const payload = b64url.dec(payStr);
    const sig = b64url.dec(sigStr);
    const expected = await hmacSign(payload, password);
    if (!equal(sig, expected)) throw new Error("Bad signature");

    const iv = payload.slice(0, 12);
    const cipher = payload.slice(12);

    const key = await deriveKey(password, ["decrypt"]);
    const plainBuf = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        cipher
    );
    const { exp, v } = JSON.parse(untxt.decode(new Uint8Array(plainBuf)));
    if (Date.now() > exp) throw new Error("Expired");

    return v as T;
}

// === HMAC-SHA256 =========================================================
async function hmacSign(
    data: Uint8Array,
    password: string
): Promise<Uint8Array> {
    const key = await deriveKey(password, ["sign"]);
    const sigBuf = await crypto.subtle.sign("HMAC", key, data);
    return new Uint8Array(sigBuf);
}

async function readCookie(_name: string) {
    const value = cookieStorage.getItem(_name);
    return value;
}

async function writeCookie(
    _name: string,
    _value: string,
    _opts: { maxAge: number; httpOnly: boolean; secure: boolean; sameSite: "Strict" | "Lax" | "None" }
) {
    cookieStorage.setItem(_name, _value, { ..._opts });
}
