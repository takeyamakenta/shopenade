import { getAuthSession } from "@/sessions/authSession";

export const checkLoggedIn = async (): Promise<boolean> => {
    const authSession = await getAuthSession();
    if (!authSession || !authSession.role) {
        return false;
    }
    return true;
};