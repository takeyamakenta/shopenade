export type AttributeMultiLang = {
    language: string;
    value: string;
};

export type AttributeInfo = {
    input_type: number;
    input_validation_type: number;
    format_type: number;
    date_format_type: number;
    attribute_unit_list: string[];
    max_value_count: number;
    introduction: string;
    is_oem: boolean;
    support_search_value: boolean;
    multi_lang: AttributeMultiLang[] | null | undefined;
};

export type AttributeValue = {
    value_id: number;
    name: string;
    value_unit: string;
    child_attribute_list: AttributeNode[] | null | undefined;
    multi_lang: AttributeMultiLang[] | null | undefined;
};

export type AttributeNode = {
    attribute_id: number;
    mandatory: boolean;
    name: string;
    attribute_value_list: AttributeValue[];
    attribute_info: AttributeInfo;
    multi_lang: AttributeMultiLang[] | null | undefined;
};

export type AttributeTreeCategory = {
    attribute_tree: AttributeNode[];
    category_id: number;
    warning: string;
};
