import { AuthSessionData } from "@/@types/AuthSessionData";
import { useSession } from "@/libs/session";

export const useAuthSession = async () => {
    const session = await useSession<AuthSessionData>({
        name: "auth",
        password: "secret",
    });

    return session;
};

export const getAuthSession = async () => {
    const session = await useAuthSession();
    if (Object.keys(session.data).length === 0) {
        return null;
    }
    return session.data;
};

export const updateAuthSession = async (data: Partial<AuthSessionData>) => {
    const session = await useAuthSession();
    const currentData = session.data;
    await session.update({ ...currentData, ...data });
};

export const clearAuthSession = async () => {
    const session = await useAuthSession();
    await session.clear();
};
