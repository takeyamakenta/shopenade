import { ItemPackingStyle } from "@/@types/ItemPackingStyle";
import { ItemPlatform } from "@/@types/ItemPlatform";

export type Item = {
    id: number;
    uid: string;
    pindex: number;
    status: string;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
    company_id: number;
    base_unit_code: string;
    vas_unit_code: string;
    resource_handling_id: number|null;
    default_packing_style: ItemPackingStyle|undefined;
    item_packing_styles: ItemPackingStyle[]|undefined;
    item_platforms: ItemPlatform[]|undefined;
};