import { ItemPackingStyle } from "@/@types/ItemPackingStyle";
import { ItemPlatform } from "@/@types/ItemPlatform";
import { ItemSku } from "./ItemSku";
import { ItemVariant } from "./ItemVariant";

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
    default_packing_style: ItemPackingStyle|null;
    item_skus: ItemSku[]|null;
    item_packing_styles: ItemPackingStyle[]|null;
    item_platforms: ItemPlatform[]|null;
    item_variants: ItemVariant[]|null;
};