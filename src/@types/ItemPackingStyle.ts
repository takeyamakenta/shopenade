export type ItemPackingStyle = {
    id: number;
    key: string;
    factor_by_base_unit: number;
    factor_by_vas_unit: number;
    description: string;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
    item_id: number;
    unit_code: string;
};
