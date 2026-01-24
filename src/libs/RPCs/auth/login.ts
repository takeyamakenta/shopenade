import { doLogin } from "@/libs/auth/doLogin";

export const login = async (idToken: string): Promise<{ login_role_id: number, login_group_id: number }> => {
    "use server";
    
    const result = await doLogin(idToken);
    if (result.success && result.data) {
        return result.data as { login_role_id: number, login_group_id: number };
    } else if (result.success === false && "error" in result) {
        throw new Error(String(result.error) || "Login failed");
    } else {
        throw new Error("Login failed");
    }
};
