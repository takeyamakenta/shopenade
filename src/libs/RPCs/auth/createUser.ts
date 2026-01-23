import { doCreateUserWithEmailAndPassword } from "@/libs/auth/doCreateUserWithEmailAndPassword";

export const createUser = async (email: string, password: string, name: string): Promise<{ group_codes: string[] }> => {
    "use server";
    const result = await doCreateUserWithEmailAndPassword(email, password, name);
    if (result.success && result.data) {
        return result.data as { group_codes: string[] };
    } else if (result.success === false && "error" in result) {
        throw new Error(String(result.error) || "Login failed");
    } else {
        throw new Error("Login failed");
    }
};

