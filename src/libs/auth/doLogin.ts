import { serializeError } from "../error/reportError";

type LoginResult =
    | {
          success: boolean;
          data: {
            login_role_id: number;
            login_group_id: number;
          };
      }
    | {
          success: false;
          error: unknown;
          data: unknown;
      };

export const doLogin = async (
    idToken: string
): Promise<LoginResult> => {
    
    try {
        const result = await fetch(`${process.env.BACKEND_URL}v1/auth/users/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "Authorization": `Bearer ${idToken}`,
                "X-App-Code": process.env.APP_CODE ?? "",
                "X-App-Is-Public": process.env.APP_IS_PUBLIC === "true" ? "true" : "false",
                "X-App-Owner-Company-Id": process.env.APP_OWNER_COMPANY_ID ?? "0",
                "X-Role-Code": process.env.DEFAULT_ROLE_CODE ?? "",
                "X-Role-Is-Public": process.env.DEFAULT_ROLE_IS_PUBLIC === "true" ? "true" : "false",
                "X-Role-Owner-Company-Id": process.env.DEFAULT_ROLE_OWNER_COMPANY_ID ?? "0",
            },
            body: "{}",
        });
        if (result.ok) {
            const resultData = (await result?.json()) as LoginResult;
            console.log({resultData});

            if (! resultData.data) {
                return {
                    success: false,
                    error: "Login failed",
                    data: undefined,
                };
            }

            const { login_role_id, login_group_id } = resultData.data as { login_role_id: number, login_group_id: number };

            return {
                success: true,
                data: {
                    login_role_id,
                    login_group_id,
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
        console.error(error);
        return {
            success: false,
            error: serializeError(error),
            data: undefined,
        };
    }
};
