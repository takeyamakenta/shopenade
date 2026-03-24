import { Company } from "@/@types/Company";
export type Role = {
    id: number;
    name: string;
    code: string;
    is_public: boolean;
    owner_company_id: number|null;
    created_at: string;
    updated_at: string;
    owner_company: Company|null;
};