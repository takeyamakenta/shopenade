import {
    adminAuth
} from "@/libs/firebase/server";
import { signPayload } from "@/libs/auth/signPayload";
import { serializeError } from "../error/reportError";

type CreateUserWithEmailAndPasswordResponse =
    | {
          success: boolean;
          data: {
            group_codes: string[];
          };
      }
    | {
          success: false;
          error: unknown;
          data: unknown;
      };

export const doCreateUserWithEmailAndPassword = async (
    email: string,
    password: string,
    name: string
): Promise<CreateUserWithEmailAndPasswordResponse> => {
    const user = await adminAuth.createUser({
        email,
        password,
        displayName: name,
        emailVerified: false,
    });
    if (!user) {
        throw new Error("Failed to create user");
    }

    try {
        const payload = {
            timestamp: Math.floor(Date.now()/1000),
            email,
            password,
            name,
            identity_platform_type: "firebase",
            identity_platform_id: user.uid,
            app_code : process.env.APP_CODE,
            is_app_public: process.env.IS_APP_PUBLIC === "true",
            app_owner_company_id: null,
        };

        console.log({payload});

        const serializedPayload = JSON.stringify(payload);
        const signature = signPayload(serializedPayload, process.env.SIGN_KEY!);

        const result = await fetch(`${process.env.BACKEND_URL}v1/auth/users/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "X-Signature": signature,
            },
            body: serializedPayload,
        });
        if (result.ok) {
            const { data } = (await result?.json()) as CreateUserWithEmailAndPasswordResponse;

            if (! data) {
                return {
                    success: false,
                    error: "Login failed",
                    data: undefined,
                };
            }

            const { group_codes } = data as { group_codes: string[] };

            return {
                success: true,
                data: {
                    group_codes,
                },
            };
        } else {
            const errorText = await result.text();
            console.error(errorText);
            return {
                success: false,
                error: errorText,
                data: undefined,
            };
        }
    } catch (error: unknown) {
        adminAuth.deleteUser(user.uid);
        console.error(error);
        return {
            success: false,
            error: serializeError(error),
            data: undefined,
        };
    }
};
