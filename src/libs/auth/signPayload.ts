import { createHash, createHmac } from "crypto";

export const signPayload = (payload: string, secret: string) => {
    const hash = createHash("sha256").update(payload).digest();
    const signature = createHmac("sha256", secret).update(hash).digest("base64");
    return signature;
};