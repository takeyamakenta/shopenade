import { doCreateUser } from "@/libs/auth/doCreateUser";

export const createUser = async (email: string, password: string, name: string): Promise<boolean> => {
    "use server";
    const result = await doCreateUser(email, password, name);
    if (result.success) {
        return true;
    } else if (result.success === false && "error" in result) {
        throw new Error(String(result.error) || "Login failed");
    } else {
        throw new Error("Login failed");
    }
};

