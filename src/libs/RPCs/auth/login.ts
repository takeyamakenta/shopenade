import { AuthSessionData } from "@/@types/AuthSessionData";
import { doLogin } from "@/libs/auth/doLogin";

export const login = async (idToken: string): Promise<AuthSessionData> => {
    "use server";
    
    const result = await doLogin(idToken);
    if (result.success && result.data) {
        return result.data;
    } else if (result.success === false && "error" in result) {
        throw new Error(String(result.error) || "Login failed");
    } else {
        throw new Error("Login failed");
    }
};
