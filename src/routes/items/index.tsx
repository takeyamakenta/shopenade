import { LinkIcon, MinusIcon, PlusIcon } from "lucide-solid";
import {
    For,
    Show,
    Suspense,
    createEffect,
    createMemo,
    createSignal,
    onMount,
} from "solid-js";

import { createAsync, query } from "@solidjs/router";

import { Item } from "@/@types/Item";
import { ItemPackingStyle } from "@/@types/ItemPackingStyle";
import { ItemSku } from "@/@types/ItemSku";
import { ShopeeShopAccount } from "@/@types/ShopeeShopAccount";
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
    OverlaySheetTopClose,
} from "@/components/ui/overlay-sheet";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import NavFooter from "@/layouts/NavFooter";
import NavHeader from "@/layouts/NavHeader";
import { getItems } from "@/libs/RPCs/item/getItems";
import { mergeVariant } from "@/libs/RPCs/item/mergeVariant";
import { getShopeeShops } from "@/libs/RPCs/oauth/getShopeeShops";
import { nationalFlags } from "@/libs/const/nationalFlags";
import { truncateText } from "@/libs/text/truncateText";

const initData = query(async () => {
    "use server";
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
}, "iaIdToShopMap");

export const route = {
    preload: () => initData(),
};

const resolveItemPackingStyle = (
    item: Item
): ItemPackingStyle | ItemPackingStyle[] | null => {
    if (item.default_packing_style?.packing_weight) {
        return item.default_packing_style;
    } else if (item.item_packing_styles?.length) {
        if (
            item.item_packing_styles.every(
                (packingStyle) =>
                    packingStyle.packing_weight ===
                        (item.item_packing_styles?.[0].packing_weight ?? 0) &&
                    packingStyle.packing_width ===
                        (item.item_packing_styles?.[0].packing_width ?? 0) &&
                    packingStyle.packing_height ===
                        (item.item_packing_styles?.[0].packing_height ?? 0) &&
                    packingStyle.packing_length ===
                        (item.item_packing_styles?.[0].packing_length ?? 0)
            )
        ) {
            return item.item_packing_styles[0];
        } else {
            return item.item_packing_styles;
        }
    } else {
        return null;
    }
};

export default function Account() {
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
        setIsTopPanelOpen(false);
    };
    const toggleBottomPanel = () => {
        setIsBottomPanelOpen(!isBottomPanelOpen());
    };

    const closeBottomPanel = () => {
        setIsBottomPanelOpen(false);
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

    // 選択中 SKU に紐づく ItemVariant 一覧
    const topAvailableVariants = createMemo(() => {
        const sku = selectedTopItemSku();
        if (!sku) return undefined;
        return selectedTopItem()?.item_variants?.filter(
            (variant) => variant.item_sku_id === sku.id
        );
    });

    // 選択中 SKU に紐づく梱包スタイルの候補
    const topPackingStyleOptions = createMemo(() => {
        const variants = topAvailableVariants();
        if (!variants) return undefined;
        const packingStyleIds = variants.map(
            (variant) => variant.item_packing_style_id
        );
        return selectedTopItem()?.item_packing_styles?.filter((packingStyle) =>
            packingStyleIds.includes(packingStyle.id)
        );
    });

    const topItemVariantOptions = createMemo(() => {
        const sku = selectedTopItemSku();
        if (!sku) return undefined;
        const packingStyle = selectedTopItemPackingStyle();
        if (!packingStyle) return undefined;
        return selectedTopItem()
            ?.item_variants?.filter(
                (variant) =>
                    variant.item_packing_style_id === packingStyle.id &&
                    variant.item_sku_id === sku.id
            )
            .map((variant) => ({
                item_platform:
                    selectedTopItem()?.item_platforms?.find(
                        (platform) => platform.id === variant.item_platform_id
                    ) ?? null,
                item_packing_style:
                    selectedTopItem()?.item_packing_styles?.find(
                        (packingStyle) =>
                            packingStyle.id === variant.item_packing_style_id
                    ) ?? null,
                item_sku:
                    selectedTopItem()?.item_skus?.find(
                        (sku) => sku.id === variant.item_sku_id
                    ) ?? null,
                item_variant: variant,
            }));
    });

    const onSelectTopItemSku = (api: NonNullable<ReturnType<CarouselApi>>) => {
        const selectedItemSku = topItemSkuOptions()?.[api.selectedScrollSnap()];
        setSelectedTopItemSku(selectedItemSku ?? null);
        setSelectedTopItemPackingStyle(topPackingStyleOptions()?.[0] ?? null);
    };

    const onSelectTopItemPackingStyle = (
        api: NonNullable<ReturnType<CarouselApi>>
    ) => {
        const selectedItemPackingStyle =
            topPackingStyleOptions()?.[api.selectedScrollSnap()];
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

    // 選択中 SKU に紐づく ItemVariant 一覧
    const bottomAvailableVariants = createMemo(() => {
        const sku = selectedBottomItemSku();
        if (!sku) return undefined;
        return selectedBottomItem()?.item_variants?.filter(
            (variant) => variant.item_sku_id === sku.id
        );
    });

    // 選択中 SKU に紐づく梱包スタイルの候補
    const bottomPackingStyleOptions = createMemo(() => {
        const variants = bottomAvailableVariants();
        if (!variants) return undefined;
        const packingStyleIds = variants.map(
            (variant) => variant.item_packing_style_id
        );
        return selectedBottomItem()?.item_packing_styles?.filter(
            (packingStyle) => packingStyleIds.includes(packingStyle.id)
        );
    });

    const bottomItemVariantOptions = createMemo(() => {
        const sku = selectedBottomItemSku();
        if (!sku) return undefined;
        const packingStyle = selectedBottomItemPackingStyle();
        if (!packingStyle) return undefined;
        return selectedBottomItem()
            ?.item_variants?.filter(
                (variant) =>
                    variant.item_packing_style_id === packingStyle.id &&
                    variant.item_sku_id === sku.id
            )
            .map((variant) => ({
                item_platform:
                    selectedBottomItem()?.item_platforms?.find(
                        (platform) => platform.id === variant.item_platform_id
                    ) ?? null,
                item_packing_style:
                    selectedBottomItem()?.item_packing_styles?.find(
                        (packingStyle) =>
                            packingStyle.id === variant.item_packing_style_id
                    ) ?? null,
                item_sku:
                    selectedBottomItem()?.item_skus?.find(
                        (sku) => sku.id === variant.item_sku_id
                    ) ?? null,
                item_variant: variant,
            }));
    });

    const onSelectBottomItemSku = (
        api: NonNullable<ReturnType<CarouselApi>>
    ) => {
        const selectedItemSku =
            bottomItemSkuOptions()?.[api.selectedScrollSnap()];
        setSelectedBottomItemSku(selectedItemSku ?? null);
        setSelectedBottomItemPackingStyle(
            bottomPackingStyleOptions()?.[0] ?? null
        );
    };

    const onSelectBottomItemPackingStyle = (
        api: NonNullable<ReturnType<CarouselApi>>
    ) => {
        const selectedItemPackingStyle =
            bottomPackingStyleOptions()?.[api.selectedScrollSnap()];
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
        return topItemVariantOptions()?.find(
            (variant) => variant.item_variant.id === selectedTopItemVariantID()
        );
    });

    const selectedTopItemPlatform = createMemo(() => {
        return selectedTopItemVariant()?.item_platform;
    });

    const [isQuantityChangeDrawerOpen, setIsQuantityChangeDrawerOpen] =
        createSignal(false);

    const handleMergeVariant = async (): Promise<void> => {
        console.log("handleMergeVariant");
        try {
            if (
                !selectedTopItem() ||
                !selectedTopItemPackingStyle() ||
                !selectedTopItemSku() ||
                !selectedBottomItemVariantIDs()?.length
            ) {
                throw new Error("選択中のアイテムが存在しません");
            }
            const { success, error } = await mergeVariant(
                selectedTopItem()?.id as number,
                selectedTopItemPackingStyle()?.id as number,
                selectedTopItemSku()?.id as number,
                selectedBottomItemVariantIDs() as number[]
            );
            if (success) {
                return;
            } else {
                throw new Error(error ?? "Failed to merge variant");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const ItemSkuImageCarousel = (props: { itemSku: ItemSku|null }) => {
        return (
            <Show when={props.itemSku?.images?.length ?? 0 > 0}>
                <Carousel>
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
                <OverlaySheetBody class="h-full w-full flex-col gap-2">
                    <ItemSkuImageCarousel itemSku={selectedTopItemSku()} />
                    <Show when={selectedTopItem()}>
                        <div class="flex h-[32px] w-full flex-col gap-1 text-sm">
                            <Carousel
                                orientation="vertical"
                                setApi={setTopSkuCarouselApi}
                            >
                                <CarouselContent class="h-[64px] w-full">
                                    <For each={topItemSkuOptions()}>
                                        {(sku) => (
                                            <CarouselItem class="md:basis-1/2 lg:basis-1/3">
                                                <div class="flex flex-col gap-1 text-sm">
                                                    <p>{sku.hash_code}</p>
                                                </div>
                                            </CarouselItem>
                                        )}
                                    </For>
                                </CarouselContent>
                            </Carousel>
                        </div>
                    </Show>
                    <Show when={selectedTopItemSku()}>
                        <div class="flex h-[32px] w-full flex-col gap-1 text-sm">
                            <Carousel
                                orientation="vertical"
                                setApi={setTopPackingStyleCarouselApi}
                            >
                                <CarouselContent class="h-[64px] w-full">
                                    <For each={topPackingStyleOptions()}>
                                        {(packingStyle) => (
                                            <CarouselItem class="md:basis-1/2 lg:basis-1/3">
                                                <div class="flex flex-col gap-1 text-sm">
                                                    <p>
                                                        {"📦"}
                                                        {
                                                            packingStyle.packing_width
                                                        }{" "}
                                                        x{" "}
                                                        {
                                                            packingStyle.packing_height
                                                        }{" "}
                                                        x{" "}
                                                        {
                                                            packingStyle.packing_length
                                                        }{" "}
                                                        {
                                                            packingStyle.length_unit_code
                                                        }{" "}
                                                        {
                                                            packingStyle.packing_weight
                                                        }{" "}
                                                        {
                                                            packingStyle.weight_unit_code
                                                        }{" "}
                                                        {
                                                            packingStyle.factor_by_base_unit
                                                        }{" "}
                                                        {
                                                            selectedTopItem()
                                                                ?.base_unit_code
                                                        }
                                                    </p>
                                                </div>
                                            </CarouselItem>
                                        )}
                                    </For>
                                </CarouselContent>
                            </Carousel>
                        </div>
                    </Show>
                    <Show when={selectedTopItemPackingStyle()}>
                        <ToggleGroup
                            multiple={false}
                            orientation="vertical"
                            class="flex flex-col gap-1 overflow-y-auto"
                            value={
                                selectedTopItemVariantID()?.toString() ?? null
                            }
                        >
                            <For each={topItemVariantOptions()}>
                                {(variantObject) => (
                                    <>
                                        <ToggleGroupItem
                                            class="flex w-full flex-row items-center justify-start gap-1"
                                            value={variantObject.item_variant.id.toString()}
                                        >
                                            <div class="w-[24px]">
                                                <ShopeeLogo />
                                            </div>
                                            <div class="flex w-[calc(100%-24px)] flex-row items-center">
                                                <div class="w-[calc(100%-160px)] text-nowrap text-left">
                                                    {nationalFlags[
                                                        iaIdToShopMap()?.get(
                                                            variantObject
                                                                .item_platform
                                                                ?.integration_account_id ??
                                                                0
                                                        )
                                                            ?.region as keyof typeof nationalFlags
                                                    ] ?? "Unknown"}
                                                    {truncateText(
                                                        iaIdToShopMap()?.get(
                                                            variantObject
                                                                .item_platform
                                                                ?.integration_account_id ??
                                                                0
                                                        )?.shop_name ??
                                                            "unknown shop",
                                                        10
                                                    )}
                                                </div>
                                                <div class="w-[64px] text-right">
                                                    {variantObject.item_variant
                                                        .sellable_inventory
                                                        ?.on_hand ?? "N/A"}{" "}
                                                    {variantObject.item_variant
                                                        .sellable_inventory
                                                        ?.unit_code ?? ""}
                                                </div>
                                                <div class="inline-flex w-[96px] flex-col items-center justify-end text-right">
                                                    <Button
                                                        variant="tertiary"
                                                        size="xs"
                                                        onClick={() => {
                                                            setSelectedTopItemVariantID(
                                                                variantObject
                                                                    .item_variant
                                                                    .id
                                                            );
                                                            setIsQuantityChangeDrawerOpen(
                                                                true
                                                            );
                                                        }}
                                                    >
                                                        {"数量変更"}
                                                    </Button>
                                                </div>
                                            </div>
                                        </ToggleGroupItem>
                                    </>
                                )}
                            </For>
                        </ToggleGroup>
                    </Show>
                </OverlaySheetBody>
                <OverlaySheetTopClose>Close</OverlaySheetTopClose>
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
                <OverlaySheetBody class="h-full w-full flex-col gap-2">
                    <Show when={selectedBottomItem()}>
                        <div class="flex h-[32px] w-full flex-col gap-1 text-sm">
                            <Carousel
                                orientation="vertical"
                                setApi={setBottomSkuCarouselApi}
                            >
                                <CarouselContent class="h-[64px] w-full">
                                    <For each={bottomItemSkuOptions()}>
                                        {(sku) => (
                                            <CarouselItem class="md:basis-1/2 lg:basis-1/3">
                                                <div class="flex flex-col gap-1 text-sm">
                                                    <p>{sku.hash_code}</p>
                                                </div>
                                            </CarouselItem>
                                        )}
                                    </For>
                                </CarouselContent>
                            </Carousel>
                        </div>
                    </Show>
                    <Show when={selectedBottomItemSku()}>
                        <div class="flex h-[32px] w-full flex-col gap-1 text-sm">
                            <Carousel
                                orientation="vertical"
                                setApi={setBottomPackingStyleCarouselApi}
                            >
                                <CarouselContent class="h-[64px] w-full">
                                    <For each={bottomPackingStyleOptions()}>
                                        {(packingStyle) => (
                                            <CarouselItem class="md:basis-1/2 lg:basis-1/3">
                                                <div class="flex flex-col gap-1 text-sm">
                                                    <p>
                                                        {"📦"}
                                                        {
                                                            packingStyle.packing_width
                                                        }{" "}
                                                        x{" "}
                                                        {
                                                            packingStyle.packing_height
                                                        }{" "}
                                                        x{" "}
                                                        {
                                                            packingStyle.packing_length
                                                        }{" "}
                                                        {
                                                            packingStyle.length_unit_code
                                                        }{" "}
                                                        {
                                                            packingStyle.packing_weight
                                                        }{" "}
                                                        {
                                                            packingStyle.weight_unit_code
                                                        }{" "}
                                                        {
                                                            packingStyle.factor_by_base_unit
                                                        }{" "}
                                                        {
                                                            selectedBottomItem()
                                                                ?.base_unit_code
                                                        }
                                                    </p>
                                                </div>
                                            </CarouselItem>
                                        )}
                                    </For>
                                </CarouselContent>
                            </Carousel>
                        </div>
                    </Show>
                    <Show when={selectedBottomItemPackingStyle()}>
                        <ToggleGroup
                            multiple
                            orientation="vertical"
                            class="flex flex-col gap-1 overflow-y-auto"
                            // ToggleGroup は value を string[] で返すため、number[] に変換して保持する
                            onChange={(values) =>
                                setSelectedBottomItemVariantIDs(
                                    (values as string[]).map(Number)
                                )
                            }
                        >
                            <For each={bottomItemVariantOptions()}>
                                {(variantObject) => (
                                    <>
                                        <ToggleGroupItem
                                            class="flex w-full flex-row items-center justify-start gap-1"
                                            value={variantObject.item_variant.id.toString()}
                                        >
                                            <div class="w-[24px]">
                                                <ShopeeLogo />
                                            </div>
                                            <div class="flex w-[calc(100%-24px)] flex-row">
                                                <div class="w-[calc(100%-64px)] text-nowrap text-left">
                                                    {nationalFlags[
                                                        iaIdToShopMap()?.get(
                                                            variantObject
                                                                .item_platform
                                                                ?.integration_account_id ??
                                                                0
                                                        )
                                                            ?.region as keyof typeof nationalFlags
                                                    ] ?? "Unknown"}
                                                    {truncateText(
                                                        iaIdToShopMap()?.get(
                                                            variantObject
                                                                .item_platform
                                                                ?.integration_account_id ??
                                                                0
                                                        )?.shop_name ??
                                                            "unknown shop",
                                                        10
                                                    )}
                                                </div>
                                                <div class="w-[64px] text-right">
                                                    {variantObject.item_variant
                                                        .sellable_inventory
                                                        ?.on_hand ?? "N/A"}{" "}
                                                    {variantObject.item_variant
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
                </OverlaySheetBody>
                <OverlaySheetBottomClose>Close</OverlaySheetBottomClose>
            </>
        );
    };

    const handleCardClick = (item: Item) => {
        if (!isTopPanelOpen()) {
            setSelectedTopItem(item);
            setSelectedTopItemSku(topItemSkuOptions()?.[0] ?? null);
            setSelectedTopItemPackingStyle(
                topPackingStyleOptions()?.[0] ?? null
            );
            setIsTopPanelOpen(true);
        } else if (!isBottomPanelOpen()) {
            setSelectedBottomItem(item);
            setSelectedBottomItemSku(bottomItemSkuOptions()?.[0] ?? null);
            setSelectedBottomItemPackingStyle(
                bottomPackingStyleOptions()?.[0] ?? null
            );
            setIsBottomPanelOpen(true);
        }
    };

    const ItemsSection = () => {
        return (
            <div class="relative h-full w-full overflow-hidden">
                <section
                    class="flex max-h-[calc(100vh-7.2rem)] flex-col items-center overflow-y-auto px-4 py-4"
                    ref={(el) => (portalMount = el)}
                >
                    <div class="mb-8 flex h-fit w-full max-w-md flex-col gap-4">
                        <For each={items()}>
                            {(item) => {
                                const packingStyle =
                                    resolveItemPackingStyle(item);
                                return (
                                    <>
                                        <Card
                                            onClick={() => {
                                                handleCardClick(item);
                                            }}
                                        >
                                            <CardHeader>
                                                <CardTitle>
                                                    {item.item_platforms?.[0]
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
                                                <div class="flex flex-col gap-1 text-sm">
                                                    <div class="flex flex-col items-end gap-1">
                                                        <Show
                                                            when={Array.isArray(
                                                                packingStyle
                                                            )}
                                                        >
                                                            <For
                                                                each={
                                                                    packingStyle as ItemPackingStyle[]
                                                                }
                                                            >
                                                                {(
                                                                    packingStyle
                                                                ) => {
                                                                    return (
                                                                        <p>
                                                                            {
                                                                                "📦"
                                                                            }{" "}
                                                                            {
                                                                                packingStyle.packing_width
                                                                            }
                                                                            x
                                                                            {
                                                                                packingStyle.packing_height
                                                                            }
                                                                            x
                                                                            {
                                                                                packingStyle.packing_length
                                                                            }{" "}
                                                                            {
                                                                                packingStyle.length_unit_code
                                                                            }{" "}
                                                                            {
                                                                                packingStyle.packing_weight
                                                                            }{" "}
                                                                            {
                                                                                packingStyle.weight_unit_code
                                                                            }{" "}
                                                                            {
                                                                                packingStyle.factor_by_base_unit
                                                                            }{" "}
                                                                            {
                                                                                item.base_unit_code
                                                                            }
                                                                        </p>
                                                                    );
                                                                }}
                                                            </For>
                                                        </Show>
                                                        <Show
                                                            when={
                                                                packingStyle &&
                                                                typeof packingStyle ===
                                                                    "object"
                                                            }
                                                        >
                                                            <p>
                                                                {"📦"}{" "}
                                                                {
                                                                    (
                                                                        packingStyle as ItemPackingStyle
                                                                    )
                                                                        ?.packing_width
                                                                }{" "}
                                                                x{" "}
                                                                {
                                                                    (
                                                                        packingStyle as ItemPackingStyle
                                                                    )
                                                                        ?.packing_height
                                                                }{" "}
                                                                x{" "}
                                                                {
                                                                    (
                                                                        packingStyle as ItemPackingStyle
                                                                    )
                                                                        ?.packing_length
                                                                }{" "}
                                                                {
                                                                    (
                                                                        packingStyle as ItemPackingStyle
                                                                    )
                                                                        ?.length_unit_code
                                                                }{" "}
                                                                {
                                                                    (
                                                                        packingStyle as ItemPackingStyle
                                                                    )
                                                                        ?.packing_weight
                                                                }{" "}
                                                                {
                                                                    (
                                                                        packingStyle as ItemPackingStyle
                                                                    )
                                                                        ?.weight_unit_code
                                                                }{" "}
                                                                {
                                                                    (
                                                                        packingStyle as ItemPackingStyle
                                                                    )
                                                                        ?.factor_by_base_unit
                                                                }{" "}
                                                                {
                                                                    item.base_unit_code
                                                                }{" "}
                                                            </p>
                                                        </Show>
                                                    </div>
                                                    <For
                                                        each={
                                                            item.item_platforms
                                                        }
                                                    >
                                                        {(itemPlatform) => {
                                                            const shop =
                                                                iaIdToShopMap()?.get(
                                                                    itemPlatform.integration_account_id
                                                                );
                                                            return (
                                                                <div class="flex flex-row items-center justify-start gap-2 text-sm">
                                                                    <ShopeeLogo />
                                                                    <p class="text-center align-baseline text-sm">
                                                                        {" "}
                                                                        {
                                                                            nationalFlags[
                                                                                shop?.region as keyof typeof nationalFlags
                                                                            ]
                                                                        }{" "}
                                                                        {truncateText(
                                                                            itemPlatform
                                                                                .shopee_item
                                                                                ?.item_name ??
                                                                                ""
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            );
                                                        }}
                                                    </For>
                                                </div>
                                            </CardContent>
                                        </Card>
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
            </div>
        );
    };

    function DrawerSection(props: {
        isOpen: boolean;
        setIsOpen: (isOpen: boolean) => void;
    }) {
        return (
            <Drawer open={props.isOpen} onOpenChange={props.setIsOpen}>
                <DrawerContent class="pb-[64px]">
                    <div class="mx-auto w-full max-w-sm">
                        <DrawerHeader>
                            <DrawerTitle>在庫数量を変更/確定します</DrawerTitle>
                            <DrawerDescription class="flex flex-col gap-1 text-sm">
                                <p>
                                    name:
                                    {
                                        selectedTopItemPlatform()?.shopee_item
                                            ?.item_name
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
                                    {selectedTopItemVariant()?.item_variant.platform_item_variant_id.split(
                                        ":"
                                    )[1] === "0"
                                        ? "SKUなしアイテム"
                                        : selectedTopItemVariant()?.item_variant.platform_item_variant_id.split(
                                              ":"
                                          )[1]}
                                </p>
                            </DrawerDescription>
                        </DrawerHeader>
                        <div class="p-4 pb-0">
                            <div class="flex items-center justify-center space-x-2">
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    class="size-8 shrink-0 rounded-full"
                                >
                                    <MinusIcon class="size-4" />
                                    <span class="sr-only">Decrease</span>
                                </Button>
                                <div class="flex-1 text-center">
                                    <div class="text-7xl font-bold tracking-tighter">
                                        {}
                                    </div>
                                    <div class="text-[0.70rem] uppercase text-muted-foreground">
                                        在庫数量
                                    </div>
                                </div>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    class="size-8 shrink-0 rounded-full"
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
