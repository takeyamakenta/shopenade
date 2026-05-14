import { createStore } from "solid-js/store";

import { AuthSessionData } from "@/@types/AuthSessionData";

const [authStore, setAuthStore] = createStore<AuthSessionData>({
    uid: "",
    idToken: "",
    role: null,
    granted_previleges: [],
});

export const useAuthStore = () => {
    return { authStore, setAuthStore };
};
