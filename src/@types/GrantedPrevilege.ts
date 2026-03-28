export type GrantedPrevilege = {
    app_id: number;
    group_id: number;
    previlege: string;
    group_code: string;
    group_is_public: boolean;
    group_owner_company_id: number | null;
};

export type EssentialPrevilege = {
    group_id: number;
    previlege: string;
};
