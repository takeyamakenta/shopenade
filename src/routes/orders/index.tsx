import { For, Suspense, createSignal, onMount } from "solid-js";

import { createAsync, query } from "@solidjs/router";

import { Order } from "@/@types/ShopeeOrder";
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
import { getShopeeShops } from "@/libs/RPCs/oauth/getShopeeShops";
import { getShopeeOrders } from "@/libs/RPCs/order/getShopeeOrders";
import { nationalFlags } from "@/libs/const/nationalFlags";

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
    const [orders, setOrders] = createSignal<Order[]>([]);
    const iaIdToShopMap = createAsync(() => initData());
    onMount(async () => {
        try {
            const { success, data } = await getShopeeOrders();
            if (success && data) {
                setOrders(data);
            }
        } catch (error) {
            console.error(error);
        }
    });

    onMount(async () => {});

    const OrdersSection = () => {
        return (
            <section class="flex min-h-screen flex-col items-center px-4 py-8">
                <div class="mb-8 flex w-full max-w-md flex-col gap-4">
                    <For each={orders()}>
                        {(order) => (
                            <>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            {nationalFlags[
                                                iaIdToShopMap()?.get(
                                                    order.integration_account_id
                                                )
                                                    ?.region as keyof typeof nationalFlags
                                            ] ?? ""}{" "}
                                            {
                                                order.code
                                            }
                                        </CardTitle>
                                        <CardDescription>
                                            Order ID: {order.code}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div class="flex flex-col gap-1 text-sm">
                                            <p>
                                                ショップ名:{" "}
                                                {
                                                    iaIdToShopMap()?.get(
                                                        order.integration_account_id
                                                    )?.shop_name
                                                }
                                            </p>
                                            <p>オーダーID: {order.code}</p>
                                            <p>
                                                オーダー日時: {order.created_at}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </For>
                </div>
            </section>
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
