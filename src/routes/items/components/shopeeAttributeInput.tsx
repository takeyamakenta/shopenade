import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-solid";
import {
    Accessor,
    ComponentProps,
    For,
    Match,
    Show,
    Switch as SolidSwitch,
    createEffect,
    createMemo,
    createSignal,
    splitProps,
} from "solid-js";

import type { AttributeValue } from "@/@types/AttributeTreeCategory";
import { Button } from "@/components/ui/button";
import {
    Carousel,
    CarouselApi,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import { ValidatedTextField } from "@/components/ui/validated-text-field";
import { ErrorClass, Validator } from "@/libs/form/validation";

const InputType = {
    SINGLE_DROP_DOWN: 1,
    SINGLE_COMBO_BOX: 2,
    FREE_TEXT_FILED: 3,
    MULTI_DROP_DOWN: 4,
    MULTI_COMBO_BOX: 5,
} as const;

const InputValidationType = {
    VALIDATOR_NO_VALIDATE_TYPE: 0,
    VALIDATOR_INT_TYPE: 1,
    VALIDATOR_STRING_TYPE: 2,
    VALIDATOR_FLOAT_TYPE: 3,
    VALIDATOR_DATE_TYPE: 4,
} as const;

const FormatType = {
    FORMAT_NORMAL: 1,
    FORMAT_QUANTITATIVE_WITH_UNIT: 2,
} as const;

const DateFormatType = {
    YEAR_MONTH_DATE: 0,
    YEAR_MONTH: 1,
} as const;

export type ShopeeAttributeInputProps = {
    validate: (
        ref: HTMLInputElement,
        accessor: () => [
            Validator[],
            Accessor<string | number | undefined | null>,
        ]
    ) => void;
    Name: string;
    AttributeId: number;
    Mandatory: boolean;
    InputType: number;
    InputValidationType: number;
    FormatType: number;
    DateFormatType: number;
    AttributeValueList: Partial<AttributeValue>[] | undefined;
    setValue: (
        value:
            | string
            | Partial<AttributeValue>
            | Partial<AttributeValue>[]
            | null
    ) => void;
    value:
        | string
        | Partial<AttributeValue>
        | Partial<AttributeValue>[]
        | undefined;
    setErrors: (errors: Record<string, ErrorClass>) => void;
    errors: Record<string, ErrorClass>;
} & ComponentProps<"div">;

export const ShopeeAttributeInput = (props: ShopeeAttributeInputProps) => {
    const [local, others] = splitProps(props, [
        "validate",
        "Name",
        "AttributeId",
        "Mandatory",
        "InputType",
        "InputValidationType",
        "FormatType",
        "DateFormatType",
        "AttributeValueList",
        "setValue",
        "value",
    ]);

    const [attributeValueList, setAttributeValueList] = createSignal<
        Partial<AttributeValue>[]
    >(local.AttributeValueList ?? []);

    const onSelectSingleAttributeValue = (
        api: NonNullable<ReturnType<CarouselApi>>
    ) => {
        local.setValue(attributeValueList()[api.selectedScrollSnap()] ?? null);
    };

    const [
        singleAttributeValueCarouselApi,
        setSingleAttributeValueCarouselApi,
    ] = createSignal<ReturnType<CarouselApi>>();
    createEffect(() => {
        if (!singleAttributeValueCarouselApi()) {
            return;
        }
        singleAttributeValueCarouselApi()?.on(
            "select",
            onSelectSingleAttributeValue
        );
    });

    const [singleAddValueTextField, setSingleAddValueTextField] =
        createSignal<string>("");
    const [
        isFocusedSingleAddValueTextField,
        setIsFocusedSingleAddValueTextField,
    ] = createSignal<boolean>(false);
    const handleBlurSingleAddValueTextField = () => {
        setIsFocusedSingleAddValueTextField(false);
        if (singleAddValueTextField()?.trim().length > 0) {
            setAttributeValueList([
                ...attributeValueList(),
                {
                    name: singleAddValueTextField(),
                    value_id: 0,
                },
            ]);
            local.setValue(
                attributeValueList()[attributeValueList().length - 1]
            );
            singleAttributeValueCarouselApi()?.scrollTo(
                attributeValueList().length - 1
            );
        }
        setSingleAddValueTextField("");
    };

    const [multiAddValueTextField, setMultiAddValueTextField] =
        createSignal<string>("");
    const [
        isFocusedMultiAddValueTextField,
        setIsFocusedMultiAddValueTextField,
    ] = createSignal<boolean>(false);

    const handleSelectMultiAttributeValue = (
        attributeValue: Partial<AttributeValue>
    ) => {
        console.log(attributeValue);
        local.setValue([...(local.value ?? []) as Partial<AttributeValue>[], attributeValue]);
    };

    const handleSpliceSelectedMultiAttributeValue = (
        attributeValue: Partial<AttributeValue>
    ) => {
        local.setValue(((local.value ?? []) as Partial<AttributeValue>[]).filter(value => (value.value_id !== 0 && value.value_id !== attributeValue.value_id) || (value.value_id === 0 && value.name !== attributeValue.name)));
    };

    const validate = createMemo(() => local.validate);
    return (
        <div {...others}>
            <SolidSwitch>
                <Match
                    when={
                        local.InputType === InputType.SINGLE_DROP_DOWN ||
                        local.InputType === InputType.SINGLE_COMBO_BOX
                    }
                >
                    <p>{local.Name}</p>
                    <div class="relative mt-4 flex h-[48px] w-full flex-col justify-center gap-1 overflow-hidden text-sm before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-10 before:h-1 before:bg-gradient-to-b before:from-black/20 before:to-transparent before:content-[''] after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:z-10 after:h-1 after:bg-gradient-to-t after:from-black/20 after:to-transparent after:content-['']">
                        <Show when={!isFocusedSingleAddValueTextField()}>
                            <Carousel
                                orientation="vertical"
                                setApi={setSingleAttributeValueCarouselApi}
                            >
                                <CarouselContent class="h-[64px] w-full">
                                    <For each={attributeValueList()}>
                                        {(attributeValue) => (
                                            <CarouselItem class="flex h-[48px] w-full flex-row items-center justify-center gap-4">
                                                <p class="text-md text-nowrap">
                                                    {" "}
                                                    {attributeValue.name}
                                                </p>
                                            </CarouselItem>
                                        )}
                                    </For>
                                    <Show
                                        when={
                                            local.InputType ===
                                            InputType.SINGLE_COMBO_BOX
                                        }
                                    >
                                        <CarouselItem class="flex h-[48px] w-full flex-row items-center justify-center gap-4">
                                            <p class="text-md text-nowrap">
                                                <Button
                                                    variant="tertiary"
                                                    size="xs"
                                                    onClick={() =>
                                                        setIsFocusedSingleAddValueTextField(
                                                            true
                                                        )
                                                    }
                                                >
                                                    Add Value
                                                </Button>
                                            </p>
                                        </CarouselItem>
                                    </Show>
                                </CarouselContent>
                                <Show
                                    when={
                                        (attributeValueList() ?? []).length ??
                                        0 > 1
                                    }
                                >
                                    <p class="absolute right-0 top-[16px]">
                                        <ChevronsUpDownIcon class="size-4" />
                                    </p>
                                </Show>
                            </Carousel>
                        </Show>
                        <Show when={isFocusedSingleAddValueTextField()}>
                            <ValidatedTextField
                                autofocus
                                onBlur={handleBlurSingleAddValueTextField}
                                onChange={(e) =>
                                    setSingleAddValueTextField(e.target.value)
                                }
                                validate={validate()}
                                class="w-full"
                                name={local.Name}
                                type="text"
                                placeholder={local.Name}
                                required
                            />
                        </Show>
                    </div>
                </Match>
                <Match when={local.InputType === InputType.FREE_TEXT_FILED}>
                    <p>{local.Name}</p>
                    <ValidatedTextField
                        validate={validate()}
                        class="w-full"
                        name={local.Name}
                        type="text"
                        placeholder={local.Name}
                        required
                    />
                </Match>
                <Match
                    when={
                        local.InputType === InputType.MULTI_DROP_DOWN ||
                        local.InputType === InputType.MULTI_COMBO_BOX
                    }
                >
                    <p>{local.Name}</p>
                    <div class="relative mt-4 flex h-[48px] w-full flex-col gap-1 overflow-hidden text-sm before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-10 before:h-1 before:bg-gradient-to-b before:from-black/20 before:to-transparent before:content-[''] after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:z-10 after:h-1 after:bg-gradient-to-t after:from-black/20 after:to-transparent after:content-['']">
                        <Carousel orientation="vertical">
                            <CarouselContent class="h-[64px] w-full">
                                <For each={attributeValueList()}>
                                    {(attributeValue) => {
                                        // local.value(props.value)の変更を追跡し、選択状態をリアクティブに導出する
                                        const isSelected = createMemo(() =>
                                            (
                                                (local.value ?? []) as Partial<AttributeValue>[]
                                            )?.some(
                                                (value) =>
                                                    (value.value_id !== 0 &&
                                                        value.value_id ===
                                                            attributeValue.value_id) ||
                                                    (value.value_id === 0 &&
                                                        value.name ===
                                                            attributeValue.name)
                                            )
                                        );
                                        return (
                                            <CarouselItem class="flex h-[48px] w-full flex-row items-center justify-center gap-4">
                                                <Show when={isSelected()}>
                                                    <p>
                                                        <Button
                                                            size="xs"
                                                            onClick={
                                                                () =>
                                                                    handleSpliceSelectedMultiAttributeValue(
                                                                        attributeValue
                                                                    )
                                                            }
                                                        >
                                                            <XIcon class="max-w-3 max-h-3" />
                                                        </Button>
                                                    </p>
                                                </Show>
                                                <p class="text-md text-nowrap">
                                                    {" "}
                                                    {attributeValue.name}
                                                </p>
                                                <Show when={!isSelected()}>
                                                    <p>
                                                        <Button
                                                            onClick={() =>
                                                                handleSelectMultiAttributeValue(
                                                                    attributeValue
                                                                )
                                                            }
                                                            variant="primary"
                                                            size="xs"
                                                        >
                                                            Select
                                                        </Button>
                                                    </p>
                                                </Show>
                                            </CarouselItem>
                                        );
                                    }}
                                </For>
                                <Show
                                    when={
                                        local.InputType ===
                                        InputType.MULTI_COMBO_BOX
                                    }
                                >
                                    <CarouselItem class="flex h-[48px] w-full flex-row items-center justify-center gap-4">
                                        <p class="text-md text-nowrap">
                                            <Button
                                                variant="tertiary"
                                                size="xs"
                                            >
                                                Add Value
                                            </Button>
                                        </p>
                                    </CarouselItem>
                                </Show>
                            </CarouselContent>
                            <Show
                                when={
                                    (Object.values(attributeValueList() ?? [])
                                        .length ?? 0) > 1
                                }
                            >
                                <p class="absolute right-0 top-[16px]">
                                    <ChevronsUpDownIcon class="size-4" />
                                </p>
                            </Show>
                        </Carousel>
                    </div>
                </Match>
            </SolidSwitch>
        </div>
    );
};
