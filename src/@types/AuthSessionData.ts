export type AuthSessionData = {
    idToken: string;
    login_role_id: number;
    login_role_name: string;
    login_role_code: string;
    login_role_is_public: boolean;
    login_role_owner_company_id: number|undefined;
    login_group_id: number;
    login_group_code: string;
    login_group_is_public: boolean;
    login_group_owner_company_id: number|undefined;
};

export const defaultAuthSessionData: AuthSessionData = {
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
};