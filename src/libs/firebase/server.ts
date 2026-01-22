"use server";

import { App, cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

let app: App;

if (getApps().length === 0) {
    console.log("Initializing Firebase Admin App");
    app = initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
                /\\n/g,
                "\n"
            ),
        }),
        databaseURL: process.env.FIRESTORE_DATABASE_URL,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
} else {
    app = getApp();
}

export const adminFirestore = getFirestore(app);
export const adminAuth = getAuth(app);
export const adminStorage = getStorage(app);

type SignInWithCustomTokenResponse = {
    idToken: string;
    refreshToken: string;
    expiresIn: string;
};

export const signInWithCustomToken = async (
    customToken: string
): Promise<SignInWithCustomTokenResponse> => {
    const result = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.VITE_PUBLIC_FIREBASE_API_KEY}`,
        {
            method: "POST",
            body: JSON.stringify({
                token: customToken,
                returnSecureToken: true,
            }),
        }
    );
    if (!result.ok) {
        console.error(await result.text());
        throw new Error("Failed to sign in with custom token");
    }
    return (await result.json()) as SignInWithCustomTokenResponse;
};

type RefreshTokenResponse = {
    token_type: string;
    id_token: string;
    refresh_token: string;
    expires_in: string;
    user_id: string;
    project_id: string;
};

export const refreshToken = async (
    refreshToken: string
): Promise<RefreshTokenResponse> => {
    const result = await fetch(
        `https://securetoken.googleapis.com/v1/token?key=${process.env.VITE_PUBLIC_FIREBASE_API_KEY}`,
        {
            method: "POST",
            body: JSON.stringify({
                grant_type: "refresh_token",
                refreshToken,
            }),
        }
    );
    if (!result.ok) {
        console.error(await result.text());
        throw new Error("Failed to refresh token");
    }
    return (await result.json()) as RefreshTokenResponse;
};
