export type ShopeeItemBaseInfo = {
    item_id: number;
    category_id: number;
    item_name: string;
    description: string;
    item_sku: string;
    create_time: number;
    update_time: number;
    attribute_list: ItemAttributeData[];
    price_info: ItemPriceData[];
    image: ItemImageData;
    weight: string;
    dimension: ItemDimensionData;
    logistic_info: ItemLogisticData[];
    pre_order: ItemPreOrderData;
    wholesales: ItemWholesaleData[];
    condition: string;
    size_chart: string;
    item_status: string;
    has_model: boolean;
    has_promotion: boolean;
    deboost: boolean;
    brand: ItemBrandData;
    item_dangerous: number;
    gtin_code: string;
    is_fulfillment_by_shopee: boolean;
    is_kit: boolean;
    description_type: string;
    //stock_info_v2: ItemStockInfoV2Data;
};

export type ItemAttributeData = {
    attribute_id: number;
    original_attribute_name: string;
    is_mandatory: boolean;
    attribute_value_list: ItemAttributeValueData[];
};

export type ItemAttributeValueData = {
    value_id: number;
    original_value_name: string;
    value_unit: string;
};

export type ItemPriceData = {
    original_price: number;
    current_price: number;
    inflated_original_price: number;
    inflated_current_price: number;
};

export type ItemImageData = {
    image_url_list: string[];
    image_id_list: string[];
    image_ratio: string;
};

export type ItemDimensionData = {
    package_length: number;
    package_width: number;
    package_height: number;
};

export type ItemLogisticData = {
    logistic_id: number;
    logistic_name: string;
    enabled: boolean;
    shipping_fee: number;
    is_free: boolean;
};

export type ItemPreOrderData = {
    is_pre_order: boolean;
    days_to_ship: number;
};

export type ItemWholesaleData = {
    min_count: number;
    max_count: number;
    unit_price: number;
};

export type ItemBrandData = {
    brand_id: number;
    original_brand_name: string;
};
