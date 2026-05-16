export const InputType = {
    SINGLE_DROP_DOWN: 1,
    SINGLE_COMBO_BOX: 2,
    FREE_TEXT_FILED: 3,
    MULTI_DROP_DOWN: 4,
    MULTI_COMBO_BOX: 5,
} as const;

export const InputValidationType = {
    VALIDATOR_NO_VALIDATE_TYPE: 0,
    VALIDATOR_INT_TYPE: 1,
    VALIDATOR_STRING_TYPE: 2,
    VALIDATOR_FLOAT_TYPE: 3,
    VALIDATOR_DATE_TYPE: 4,
} as const;

export const FormatType = {
    FORMAT_NORMAL: 1,
    FORMAT_QUANTITATIVE_WITH_UNIT: 2,
} as const;

export const DateFormatType = {
    YEAR_MONTH_DATE: 0,
    YEAR_MONTH: 1,
} as const;

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
