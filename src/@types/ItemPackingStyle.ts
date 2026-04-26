export type ItemPackingStyle = {
    id: number;
    key: string;
    factor_by_base_unit: number;
    factor_by_vas_unit: number;
    description: string;
    packing_width: number;
    packing_height: number;
    packing_length: number;
    length_unit_code: string;
    packing_weight: number;
    weight_unit_code: string;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
    item_id: number;
    unit_code: string;
};
