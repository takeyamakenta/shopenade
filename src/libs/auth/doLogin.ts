import { AuthSessionData } from "@/@types/AuthSessionData";
import { updateAuthSession } from "@/sessions/authSession";

import { serializeError } from "../error/reportError";

type LoginResult =
    | {
          success: boolean;
          data: AuthSessionData;
      }
    | {
          success: false;
          error: unknown;
          data: unknown;
      };

export const doLogin = async (idToken: string): Promise<LoginResult> => {
    try {
        const result = await fetch(
            `${process.env.BACKEND_URL}v1/auth/users/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${idToken}`,
                    "X-App-Id": process.env.APP_ID ?? "0",
                    "X-Role-Code": process.env.DEFAULT_ROLE_CODE ?? "",
                    "X-Role-Is-Public":
                        process.env.DEFAULT_ROLE_IS_PUBLIC === "true"
                            ? "true"
                            : "false",
                    "X-Role-Owner-Company-Id":
                        process.env.DEFAULT_ROLE_OWNER_COMPANY_ID ?? "0",
                },
                body: "{}",
            }
        );
        if (result.ok) {
            const resultData = (await result?.json()) as LoginResult;
            console.log({ resultData });

            if (!resultData.data) {
                return {
                    success: false,
                    error: "Login failed",
                    data: undefined,
                };
            }

            const { uid, granted_previleges, role } =
                resultData.data as AuthSessionData;
            console.log("resultData", resultData.data);
            console.log("granted_previleges", granted_previleges);
            console.log("role", role);
            const data: AuthSessionData = {
                idToken,
                uid,
                granted_previleges,
                role,
            };

            await updateAuthSession(data);

            return {
                success: true,
                data,
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
        console.error(error);
        return {
            success: false,
            error: serializeError(error),
            data: undefined,
        };
    }
};
