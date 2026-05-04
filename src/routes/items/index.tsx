import {
    ChevronsUpDownIcon,
    StoreIcon,
    CopyIcon,
    DiffIcon,
    FilesIcon,
    LinkIcon,
    MinusIcon,
    PlusIcon,
} from "lucide-solid";
import {
    ComponentProps,
    For,
    Show,
    Suspense,
    createEffect,
    createMemo,
    createSignal,
    onMount,
    splitProps,
} from "solid-js";
import { Motion, Presence } from "solid-motionone";

import { createAsync, query } from "@solidjs/router";

import { Item } from "@/@types/Item";
import { ItemPackingStyle } from "@/@types/ItemPackingStyle";
import { ItemSku } from "@/@types/ItemSku";
import { ItemVariant } from "@/@types/ItemVariant";
import { ShopeeShopAccount } from "@/@types/ShopeeShopAccount";
import { Step, StepFormComponentProps } from "@/@types/Step";
import { ShopeeLogo } from "@/components/images/shopeeLogo";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Carousel,
    CarouselApi,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import {
    OverlaySheet,
    OverlaySheetBody,
    OverlaySheetBottomClose,
    OverlaySheetContent,
    OverlaySheetHeader,
    OverlaySheetTitle,
} from "@/components/ui/overlay-sheet";
import {
    Switch,
    SwitchControl,
    SwitchLabel,
    SwitchThumb,
} from "@/components/ui/switch";
import { showToast } from "@/components/ui/toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import NavFooter from "@/layouts/NavFooter";
import NavHeader from "@/layouts/NavHeader";
import { getItemSku } from "@/libs/RPCs/item/getItemSku";
import { getItems } from "@/libs/RPCs/item/getItems";
import { mergeVariant } from "@/libs/RPCs/item/mergeVariant";
import { setVariantStock } from "@/libs/RPCs/item/setVariantStock";
import { getShopeeShops } from "@/libs/RPCs/oauth/getShopeeShops";
import { nationalFlags } from "@/libs/const/nationalFlags";
import { hasError, serializeError } from "@/libs/error/reportError";
import { ErrorClass, Validator, useForm } from "@/libs/form/validation";
import { truncateText } from "@/libs/text/truncateText";
import CopyItemsStepper from "@/routes/items/components/copyItemsStepper";
import { resolveItemPlatform, resolveItemPackingStyle, resolveItemSku } from "@/libs/item/resolve";

const initData = query(async () => {
    "use server";
    try {
        const { success, data } = await getShopeeShops();
        const iaIdToShopMap = new Map<number, ShopeeShopAccount>();
        if (success && data) {
            data.forEach((account) => {
                if (account.shopee_shop_account) {
                    iaIdToShopMap.set(account.id, account.shopee_shop_account);
                }
            });
        }
        return iaIdToShopMap;
    } catch (error) {
        console.error(error);
        return new Map<number, ShopeeShopAccount>();
    }
}, "iaIdToShopMap");

export const route = {
    preload: () => initData(),
};

export default function Items() {
    const [items, setItems] = createSignal<Item[]>([]);
    const iaIdToShopMap = createAsync(() => initData());
    onMount(async () => {
        try {
            const { success, data } = await getItems();
            if (success && data) {
                setItems(data);
            }
        } catch (error) {
            console.error(error);
        }
    });

    onMount(async () => {});

    let portalMount: Node | undefined = undefined;

    const [isTopPanelOpen, setIsTopPanelOpen] = createSignal(false);
    const [isBottomPanelOpen, setIsBottomPanelOpen] = createSignal(false);

    const toggleTopPanel = () => {
        setIsTopPanelOpen(!isTopPanelOpen());
    };

    const closeTopPanel = () => {
        setSelectedTopItem(null);
        setSelectedTopItemPackingStyle(null);
        setSelectedTopItemSku(null);
        setSelectedTopItemVariantID(null);
        setIsTopPanelOpen(false);
    };
    const toggleBottomPanel = () => {
        setIsBottomPanelOpen(!isBottomPanelOpen());
    };

    const closeBottomPanel = () => {
        setIsBottomPanelOpen(false);
    };

    const clearSelectedTopItem = () => {
        setSelectedTopItem(null);
        setSelectedTopItemPackingStyle(null);
        setSelectedTopItemSku(null);
        setSelectedTopItemVariantID(null);
    };
    const onTopOpenChange = (open: boolean) => {
        if (!open) {
            clearSelectedTopItem();
        }
    };
    const clearSelectedBottomItem = () => {
        setSelectedBottomItem(null);
        setSelectedBottomItemPackingStyle(null);
        setSelectedBottomItemSku(null);
        setSelectedBottomItemVariantIDs([]);
    };
    const onBottomOpenChange = (open: boolean) => {
        if (!open) {
            clearSelectedBottomItem();
        }
    };

    const [selectedTopItem, setSelectedTopItem] = createSignal<Item | null>(
        null
    );
    const [selectedTopItemPackingStyle, setSelectedTopItemPackingStyle] =
        createSignal<ItemPackingStyle | null>(null);
    const [selectedTopItemSku, setSelectedTopItemSku] =
        createSignal<ItemSku | null>(null);
    const [selectedTopItemVariantID, setSelectedTopItemVariantID] =
        createSignal<number | null>(null);

    const [selectedBottomItem, setSelectedBottomItem] =
        createSignal<Item | null>(null);
    const [selectedBottomItemPackingStyle, setSelectedBottomItemPackingStyle] =
        createSignal<ItemPackingStyle | null>(null);
    const [selectedBottomItemSku, setSelectedBottomItemSku] =
        createSignal<ItemSku | null>(null);
    const [selectedBottomItemVariantIDs, setSelectedBottomItemVariantIDs] =
        createSignal<number[]>([]);
    // 選択中アイテムから「default」を除外した SKU 候補（複数 SKU 時のみフィルタ）
    const topItemSkuOptions = createMemo(() => {
        const skus = selectedTopItem()?.item_skus;
        if (!skus) return undefined;
        return skus.length > 1
            ? skus.filter((sku) => sku.hash_code !== "default")
            : skus;
    });

    const hashPackingStyle = (packingStyle: ItemPackingStyle | null | undefined) => {
        if (!packingStyle) return "";
        return `${packingStyle.packing_width}x${packingStyle.packing_height}x${packingStyle.packing_length} ${packingStyle.length_unit_code} ${packingStyle.packing_weight} ${packingStyle.weight_unit_code} ${packingStyle.factor_by_base_unit} ${packingStyle.unit_code}`;
    };

    const groupItemVariantsByPackingStyleHash = (
        itemVariants: ItemVariant[]
    ): Record<string, ItemVariant[]> => {
        const groups: Record<string, ItemVariant[]> = {};
        if (!itemVariants) return groups;
        for (const variant of itemVariants) {
            const packingStyle = resolveItemPackingStyle(items(), variant);
            if (!packingStyle) continue;
            const key = hashPackingStyle(packingStyle);
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(variant);
        }
        return groups;
    };

    const topGroupedItemVariants = createMemo(() => {
        return groupItemVariantsByPackingStyleHash(
            selectedTopItem()?.item_variants ?? []
        );
    });

    const topPackingStyleHashOptions = createMemo(() => {
        const nonVariantPackingStyleHashes = (
            selectedTopItem()?.item_packing_styles?.map((packingStyle) =>
                hashPackingStyle(packingStyle)
            ) ?? []
        ).filter(
            (hash) => !Object.keys(topGroupedItemVariants()).includes(hash)
        );
        return [
            ...Object.keys(topGroupedItemVariants()),
            ...nonVariantPackingStyleHashes,
        ];
    });

    const onSelectTopItemSku = (api: NonNullable<ReturnType<CarouselApi>>) => {
        const selectedItemSku = topItemSkuOptions()?.[api.selectedScrollSnap()];
        setSelectedTopItemSku(selectedItemSku ?? null);
        const packingStyleHash =
            topPackingStyleHashOptions()?.[api.selectedScrollSnap()];
        if (!packingStyleHash) return;
        const selectedItemPackingStyle =
            selectedTopItem()?.item_packing_styles?.find(
                (packingStyle) =>
                    hashPackingStyle(packingStyle) === packingStyleHash
            );
        setSelectedTopItemPackingStyle(selectedItemPackingStyle ?? null);
    };

    const onSelectTopItemPackingStyle = (
        api: NonNullable<ReturnType<CarouselApi>>
    ) => {
        const itemPackingStyleHash =
            topPackingStyleHashOptions()?.[api.selectedScrollSnap()];
        if (!itemPackingStyleHash) {
            console.warn("No packing style hash found");
            return;
        }
        const selectedItemPackingStyle =
            selectedTopItem()?.item_packing_styles?.find(
                (packingStyle) =>
                    hashPackingStyle(packingStyle) === itemPackingStyleHash
            );
        setSelectedTopItemPackingStyle(selectedItemPackingStyle ?? null);
    };

    const [topSkuCarouselApi, setTopSkuCarouselApi] =
        createSignal<ReturnType<CarouselApi>>();
    createEffect(() => {
        if (!topSkuCarouselApi()) {
            return;
        }
        topSkuCarouselApi()?.on("select", onSelectTopItemSku);
    });

    const [topPackingStyleCarouselApi, setTopPackingStyleCarouselApi] =
        createSignal<ReturnType<CarouselApi>>();
    createEffect(() => {
        if (!topPackingStyleCarouselApi()) {
            return;
        }
        topPackingStyleCarouselApi()?.on("select", onSelectTopItemPackingStyle);
    });

    // 選択中アイテムから「default」を除外した SKU 候補（複数 SKU 時のみフィルタ）
    const bottomItemSkuOptions = createMemo(() => {
        const skus = selectedBottomItem()?.item_skus;
        if (!skus) return undefined;
        return skus.length > 1
            ? skus.filter((sku) => sku.hash_code !== "default")
            : skus;
    });

    const bottomGroupedItemVariants = createMemo(() => {
        return groupItemVariantsByPackingStyleHash(
            selectedBottomItem()?.item_variants ?? []
        );
    });

    const bottomPackingStyleHashOptions = createMemo(() => {
        return Object.keys(bottomGroupedItemVariants());
    });

    const onSelectBottomItemSku = (
        api: NonNullable<ReturnType<CarouselApi>>
    ) => {
        const selectedItemSku =
            bottomItemSkuOptions()?.[api.selectedScrollSnap()];
        setSelectedBottomItemSku(selectedItemSku ?? null);
        const packingStyleHash =
            bottomPackingStyleHashOptions()?.[api.selectedScrollSnap()];
        if (!packingStyleHash) return;
        const selectedItemPackingStyle =
            selectedBottomItem()?.item_packing_styles?.find(
                (packingStyle) =>
                    hashPackingStyle(packingStyle) === packingStyleHash
            );
        setSelectedBottomItemPackingStyle(selectedItemPackingStyle ?? null);
    };

    const onSelectBottomItemPackingStyle = (
        api: NonNullable<ReturnType<CarouselApi>>
    ) => {
        const itemPackingStyleHash =
            bottomPackingStyleHashOptions()?.[api.selectedScrollSnap()];
        if (!itemPackingStyleHash) {
            console.warn("No packing style hash found");
            return;
        }
        const selectedItemPackingStyle =
            selectedBottomItem()?.item_packing_styles?.find(
                (packingStyle) =>
                    hashPackingStyle(packingStyle) === itemPackingStyleHash
            );
        setSelectedBottomItemPackingStyle(selectedItemPackingStyle ?? null);
    };

    const [bottomSkuCarouselApi, setBottomSkuCarouselApi] =
        createSignal<ReturnType<CarouselApi>>();
    createEffect(() => {
        if (!bottomSkuCarouselApi()) {
            return;
        }
        bottomSkuCarouselApi()?.on("select", onSelectBottomItemSku);
    });

    const [bottomPackingStyleCarouselApi, setBottomPackingStyleCarouselApi] =
        createSignal<ReturnType<CarouselApi>>();
    createEffect(() => {
        if (!bottomPackingStyleCarouselApi()) {
            return;
        }
        bottomPackingStyleCarouselApi()?.on(
            "select",
            onSelectBottomItemPackingStyle
        );
    });

    const isItemMergeable = createMemo(() => {
        return (
            selectedTopItemPackingStyle() &&
            selectedBottomItemVariantIDs()?.length > 0
        );
    });

    const selectedTopItemVariant = createMemo(() => {
        return selectedTopItem()?.item_variants?.find(
            (variant) => variant.id === selectedTopItemVariantID()
        );
    });

    const selectedTopItemPlatform = createMemo(() => {
        if (!selectedTopItemVariant()) {
            return undefined;
        }
        return resolveItemPlatform(items(), selectedTopItemVariant() as ItemVariant);
    });

    const [isQuantityChangeDrawerOpen, setIsQuantityChangeDrawerOpen] =
        createSignal(false);

    const handleMergeVariant = async (): Promise<void> => {
        try {
            if (
                !selectedTopItem() ||
                !selectedTopItemPackingStyle() ||
                !selectedTopItemSku() ||
                !selectedBottomItemVariantIDs()?.length
            ) {
                throw new Error("選択中のアイテムが存在しません");
            }
            const { success, error, data } = await mergeVariant(
                selectedTopItem()?.id as number,
                selectedTopItemPackingStyle()?.id as number,
                selectedTopItemSku()?.id as number,
                selectedBottomItemVariantIDs() as number[]
            );
            if (success) {
                showToast({
                    title: "アイテムをマージしました",
                    description: "アイテムをマージしました",
                    variant: "success",
                });

                if (data) {
                    const mergedItem = data.merged_item;
                    const splicedItem = data.spliced_item;
                    // アイテム一覧を更新
                    const itemsCopy = [...items()];
                    const mergedItemIndex = itemsCopy.findIndex(
                        (item) => item.id === mergedItem.id
                    );
                    if (mergedItemIndex !== -1) {
                        itemsCopy[mergedItemIndex] = mergedItem;
                    }
                    const splicedItemIndex = itemsCopy.findIndex(
                        (item) => item.id === splicedItem.id
                    );
                    if (splicedItemIndex !== -1) {
                        itemsCopy[splicedItemIndex] = splicedItem;
                    }
                    setItems(itemsCopy);
                    setSelectedTopItem(mergedItem);
                    setSelectedBottomItem(splicedItem);
                }

                return;
            } else {
                throw new Error(error ?? "Failed to merge variant");
            }
        } catch (error) {
            showToast({
                title: "エラーが発生しました",
                description: serializeError(error),
                variant: "error",
            });
        }
    };

    const [originalSelectedTopItemSku, setOriginalSelectedTopItemSku] =
        createSignal<ItemSku | null>(null);

    const [showNonVariantItems, setShowNonVariantItems] = createSignal(false);
    const toggleShowNonVariantItems = () => {
        setShowNonVariantItems(!showNonVariantItems());
    };

    const ItemSkuImageCarousel = (
        props: ComponentProps<"div"> & { itemSku: ItemSku | null }
    ) => {
        const [local, others] = splitProps(props, ["class"]);
        return (
            <Show when={props.itemSku?.images?.length ?? 0 > 0}>
                <Carousel class={local.class} {...others}>
                    <CarouselContent>
                        <For each={props.itemSku?.images ?? []}>
                            {(image) => (
                                <CarouselItem>
                                    <img
                                        src={image.image_url}
                                        alt={image.image_id}
                                    />
                                </CarouselItem>
                            )}
                        </For>
                    </CarouselContent>
                </Carousel>
            </Show>
        );
    };

    const [isCopyTopPanelOpen, setIsCopyTopPanelOpen] = createSignal(false);
    const [isCopyBottomPanelOpen, setIsCopyBottomPanelOpen] =
        createSignal(false);

    const [toCopyItemVariant, setToCopyItemVariant] =
        createSignal<ItemVariant | null>(null);

    const handleClickCopyItem = (itemVariant: ItemVariant) => {
        setToCopyItemVariant(itemVariant);
        closeTopPanel();
        closeBottomPanel();
        setIsCopyTopPanelOpen(true);
        setIsCopyBottomPanelOpen(true);
    };

    const TopPanel = () => {
        return (
            <>
                <OverlaySheetHeader>
                    <OverlaySheetTitle>
                        {selectedTopItem()?.item_platforms?.[0]?.shopee_item
                            ?.item_name ?? selectedTopItem()?.id}{" "}
                        {selectedTopItem()?.item_platforms?.length &&
                        (selectedTopItem()?.item_platforms?.length ?? 0) > 1
                            ? "..."
                            : ""}
                    </OverlaySheetTitle>
                </OverlaySheetHeader>
                <OverlaySheetBody class="h-fit w-full flex-col gap-2">
                    <div class="justify-satrt flex h-fit flex-row items-center gap-4">
                        <div class="flex h-[96px] w-3/4 flex-col items-center justify-center gap-4">
                            <div class="flex h-[96px] w-full flex-col items-center justify-start gap-4 text-sm">
                                <Show when={selectedTopItem()}>
                                    <div class="relative flex h-[32px] w-full flex-col gap-1 overflow-hidden text-sm before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-10 before:h-1 before:bg-gradient-to-b before:from-black/20 before:to-transparent before:content-[''] after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:z-10 after:h-1 after:bg-gradient-to-t after:from-black/20 after:to-transparent after:content-['']">
                                        <Carousel
                                            orientation="vertical"
                                            setApi={setTopSkuCarouselApi}
                                        >
                                            <CarouselContent class="h-[48px] w-full">
                                                <For each={topItemSkuOptions()}>
                                                    {(sku) => {
                                                        const isNonVariantSku =
                                                            !selectedTopItem()?.item_variants?.some(
                                                                (variant) =>
                                                                    variant.item_sku_id ===
                                                                    sku.id
                                                            );
                                                        return (
                                                            <>
                                                                <Show
                                                                    when={
                                                                        isNonVariantSku
                                                                    }
                                                                >
                                                                    <CarouselItem class="flex h-[32px] w-full flex-row items-center justify-center text-gray-500">
                                                                        <p>
                                                                            {
                                                                                sku.hash_code
                                                                            }
                                                                        </p>
                                                                    </CarouselItem>
                                                                </Show>
                                                                <Show
                                                                    when={
                                                                        !isNonVariantSku
                                                                    }
                                                                >
                                                                    <CarouselItem class="flex h-[32px] w-full flex-row items-center justify-center">
                                                                        <p class="text-md">
                                                                            {
                                                                                sku.hash_code
                                                                            }
                                                                        </p>
                                                                    </CarouselItem>
                                                                </Show>
                                                            </>
                                                        );
                                                    }}
                                                </For>
                                            </CarouselContent>
                                            <Show
                                                when={
                                                    (topItemSkuOptions()
                                                        ?.length ?? 0) > 1
                                                }
                                            >
                                                <p class="absolute right-0 top-[8px]">
                                                    <ChevronsUpDownIcon class="size-4" />
                                                </p>
                                            </Show>
                                        </Carousel>
                                    </div>
                                </Show>
                                <Show when={selectedTopItemSku()}>
                                    <div class="relative flex h-[32px] w-full flex-col gap-1 overflow-hidden text-sm before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-10 before:h-1 before:bg-gradient-to-b before:from-black/20 before:to-transparent before:content-[''] after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:z-10 after:h-1 after:bg-gradient-to-t after:from-black/20 after:to-transparent after:content-['']">
                                        <Carousel
                                            orientation="vertical"
                                            setApi={
                                                setTopPackingStyleCarouselApi
                                            }
                                        >
                                            <CarouselContent class="h-[48px] w-full">
                                                <For
                                                    each={topPackingStyleHashOptions()}
                                                >
                                                    {(packingStyleHash) => {
                                                        const isNonVariantPackingStyle =
                                                            !Object.keys(
                                                                topGroupedItemVariants()
                                                            ).includes(
                                                                packingStyleHash
                                                            );
                                                        return (
                                                            <>
                                                                <Show
                                                                    when={
                                                                        isNonVariantPackingStyle
                                                                    }
                                                                >
                                                                    <CarouselItem class="flex h-[32px] w-full flex-row items-center justify-center text-gray-500">
                                                                        <p>
                                                                            {
                                                                                "📦"
                                                                            }{" "}
                                                                            {
                                                                                packingStyleHash
                                                                            }
                                                                        </p>
                                                                    </CarouselItem>
                                                                </Show>
                                                                <Show
                                                                    when={
                                                                        !isNonVariantPackingStyle
                                                                    }
                                                                >
                                                                    <CarouselItem class="flex h-[32px] w-full flex-row items-center justify-center">
                                                                        <p>
                                                                            {
                                                                                "📦"
                                                                            }{" "}
                                                                            {
                                                                                packingStyleHash
                                                                            }
                                                                        </p>
                                                                    </CarouselItem>
                                                                </Show>
                                                            </>
                                                        );
                                                    }}
                                                </For>
                                            </CarouselContent>
                                        </Carousel>
                                        <Show
                                            when={
                                                (topPackingStyleHashOptions()
                                                    ?.length ?? 0) > 1
                                            }
                                        >
                                            <p class="absolute right-0 top-[8px]">
                                                <ChevronsUpDownIcon class="size-4" />
                                            </p>
                                        </Show>
                                    </div>
                                </Show>
                            </div>
                        </div>
                        <div class="flex h-full max-h-[96px] w-1/4 max-w-[96px] items-center justify-center">
                            <ItemSkuImageCarousel
                                class="h-full w-full"
                                itemSku={selectedTopItemSku()}
                            />
                        </div>
                    </div>
                    <div class="flex h-fit w-full flex-row items-center justify-center gap-1">
                        <Show when={selectedTopItemPackingStyle()}>
                            <ToggleGroup
                                multiple={false}
                                orientation="vertical"
                                class="flex w-full flex-col gap-1 overflow-y-auto"
                                value={
                                    selectedTopItemVariantID()?.toString() ??
                                    null
                                }
                            >
                                <For
                                    each={(
                                        topGroupedItemVariants()[
                                            hashPackingStyle(
                                                selectedTopItemPackingStyle() as ItemPackingStyle
                                            )
                                        ] ?? []
                                    ).filter(
                                        (variant) =>
                                            variant.item_sku_id ===
                                            selectedTopItemSku()?.id
                                    )}
                                >
                                    {(variant) => {
                                        const itemPlatformIDs =
                                            selectedTopItem()?.item_platforms?.map(
                                                (platform) => platform.id
                                            );
                                        const isOriginalItemPlatform =
                                            itemPlatformIDs?.includes(
                                                variant.item_platform_id
                                            );
                                        return (
                                            <>
                                                <ToggleGroupItem
                                                    class="flex w-full flex-row items-center justify-start gap-1"
                                                    value={variant.id.toString()}
                                                >
                                                    <div class="w-[20px]">
                                                        <ShopeeLogo />
                                                    </div>
                                                    <div class="flex w-full flex-row items-center">
                                                        <div class="w-[calc(100%-124px)] text-nowrap text-left">
                                                            {nationalFlags[
                                                                iaIdToShopMap()?.get(
                                                                    resolveItemPlatform(
                                                                        items(),
                                                                        variant
                                                                    )
                                                                        ?.integration_account_id ??
                                                                        0
                                                                )
                                                                    ?.region as keyof typeof nationalFlags
                                                            ] ?? "Unknown"}
                                                            {truncateText(
                                                                iaIdToShopMap()?.get(
                                                                    resolveItemPlatform(
                                                                        items(),
                                                                        variant
                                                                    )
                                                                        ?.integration_account_id ??
                                                                        0
                                                                )?.shop_name ??
                                                                    "unknown shop",
                                                                12
                                                            )}
                                                        </div>
                                                        <div class="w-[56px] text-right">
                                                            {variant
                                                                .sellable_inventory
                                                                ?.on_hand ??
                                                                "N/A"}{" "}
                                                            {variant
                                                                .sellable_inventory
                                                                ?.unit_code ??
                                                                ""}
                                                        </div>
                                                        <div class="inline-flex w-[32px] flex-col items-center justify-end text-right">
                                                            <Button
                                                                size="xs"
                                                                onClick={() => {
                                                                    setSelectedTopItemVariantID(
                                                                        variant.id
                                                                    );
                                                                    setIsQuantityChangeDrawerOpen(
                                                                        true
                                                                    );
                                                                }}
                                                            >
                                                                <DiffIcon class="max-h-3 max-w-3" />
                                                            </Button>
                                                        </div>
                                                        <div class="inline-flex w-[32px] flex-col items-center justify-end text-right">
                                                            <Show
                                                                when={
                                                                    isOriginalItemPlatform
                                                                }
                                                            >
                                                                <Button
                                                                    size="xs"
                                                                    onClick={() =>
                                                                        handleClickCopyItem(
                                                                            variant
                                                                        )
                                                                    }
                                                                >
                                                                    <FilesIcon class="max-h-3 max-w-3" />
                                                                </Button>
                                                            </Show>
                                                        </div>
                                                    </div>
                                                </ToggleGroupItem>
                                            </>
                                        );
                                    }}
                                </For>
                            </ToggleGroup>
                        </Show>
                    </div>
                </OverlaySheetBody>
                <OverlaySheetBottomClose onClick={closeTopPanel}>
                    {"Close"}
                </OverlaySheetBottomClose>
            </>
        );
    };

    const BottomPanel = () => {
        return (
            <>
                <OverlaySheetHeader>
                    <OverlaySheetTitle>
                        {selectedBottomItem()?.item_platforms?.[0]?.shopee_item
                            ?.item_name ?? selectedBottomItem()?.id}{" "}
                        {selectedBottomItem()?.item_platforms?.length &&
                        (selectedBottomItem()?.item_platforms?.length ?? 0) > 1
                            ? "..."
                            : ""}
                    </OverlaySheetTitle>
                </OverlaySheetHeader>
                <OverlaySheetBody class="h-fit w-full flex-col gap-2">
                    <div class="justify-satrt flex h-fit flex-row items-center gap-4">
                        <div class="flex h-[96px] w-3/4 flex-col items-center justify-center gap-4">
                            <div class="flex h-[96px] w-full flex-col items-center justify-start gap-4 text-sm">
                                <Show when={selectedBottomItem()}>
                                    <div class="relative flex h-[32px] w-full flex-col gap-1 overflow-hidden text-sm before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-10 before:h-1 before:bg-gradient-to-b before:from-black/20 before:to-transparent before:content-[''] after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:z-10 after:h-1 after:bg-gradient-to-t after:from-black/20 after:to-transparent after:content-['']">
                                        <Carousel
                                            orientation="vertical"
                                            setApi={setBottomSkuCarouselApi}
                                        >
                                            <CarouselContent class="h-[48px] w-full">
                                                <For
                                                    each={bottomItemSkuOptions()}
                                                >
                                                    {(sku) => (
                                                        <CarouselItem class="flex h-[32px] w-full flex-row items-center justify-center">
                                                            <p class="text-md">
                                                                {sku.hash_code}
                                                            </p>
                                                        </CarouselItem>
                                                    )}
                                                </For>
                                            </CarouselContent>
                                            <Show
                                                when={
                                                    (bottomItemSkuOptions()
                                                        ?.length ?? 0) > 1
                                                }
                                            >
                                                <p class="absolute right-0 top-[8px]">
                                                    <ChevronsUpDownIcon class="size-4" />
                                                </p>
                                            </Show>
                                        </Carousel>
                                    </div>
                                </Show>
                                <Show when={selectedBottomItemSku()}>
                                    <div class="relative flex h-[32px] w-full flex-col gap-1 overflow-hidden text-sm before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-10 before:h-1 before:bg-gradient-to-b before:from-black/20 before:to-transparent before:content-[''] after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:z-10 after:h-1 after:bg-gradient-to-t after:from-black/20 after:to-transparent after:content-['']">
                                        <Carousel
                                            orientation="vertical"
                                            setApi={
                                                setBottomPackingStyleCarouselApi
                                            }
                                        >
                                            <CarouselContent class="h-[48px] w-full">
                                                <For
                                                    each={Object.keys(
                                                        bottomGroupedItemVariants()
                                                    )}
                                                >
                                                    {(packingStyleHash) => (
                                                        <CarouselItem class="flex h-[32px] w-full flex-row items-center justify-center">
                                                            <p>
                                                                {"📦"}{" "}
                                                                {
                                                                    packingStyleHash
                                                                }
                                                            </p>
                                                        </CarouselItem>
                                                    )}
                                                </For>
                                            </CarouselContent>
                                        </Carousel>
                                        <Show
                                            when={
                                                (Object.keys(
                                                    bottomGroupedItemVariants()
                                                )?.length ?? 0) > 1
                                            }
                                        >
                                            <p class="absolute right-0 top-[8px]">
                                                <ChevronsUpDownIcon class="size-4" />
                                            </p>
                                        </Show>
                                    </div>
                                </Show>
                            </div>
                        </div>
                        <div class="flex h-full max-h-[96px] w-1/4 max-w-[96px] items-center justify-center">
                            <ItemSkuImageCarousel
                                class="h-full w-full"
                                itemSku={selectedBottomItemSku()}
                            />
                        </div>
                    </div>
                    <div class="flex h-fit flex-row items-center justify-center gap-1">
                        <Show when={selectedBottomItemPackingStyle()}>
                            <ToggleGroup
                                multiple={true}
                                orientation="vertical"
                                class="flex flex-col gap-1 overflow-y-auto"
                                onChange={(values) =>
                                    setSelectedBottomItemVariantIDs(
                                        (values as string[]).map(Number)
                                    )
                                }
                            >
                                <For
                                    each={(
                                        bottomGroupedItemVariants()[
                                            hashPackingStyle(
                                                selectedBottomItemPackingStyle() as ItemPackingStyle
                                            )
                                        ] ?? []
                                    ).filter(
                                        (variant) =>
                                            variant.item_sku_id ===
                                            selectedBottomItemSku()?.id
                                    )}
                                >
                                    {(variant) => (
                                        <>
                                            <ToggleGroupItem
                                                class="flex w-full flex-row items-center justify-start gap-1"
                                                value={variant.id.toString()}
                                            >
                                                <div class="w-[24px]">
                                                    <ShopeeLogo />
                                                </div>
                                                <div class="flex w-[calc(100%-24px)] flex-row items-center">
                                                    <div class="w-[calc(100%-64px)] text-nowrap text-left">
                                                        {nationalFlags[
                                                            iaIdToShopMap()?.get(
                                                                resolveItemPlatform(
                                                                    items(),
                                                                    variant
                                                                )
                                                                    ?.integration_account_id ??
                                                                    0
                                                            )
                                                                ?.region as keyof typeof nationalFlags
                                                        ] ?? "Unknown"}
                                                        {truncateText(
                                                            iaIdToShopMap()?.get(
                                                                resolveItemPlatform(
                                                                    items(),
                                                                    variant
                                                                )
                                                                    ?.integration_account_id ??
                                                                    0
                                                            )?.shop_name ??
                                                                "unknown shop",
                                                            10
                                                        )}
                                                    </div>
                                                    <div class="w-[64px] text-right">
                                                        {variant
                                                            .sellable_inventory
                                                            ?.on_hand ??
                                                            "N/A"}{" "}
                                                        {variant
                                                            .sellable_inventory
                                                            ?.unit_code ?? ""}
                                                    </div>
                                                </div>
                                            </ToggleGroupItem>
                                        </>
                                    )}
                                </For>
                            </ToggleGroup>
                        </Show>
                    </div>
                </OverlaySheetBody>
                <OverlaySheetBottomClose onClick={closeBottomPanel}>
                    Close
                </OverlaySheetBottomClose>
            </>
        );
    };

    const handleCardClick = (item: Item) => {
        if (!isTopPanelOpen()) {
            setSelectedTopItem(item);
            setSelectedTopItemSku(topItemSkuOptions()?.[0] ?? null);
            const packingStyleHash = topPackingStyleHashOptions()?.[0];
            if (!packingStyleHash) return;
            const selectedItemPackingStyle =
                selectedTopItem()?.item_packing_styles?.find(
                    (packingStyle) =>
                        hashPackingStyle(packingStyle) === packingStyleHash
                );
            setSelectedTopItemPackingStyle(selectedItemPackingStyle ?? null);
            setIsTopPanelOpen(true);
        } else if (!isBottomPanelOpen()) {
            setSelectedBottomItem(item);
            setSelectedBottomItemSku(bottomItemSkuOptions()?.[0] ?? null);
            const packingStyleHash = bottomPackingStyleHashOptions()?.[0];
            if (!packingStyleHash) {
                setIsBottomPanelOpen(true);
                return;
            }
            const selectedItemPackingStyle =
                selectedBottomItem()?.item_packing_styles?.find(
                    (packingStyle) =>
                        hashPackingStyle(packingStyle) === packingStyleHash
                );
            setSelectedBottomItemPackingStyle(selectedItemPackingStyle ?? null);
            setIsBottomPanelOpen(true);
        }
    };

    const closeCopyPanels = () => {
        setIsCopyTopPanelOpen(false);
        setIsCopyBottomPanelOpen(false);
    };

    const [copyItemCurrentStep, setCopyItemCurrentStep] =
        createSignal<number>(0);
    const [copyItemErrorMessage, setCopyItemErrorMessage] =
        createSignal<string>("");
    const [copyItemSteps, setCopyItemSteps] = createSignal<Step[]>([
        {
            title: "店舗選択",
            description: "コピー先の店舗を選択してください",
            icon: StoreIcon,
            stepFormComponent: (props: StepFormComponentProps) => {
                const [local, others] = splitProps(props, [
                    "currentStep",
                    "setCurrentStep",
                    "stepAttributes",
                    "setStepAttributes",
                    "setErrors",
                ]);

                const { formSubmit, errors, validate } = useForm({
                    errorClass: "error",
                });

                const handleNext = (fields: Record<string, unknown>) => {
                    if (hasError(errors)) {
                        local.setErrors(errors);
                        return;
                    }
                    local.setStepAttributes({
                        ...local.stepAttributes,
                        ...fields,
                    });
                    local.setCurrentStep(local.currentStep + 1);
                };

                const validators: Validator[] = [
                    async (element: HTMLInputElement) => {
                        return element.value === "1"
                            ? "Invalid value"
                            : undefined;
                    },
                ];

                createEffect(() => {
                    local.setErrors(errors);
                    console.log("errors", errors);
                });

                const [
                    selectedIntegrationAccountId,
                    setSelectedIntegrationAccountId,
                ] = createSignal<number | null>(null);

                const onSelectIntegrationAccountId = (
                    api: NonNullable<ReturnType<CarouselApi>>
                ) => {
                    setSelectedIntegrationAccountId(api.selectedScrollSnap());
                };

                const [
                    integrationAccountIdCarouselApi,
                    setIntegrationAccountIdCarouselApi,
                ] = createSignal<ReturnType<CarouselApi>>();

                createEffect(() => {
                    if (!integrationAccountIdCarouselApi()) {
                        return;
                    }
                    integrationAccountIdCarouselApi()?.on(
                        "select",
                        onSelectIntegrationAccountId
                    );
                });

                const toCopyItemPlatform = resolveItemPlatform(items(), toCopyItemVariant() as ItemVariant);

                return (
                    <form
                        class="flex w-full flex-col items-center gap-4"
                        // @ts-expect-error formSubmit is not a valid prop
                        use:formSubmit={handleNext}
                    >
                        <div class="relative flex h-[32px] w-full flex-col gap-1 overflow-hidden text-sm before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-10 before:h-1 before:bg-gradient-to-b before:from-black/20 before:to-transparent before:content-[''] after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:z-10 after:h-1 after:bg-gradient-to-t after:from-black/20 after:to-transparent after:content-['']">
                            <Carousel
                                orientation="vertical"
                                setApi={setIntegrationAccountIdCarouselApi}
                            >
                                <CarouselContent class="h-[48px] w-full">
                                    <For
                                        each={Array.from(
                                            iaIdToShopMap()?.values() ?? []
                                        ).filter((shop) => shop.integration_account_id !== toCopyItemPlatform?.integration_account_id)}
                                    >
                                        {(shop) => (
                                            <CarouselItem class="flex h-[32px] w-full flex-row items-center justify-center">
                                                <p class="text-md text-nowrap"> {nationalFlags[shop.region as keyof typeof nationalFlags] ?? "❓"} {truncateText(shop.shop_name ?? "unknown shop", 10)}</p>
                                            </CarouselItem>
                                        )}
                                    </For>
                                </CarouselContent>
                                <Show
                                    when={
                                        (Object.values(iaIdToShopMap() ?? {})
                                            .length ?? 0) > 1
                                    }
                                >
                                    <p class="absolute right-0 top-[8px]">
                                        <ChevronsUpDownIcon class="size-4" />
                                    </p>
                                </Show>
                            </Carousel>
                        </div>
                        <input
                            // @ts-expect-error this is a solid-js componen
                            use:validate={[validators, () => undefined]}
                            class="w-full"
                            name="integration_account_id"
                            type="hidden"
                            value={
                                selectedIntegrationAccountId()?.toString() ?? ""
                            }
                            required
                        />
                        <p>{errors.integration_account_id as string}</p>
                        <Button type="submit">Next</Button>
                    </form>
                );
            },
        },
        {
            title: "Copy Item2",
            description: "Copy the item to the selected item2",
            icon: CopyIcon,
            stepFormComponent: (props: StepFormComponentProps) => {
                const [local, others] = splitProps(props, [
                    "currentStep",
                    "setCurrentStep",
                    "stepAttributes",
                    "setStepAttributes",
                    "setErrors",
                ]);

                const { formSubmit, errors, validate } = useForm({
                    errorClass: "error",
                });

                createEffect(() => {
                    local.setErrors(errors);
                });

                const handleNext = (fields: Record<string, unknown>) => {
                    if (hasError(errors)) {
                        local.setErrors(errors);
                        return;
                    }
                    local.setStepAttributes({
                        ...local.stepAttributes,
                        ...fields,
                    });
                    console.log(local.stepAttributes);
                    local.setCurrentStep(local.currentStep + 1);
                };

                const validators: Validator[] = [
                    async (element: HTMLInputElement) => {
                        return element.value === "1"
                            ? "Invalid value"
                            : undefined;
                    },
                ];

                return (
                    <>
                        <p>Copy Item2</p>
                    </>
                );
            },
        },
    ]);

    const currentCopyItemStep = createMemo(() => {
        return copyItemSteps()[copyItemCurrentStep()];
    });

    const [copyItemStepAttributes, setCopyItemStepAttributes] = createSignal<
        Record<string, unknown>
    >({});

    const [copyItemStepErrors, setCopyItemStepErrors] = createSignal<
        Record<string, ErrorClass>
    >({});

    const CopyItemTopPanel = () => {
        return (
            <OverlaySheetBody class="h-fit w-full flex-col gap-2 text-sm items-center justify-center">
                <div class="justify-satrt flex h-fit flex-row items-center justify-between gap-4">
                    <div class="flex h-full w-2/3 flex-col items-start justify-center gap-1">
                        <p class="text-sm">{"📛"} {resolveItemPlatform(items(), toCopyItemVariant() as ItemVariant)?.shopee_item?.item_name}</p>
                        <p class="text-sm">{"🍬"} {resolveItemSku(items(), toCopyItemVariant() as ItemVariant)?.hash_code}</p>
                        <p class="text-sm">{"📦"} {hashPackingStyle(resolveItemPackingStyle(items(), toCopyItemVariant() as ItemVariant) as ItemPackingStyle)}</p>
                    </div>
                    <div class="flex h-full w-1/3 flex-col items-start justify-center gap-1">
                        <ItemSkuImageCarousel 
                            class="max-h-[64px] max-w-[64px] w-full"
                            itemSku={resolveItemSku(items(), toCopyItemVariant() as ItemVariant)}
                        />
                    </div>
                </div>
                <p class="w-full text-right text-nowrap flex flex-row items-center justify-end gap-1">を別店舗にコピーします<CopyIcon class="size-4" /></p>
            </OverlaySheetBody>
        );
    };

    const ItemsSection = () => {
        return (
            <div class="relative h-full w-full overflow-hidden">
                <section
                    class="flex h-full max-h-[calc(100vh-7.2rem)] flex-col items-center overflow-y-auto px-4 py-4"
                    ref={(el) => (portalMount = el)}
                >
                    <div class="flex h-fit w-full flex-row items-center justify-start px-1 py-2">
                        <Switch
                            checked={showNonVariantItems()}
                            onChange={toggleShowNonVariantItems}
                            class="flex items-center space-x-2"
                        >
                            <SwitchControl>
                                <SwitchThumb />
                            </SwitchControl>
                            <SwitchLabel>
                                {showNonVariantItems()
                                    ? "店舗アイテムがないアイテムを表示"
                                    : "店舗アイテムがないアイテムを表示しない"}
                            </SwitchLabel>
                        </Switch>
                    </div>
                    <div class="mb-8 flex h-full w-full max-w-md flex-col gap-4">
                        {/* 上部パネルが開いている時、要素が隠れてクリックできないようにしないためのダミー要素 */}
                        {/* Presence + Motion で出現/消失をシームレスにトランジションする */}
                        <Presence>
                            <Show when={isTopPanelOpen()}>
                                <Motion.div
                                    class="w-full overflow-hidden"
                                    initial={{
                                        height: 0,
                                        minHeight: 0,
                                        opacity: 0,
                                    }}
                                    animate={{
                                        height: "40vh",
                                        minHeight: "40vh",
                                        opacity: 0,
                                    }}
                                    exit={{
                                        height: 0,
                                        minHeight: 0,
                                        opacity: 0,
                                    }}
                                    transition={{
                                        duration: 0.3,
                                        easing: "ease-out",
                                    }}
                                />
                            </Show>
                        </Presence>
                        <For each={items()}>
                            {(item) => {
                                const isNonVariantItem =
                                    !item.item_variants?.length;
                                return (
                                    <>
                                        <Show
                                            when={
                                                selectedTopItem()?.id !==
                                                    item.id &&
                                                selectedBottomItem()?.id !==
                                                    item.id &&
                                                (showNonVariantItems() ||
                                                    !isNonVariantItem)
                                            }
                                        >
                                            <Card
                                                onClick={() => {
                                                    handleCardClick(item);
                                                }}
                                            >
                                                <CardHeader>
                                                    <CardTitle
                                                        class={
                                                            isNonVariantItem
                                                                ? "text-gray-500"
                                                                : ""
                                                        }
                                                    >
                                                        {item
                                                            .item_platforms?.[0]
                                                            ?.shopee_item
                                                            ?.item_name ??
                                                            item.id}{" "}
                                                        {item.item_platforms
                                                            ?.length &&
                                                        item.item_platforms
                                                            ?.length > 1
                                                            ? "..."
                                                            : ""}
                                                    </CardTitle>
                                                    <CardDescription>
                                                        UID: {item.uid}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <Show
                                                        when={
                                                            Object.keys(
                                                                groupItemVariantsByPackingStyleHash(
                                                                    item.item_variants ??
                                                                        []
                                                                )
                                                            ).length > 0
                                                        }
                                                    >
                                                        <For
                                                            each={Object.entries(
                                                                groupItemVariantsByPackingStyleHash(
                                                                    item.item_variants ??
                                                                        []
                                                                )
                                                            )}
                                                        >
                                                            {([
                                                                packingStyleHash,
                                                                itemVariants,
                                                            ]) => {
                                                                return (
                                                                    <div class="flex flex-col gap-1 text-sm">
                                                                        <div class="flex flex-col items-end gap-1">
                                                                            <p>
                                                                                {
                                                                                    "📦"
                                                                                }{" "}
                                                                                {
                                                                                    packingStyleHash
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                        <For
                                                                            each={
                                                                                itemVariants
                                                                            }
                                                                        >
                                                                            {(
                                                                                itemVariant
                                                                            ) => {
                                                                                const shop =
                                                                                    iaIdToShopMap()?.get(
                                                                                        itemVariant.integration_account_id
                                                                                    );
                                                                                return (
                                                                                    <div class="flex flex-row items-center justify-start gap-2 text-sm">
                                                                                        <p class="w-[20px]">
                                                                                            <ShopeeLogo />
                                                                                        </p>
                                                                                        <div class="flex w-[calc(100%-20px)] flex-row items-center justify-start gap-1">
                                                                                            <p class="w-[36%] text-nowrap text-center align-middle text-sm">
                                                                                                {" "}
                                                                                                {
                                                                                                    nationalFlags[
                                                                                                        shop?.region as keyof typeof nationalFlags
                                                                                                    ]
                                                                                                }{" "}
                                                                                                {truncateText(
                                                                                                    shop?.shop_name ??
                                                                                                        "unknown shop",
                                                                                                    8
                                                                                                )}
                                                                                            </p>
                                                                                            <p class="w-[40%] text-nowrap text-center align-middle text-sm">
                                                                                                {truncateText(
                                                                                                    resolveItemSku(
                                                                                                        items(),
                                                                                                        itemVariant
                                                                                                    )
                                                                                                        ?.hash_code ??
                                                                                                        "unknown sku",
                                                                                                    8
                                                                                                )}
                                                                                            </p>
                                                                                            <p class="w-[24%] text-nowrap text-center align-middle text-sm">
                                                                                                {itemVariant
                                                                                                    .sellable_inventory
                                                                                                    ?.on_hand ??
                                                                                                    "N/A"}{" "}
                                                                                                {itemVariant
                                                                                                    .sellable_inventory
                                                                                                    ?.unit_code ??
                                                                                                    ""}
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            }}
                                                                        </For>
                                                                    </div>
                                                                );
                                                            }}
                                                        </For>
                                                    </Show>
                                                </CardContent>
                                            </Card>
                                        </Show>
                                    </>
                                );
                            }}
                        </For>
                    </div>
                </section>
                <OverlaySheet
                    portalMount={portalMount}
                    topOpen={isTopPanelOpen()}
                    bottomOpen={isBottomPanelOpen()}
                    setTopOpen={setIsTopPanelOpen}
                    setBottomOpen={setIsBottomPanelOpen}
                    onTopOpenChange={onTopOpenChange}
                    onBottomOpenChange={onBottomOpenChange}
                >
                    <OverlaySheetContent
                        position="top"
                        size="md"
                        topChildren={<TopPanel />}
                        centerChildren={
                            <>
                                <Show when={isItemMergeable()}>
                                    <div class="flex flex-col gap-1 text-sm">
                                        <Button onClick={handleMergeVariant}>
                                            <LinkIcon />
                                        </Button>
                                    </div>
                                </Show>
                            </>
                        }
                        bottomChildren={<BottomPanel />}
                    />
                </OverlaySheet>
                <OverlaySheet
                    portalMount={portalMount}
                    topOpen={isCopyTopPanelOpen()}
                    bottomOpen={isCopyBottomPanelOpen()}
                    setTopOpen={setIsCopyTopPanelOpen}
                    setBottomOpen={setIsCopyBottomPanelOpen}
                    onTopOpenChange={setIsCopyTopPanelOpen}
                    onBottomOpenChange={setIsCopyBottomPanelOpen}
                    topHeight="20vh"
                    centerHeight="30vh"
                    bottomHeight="50vh"
                >
                    <OverlaySheetContent
                        position="top"
                        size="md"
                        topChildren={<CopyItemTopPanel />}
                        centerChildren={
                            <CopyItemsStepper
                                currentStep={copyItemCurrentStep()}
                                setCurrentStep={setCopyItemCurrentStep}
                                steps={copyItemSteps()}
                                errors={copyItemStepErrors()}
                            />
                        }
                        bottomChildren={
                            <>
                                <Show when={currentCopyItemStep()}>
                                    {currentCopyItemStep()?.stepFormComponent({
                                        currentStep: copyItemCurrentStep(),
                                        setCurrentStep: setCopyItemCurrentStep,
                                        stepAttributes:
                                            copyItemStepAttributes(),
                                        setStepAttributes:
                                            setCopyItemStepAttributes,
                                        setErrors: setCopyItemStepErrors,
                                    })}
                                </Show>
                                <OverlaySheetBottomClose
                                    onClick={() => {
                                        closeCopyPanels();
                                    }}
                                >
                                    {"Cancel"}
                                </OverlaySheetBottomClose>
                            </>
                        }
                    />
                </OverlaySheet>
            </div>
        );
    };

    function DrawerSection(props: {
        isOpen: boolean;
        setIsOpen: (isOpen: boolean) => void;
    }) {
        const [editingOnhandStockNumber, setEditingOnhandStockNumber] =
            createSignal<number | null>(null);
        const handleSetVariantStock = async (): Promise<void> => {
            try {
                if (!selectedTopItemVariant()) {
                    throw new Error("Invalid item variant id");
                }
                if (editingOnhandStockNumber() === null) {
                    throw new Error("Invalid onhand stock number");
                }
                const { success, error } = await setVariantStock(
                    selectedTopItemVariant()?.id as number,
                    editingOnhandStockNumber() as number
                );
                if (success) {
                    const targetItemVariant =
                        selectedTopItem()?.item_variants?.find(
                            (variant) =>
                                variant.id === selectedTopItemVariantID()
                        );
                    if (targetItemVariant) {
                        targetItemVariant.sellable_inventory.on_hand =
                            editingOnhandStockNumber() as number;
                        const item = items()?.find(
                            (item) => item.id === targetItemVariant?.item_id
                        );
                        if (item) {
                            setSelectedTopItem(null);
                            setSelectedTopItem({ ...item });
                            setItems([...items()]);
                        }
                    }

                    showToast({
                        title: "在庫数量を変更しました",
                        description: "在庫数量を変更しました",
                        variant: "success",
                    });
                    return;
                } else {
                    throw new Error(error ?? "Failed to set variant stock");
                }
            } catch (error) {
                showToast({
                    title: "エラーが発生しました",
                    description: serializeError(error),
                    variant: "error",
                });
            }
        };
        createAsync(async () => {
            try {
                console.log(selectedTopItemVariant());
                setEditingOnhandStockNumber(
                    selectedTopItemVariant()?.sellable_inventory?.on_hand ??
                        null
                );
                // reload original selected top item sku
                const [itemId, modelId] =
                    selectedTopItemVariant()?.platform_item_variant_id?.split(
                        "|"
                    ) ?? [];

                if (
                    !itemId ||
                    !modelId ||
                    !selectedTopItemVariant()?.integration_account_id
                ) {
                    console.warn(
                        "item id or model id or integration account id is not found"
                    );
                    return;
                }
                const internalSkuCode =
                    modelId === "0" ? `:${itemId}` : modelId;
                const { success, data, error } = await getItemSku(
                    selectedTopItemVariant()?.integration_account_id as number,
                    internalSkuCode as string
                );
                if (success && data) {
                    setOriginalSelectedTopItemSku(data);
                } else {
                    throw new Error(
                        error ?? "Failed to get original selected top item sku"
                    );
                }
            } catch (error) {
                showToast({
                    title: "エラーが発生しました",
                    description: serializeError(error),
                    variant: "error",
                });
            }
        });

        return (
            <Drawer open={props.isOpen} onOpenChange={props.setIsOpen}>
                <DrawerContent class="pb-[64px]">
                    <div class="mx-auto w-full max-w-sm">
                        <DrawerHeader>
                            <DrawerTitle>在庫数量を変更/確定します</DrawerTitle>
                            <DrawerDescription class="flex flex-col gap-1">
                                <div class="flex flex-row gap-1">
                                    <div class="flex w-3/4 flex-col justify-center gap-1 text-sm">
                                        <p>
                                            name:
                                            {
                                                selectedTopItemPlatform()
                                                    ?.shopee_item?.item_name
                                            }
                                        </p>
                                        <p>
                                            item code:
                                            {
                                                selectedTopItemPlatform()
                                                    ?.shopee_item_code
                                            }
                                        </p>
                                        <p>
                                            sku code:
                                            {selectedTopItemVariant()?.platform_item_variant_id.split(
                                                ":"
                                            )[1] === "0"
                                                ? "SKUなしアイテム"
                                                : selectedTopItemVariant()?.platform_item_variant_id.split(
                                                      ":"
                                                  )[1]}
                                        </p>
                                    </div>
                                    <div class="flex h-full max-h-[96px] w-1/4 max-w-[96px] items-center justify-end">
                                        <ItemSkuImageCarousel
                                            class="h-full w-full"
                                            itemSku={originalSelectedTopItemSku()}
                                        />
                                    </div>
                                </div>
                            </DrawerDescription>
                        </DrawerHeader>
                        <div class="p-4 pb-0">
                            <div class="flex items-center justify-center space-x-2">
                                <Button
                                    variant="primary"
                                    size="icon"
                                    class="size-8 shrink-0 rounded-full"
                                    onClick={() => {
                                        setEditingOnhandStockNumber(
                                            editingOnhandStockNumber()
                                                ? (editingOnhandStockNumber() as number) -
                                                      1
                                                : 0
                                        );
                                    }}
                                >
                                    <MinusIcon class="size-4" />
                                    <span class="sr-only">Decrease</span>
                                </Button>
                                <div class="flex-1 text-center">
                                    <div class="text-2xl font-bold tracking-tighter">
                                        {editingOnhandStockNumber() === null
                                            ? "在庫未登録"
                                            : editingOnhandStockNumber()}
                                    </div>
                                    <div class="text-[0.70rem] uppercase text-muted-foreground">
                                        {
                                            selectedTopItemVariant()
                                                ?.sellable_inventory?.unit_code
                                        }
                                    </div>
                                </div>
                                <Button
                                    variant="primary"
                                    size="icon"
                                    class="size-8 shrink-0 rounded-full"
                                    onClick={() => {
                                        setEditingOnhandStockNumber(
                                            editingOnhandStockNumber()
                                                ? (editingOnhandStockNumber() as number) +
                                                      1
                                                : 1
                                        );
                                    }}
                                >
                                    <PlusIcon class="size-4" />
                                    <span class="sr-only">Increase</span>
                                </Button>
                            </div>
                        </div>
                        <DrawerFooter class="w-full items-center">
                            <Button
                                variant="confirm"
                                class="w-full min-w-[120px]"
                                onClick={() => {
                                    handleSetVariantStock();
                                }}
                            >
                                Submit
                            </Button>
                            <DrawerClose
                                as={Button<"button">}
                                variant="inert"
                                class="w-full min-w-[120px]"
                            >
                                Cancel
                            </DrawerClose>
                        </DrawerFooter>
                    </div>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <>
            <NavHeader />
            <Suspense fallback={<div>Loading...</div>}>
                <ItemsSection />
                <DrawerSection
                    isOpen={isQuantityChangeDrawerOpen()}
                    setIsOpen={setIsQuantityChangeDrawerOpen}
                />
            </Suspense>
            <NavFooter />
        </>
    );
}
