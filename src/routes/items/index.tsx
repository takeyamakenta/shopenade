import { For, Suspense, createSignal, onMount } from "solid-js";
import { createAsync, query } from "@solidjs/router";

import { Item } from "@/@types/Item";
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
    OverlaySheetClose,                                                                                                                                                                      
} from "@/components/ui/overlay-sheet"; 

const initData = query(async () => {
    "use server";
    const { success, data } = await getShopeeShops();
    console.log(data);
    console.log(success);
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
            console.log({data});
            console.log({success});
            if (success && data) {
                setItems(data);
            }
        } catch (error) {
            console.error(error);
        }
    });

    onMount(async () => {});

    let portalRef: HTMLDivElement | undefined = undefined;



    const OrdersSection = () => {
        return (
            <div class="relative h-full w-full overflow-hidden px-4 py-8"> 
                <section class="flex max-h-[calc(100vh-7.2rem)] flex-col items-center px-4 py-8 overflow-y-auto">
                    <div class="mb-8 flex h-fit w-full max-w-md flex-col gap-4" ref={(el) => portalRef = el}>
                        <For each={items()}>
                            {(item) => (
                                <>
                                    <Card>
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
                {/* <OverlaySheet portalRef={portalRef} open={true}>                                                                                                                                                                              
                   <OverlaySheetContent position="bottom" size="md">                                                                                                                                       
                        <OverlaySheetHeader>
                            <OverlaySheetTitle>Details</OverlaySheetTitle>                                                                                                                                  
                        </OverlaySheetHeader>                                                                                                                                                               
                        <OverlaySheetBody>

                        </OverlaySheetBody>                                                                                                                                                                 
                        <OverlaySheetClose>Close</OverlaySheetClose>
                    </OverlaySheetContent>                                                                                                                                                                  
                </OverlaySheet> */}
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
