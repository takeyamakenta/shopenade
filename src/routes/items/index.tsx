import { For, Suspense, createSignal, onMount } from "solid-js";
import { createAsync, query } from "@solidjs/router";

import { Button } from "@/components/ui/button";
import { Item } from "@/@types/Item";
import { ItemPlatform } from "@/@types/ItemPlatform";
import { ItemPackingStyle } from "@/@types/ItemPackingStyle";

import { ShopeeShopAccount } from "@/@types/ShopeeShopAccount";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import NavFooter from "@/layouts/NavFooter";
import NavHeader from "@/layouts/NavHeader";
import { getItems } from "@/libs/RPCs/item/getItems";
import { getShopeeShops } from "@/libs/RPCs/oauth/getShopeeShops";
import {                                                                                                                                                                                        
    OverlaySheet,             
    OverlaySheetContent,
    OverlaySheetHeader,
    OverlaySheetTitle,                                                                                                                                                                          
    OverlaySheetBody,
    OverlaySheetTopClose,
    OverlaySheetBottomClose,                                                                                                                                                                      
} from "@/components/ui/overlay-sheet"; 
import { ArrowUpToLineIcon, LinkIcon } from "lucide-solid";

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

export default function Account() {
    const [items, setItems] = createSignal<Item[]>([]);
    const iaIdToShopMap = createAsync(() => initData());
    console.log(iaIdToShopMap());
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
        if (isTopPanelOpen() && isBottomPanelOpen()) {
            setIsTopPanelOpen(false);
            setIsBottomPanelOpen(false);
        } else if (isTopPanelOpen()) {
            setIsBottomPanelOpen(true);
        } else if (isBottomPanelOpen()) {
            setIsTopPanelOpen(true);
        } else {
            setIsTopPanelOpen(true);
            setIsBottomPanelOpen(false);
        }
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

    const [selectedTopItem, setSelectedTopItem] = createSignal<Item | undefined>(undefined);
    const [selectedTopItemPlatform, setSelectedTopItemPlatform] = createSignal<ItemPlatform | undefined>(undefined);
    const [selectedTopItemPackingStyle, setSelectedTopItemPackingStyle] = createSignal<ItemPackingStyle | undefined>(undefined);
    const [selectedTopItemSku, setSelectedTopItemSku] = createSignal<string | undefined>(undefined);
    const [selectedTopItemVariant, setSelectedTopItemVariant] = createSignal<string | undefined>(undefined);

    const [selectedBottomItem, setSelectedBottomItem] = createSignal<Item | undefined>(undefined);
    const [selectedBottomItemPlatform, setSelectedBottomItemPlatform] = createSignal<ItemPlatform | undefined>(undefined);
    const [selectedBottomItemPackingStyle, setSelectedBottomItemPackingStyle] = createSignal<ItemPackingStyle | undefined>(undefined);
    const [selectedBottomItemSku, setSelectedBottomItemSku] = createSignal<string | undefined>(undefined);
    const [selectedBottomItemVariant, setSelectedBottomItemVariant] = createSignal<string | undefined>(undefined);



    const OrdersSection = () => {
        return (
            <div class="relative h-full w-full overflow-hidden">
                <section class="flex max-h-[calc(100vh-7.2rem)] flex-col items-center overflow-y-auto px-4 py-4" ref={(el) => portalMount = el}>
                    <div class="mb-8 flex h-fit w-full max-w-md flex-col gap-4">
                        <For each={items()}>
                            {(item) => (
                                <>
                                    <Card onClick={toggleTopPanel}>
                                        <CardHeader>
                                            <CardTitle>{item.id}</CardTitle>
                                            <CardDescription>
                                                UID: {item.uid}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div class="flex flex-col gap-1 text-sm">
                                                <p>Base Unit Code: {item.base_unit_code}</p>
                                                <p>mitei</p>
                                                <p> {JSON.stringify(item.metadata)}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </>
                            )}
                        </For>
                    </div>
                </section>
                <OverlaySheet portalMount={portalMount} topOpen={isTopPanelOpen()} bottomOpen={isBottomPanelOpen()} setTopOpen={setIsTopPanelOpen} setBottomOpen={setIsBottomPanelOpen}>
                    <OverlaySheetContent position="top" size="md" 
                        topChildren={
                            <>
                                <OverlaySheetHeader>
                                    <OverlaySheetTitle>Details</OverlaySheetTitle>
                                </OverlaySheetHeader>
                                <OverlaySheetBody>
                                    <div class="flex flex-col gap-1 text-sm">
                                        top
                                    </div>
                                </OverlaySheetBody>
                                <OverlaySheetTopClose>Close</OverlaySheetTopClose>
                            </>
                        }
                        centerChildren={
                            <>
                                <div class="flex flex-col gap-1 text-sm">
                                    <Button onClick={closeTopPanel}><ArrowUpToLineIcon /><LinkIcon /></Button>
                                </div>
                            </>
                        }
                        bottomChildren={
                            <>
                                <OverlaySheetHeader>
                                    <OverlaySheetTitle>Details</OverlaySheetTitle>
                                </OverlaySheetHeader>
                                <OverlaySheetBody>
                                    <div class="flex flex-col gap-1 text-sm">
                                        bottom
                                    </div>
                                </OverlaySheetBody>
                                <OverlaySheetBottomClose>Close</OverlaySheetBottomClose>
                            </>
                        }
                    />
                </OverlaySheet>
            </div>
        );
    };

    return (
        <>
            <NavHeader />
            <Suspense fallback={<div>Loading...</div>}>
                <OrdersSection />
            </Suspense>
            <NavFooter />
        </>
    );
}
