import { createStore } from "solid-js/store";

import { ClientAuthData } from "@/@types/ClientAuthData";

const [authStore, setAuthStore] = createStore<{
    authData: ClientAuthData|null;
    idToken: string|null;
}>({
    authData: null,
    idToken: null,
});

export const useAuthStore = () => {
    return { authStore, setAuthStore };
};
