import { ShopeeShopAccount } from "@/@types/ShopeeShopAccount";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { showToast } from "@/components/ui/toast";
import NavFooter from "@/layouts/NavFooter";
import NavHeader from "@/layouts/NavHeader";
import { nationalFlags } from "@/libs/const/nationalFlags";
import { shopeeShopAccountStatuses } from "@/libs/const/shopeeShopAccountStatuses";
import { clientReportError } from "@/libs/error/reportError";
import { createShopeeShopAccount } from "@/libs/RPCs/oauth/createShopeeShopAccount";
import { getShopeeOAuthUrl } from "@/libs/RPCs/oauth/getShopeeOAuthUrl";
import { getShopeeShops } from "@/libs/RPCs/oauth/getShopeeShops";
import { useIsLoadingStore } from "@/stores/isLoadingStore";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { createSignal, For, onMount, Show, Suspense } from "solid-js";


export const route = {
    preload: () => {},
};


export default function Account() {
    const [searchParams] = useSearchParams();
    const [shops, setShops] = createSignal<ShopeeShopAccount[]>([]);

    const navigate = useNavigate();
    onMount(async () => {
        try {
            const { success, data } = await getShopeeShops();
            if (success && data) {
                // ShopeeShopAccount 型のみを抽出
                const shopeeShops = data.map((account) => account.shopee_shop_account).filter((shop) => shop) as ShopeeShopAccount[];
                setShops(shopeeShops);
            }
        } catch (error) {
            console.error(error);
        }
    });

    const [status, setStatus] = createSignal<"loading" | "success" | "error">("loading");
    const [message, setMessage] = createSignal<string | undefined>(undefined);

    const [currentShopId, setCurrentShopId] = createSignal<string | null>(null);

    onMount(async () => {
        const code = searchParams.code;
        const shopId = searchParams.shop_id;

        if (code && shopId) {
            setCurrentShopId(String(shopId));
            try {
                await createShopeeShopAccount(String(shopId), String(code));
                setStatus("success");
                setMessage("ショップ連携に成功しました");
            } catch (e) {
                setStatus("error");
                setMessage(e instanceof Error ? e.message : "アカウント作成に失敗しました");
            } finally {
                setCurrentShopId(null);
                showToast({
                    title: status(),
                    description: message(),
                    variant: status() === "success" ? "success" : "error",
                });
                navigate("/account", { replace: true });
            }
        }
    });

    const AccountSection = () => {
        const { setIsLoadingStore, isLoadingStore } = useIsLoadingStore();
        const handleClick = async () => {
            try {
                setIsLoadingStore("isLoading", true);
                const url = await getShopeeOAuthUrl();
                window.location.replace(url);
            } catch (error) {
                clientReportError(error);
            } finally {
                setIsLoadingStore("isLoading", false);
            }
        };

        const AccountSkeleton = () => {
            return (
                <Card>
                    <CardHeader>
                        <CardTitle><Skeleton height={16} width={250} radius={10} /></CardTitle>
                        <CardDescription>Shop ID: <Skeleton height={16} width={250} radius={10} /></CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div class="flex flex-col gap-1 text-sm">
                            <p class="flex items-center gap-2">リージョン<Skeleton height={16} width={125} radius={10} /></p>
                            <p class="flex items-center gap-2">ステータス<Skeleton height={16} width={125} radius={10} /></p>
                        </div>
                    </CardContent>
                </Card>
            );
        };

        return (
            <section class="flex min-h-screen flex-col items-center px-4 py-8">
                <div class="mb-8 flex w-full max-w-md flex-col gap-4">
                    <For each={shops()}>
                        {(shop) => (
                            <>
                                <Show 
                                    when={currentShopId() !== shop.shop_id || status() !== "loading"}
                                    fallback={
                                        <AccountSkeleton />
                                    }
                                >
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>{nationalFlags[shop.region as keyof typeof nationalFlags] ?? ""} {shop.shop_name}</CardTitle>
                                            <CardDescription>Shop ID: {shop.shop_id}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div class="flex flex-col gap-1 text-sm">
                                                <p>リージョン: {shop.region}</p>
                                                <p>ステータス: {shopeeShopAccountStatuses[shop.authorization_status as keyof typeof shopeeShopAccountStatuses] ?? shop.authorization_status}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Show>
                            </>
                        )}
                    </For>
                </div>
                <Button variant="primary" size="lg" on:click={handleClick} disabled={isLoadingStore.isLoading}>
                    ショップと連携する
                </Button>
            </section>
        );
    };

    return (
        <>
            <NavHeader />
                <Suspense fallback={<div>Loading...</div>} >
                    <AccountSection />
                </Suspense>
            <NavFooter />
        </>
    );
}
