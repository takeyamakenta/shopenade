import { createStore } from "solid-js/store";

import { AuthSessionData } from "@/@types/AuthSessionData";

const [authStore, setAuthStore] = createStore<AuthSessionData>({
    idToken: "",
    login_role_id: 0,
    login_role_name: "",
    login_role_code: "",
    login_role_is_public: false,
    login_role_owner_company_id: undefined,
    login_group_id: 0,
    login_group_code: "",
    login_group_is_public: false,
    login_group_owner_company_id: undefined,
});

export const useAuthStore = () => {
    return { authStore, setAuthStore };
};
