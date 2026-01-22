import { ClientAuthData } from "@/@types/ClientAuthData";
import { UserCredentials } from "@/@types/UserCredentials";
import {
    adminAuth,
    refreshToken,
    signInWithCustomToken,
} from "@/libs/firebase/server";
import { sessionRepository } from "@/repositories/sessionRepository";
import { getAuthSession, updateAuthSession } from "@/sessions/authSession";

type LoginResponse =
    | {
          success: boolean;
          data: {
              custom_token: string;
              uid: string;
              email: string;
          };
      }
    | {
          success: false;
          error: unknown;
          data: undefined;
      };

export const doLogin = async (
    idToken: string
): Promise<{
    success: boolean;
    error?: string;
    clientData?: ClientAuthData;
}> => {
    let newIdToken: string | null = null;
    try {
        await adminAuth.verifyIdToken(idToken);
        newIdToken = idToken;
    } catch (error: unknown) {
        // idTokenが期限切れの場合はリフレッシュする
        console.error(error);
        const authSession = await getAuthSession();
        if (!authSession?.uid) {
            throw new Error("Auth session not found");
        }
        const userCredentials = await sessionRepository.get(authSession.uid);
        if (!userCredentials) {
            throw new Error("User credentials not found");
        }
        // TODO トークン期限切れエラーのみに限定する
        const refreshTokenResult = await refreshToken(
            userCredentials.refreshToken
        );
        if (refreshTokenResult.user_id !== authSession.uid) {
            throw new Error("User ID discrepancy");
        }
        newIdToken = refreshTokenResult.id_token;
    }

    const payload = {
        id_token: newIdToken,
    };

    const result = await fetch(`${process.env.BACKEND_URL}a/v1/login`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(payload),
    });
    if (result.ok) {
        const { data } = (await result?.json()) as LoginResponse;

        if (!data) {
            return {
                success: false,
                error: "Login failed",
            };
        }

        const { custom_token, uid, email } = data;

        const customTokenResult = await signInWithCustomToken(custom_token);

        const userCredentials: UserCredentials = {
            isBanned: false,
            uid,
            email,
            refreshToken: customTokenResult.refreshToken,
            customToken: custom_token,
        };

        // DynamoDBに保存
        await sessionRepository.put(uid, userCredentials);

        const clientData: ClientAuthData = {
            customToken: custom_token,
            uid,
            email,
        };

        await updateAuthSession({
            idToken: customTokenResult.idToken,
            uid,
        });

        return {
            success: true,
            clientData,
        };
    } else {
        return {
            success: false,
            error: await result.text(),
        };
    }
};
