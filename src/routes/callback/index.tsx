import { createSignal, onMount, Show, Suspense } from "solid-js";

import NavFooter from "@/layouts/NavFooter";
import NavHeader from "@/layouts/NavHeader";
import { createShopeeShopAccount } from "@/libs/RPCs/oauth/createShopeeShopAccount";
import { useSearchParams } from "@solidjs/router";

export const route = {
    preload: () => {},
};

export default function Callback() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = createSignal<"loading" | "success" | "error">("loading");
    const [errorMessage, setErrorMessage] = createSignal("");

    onMount(async () => {
        const code = searchParams.code;
        const shopId = searchParams.shop_id;

        if (!code || !shopId) {
            setStatus("error");
            setErrorMessage("必要なパラメータ(code, shop_id)が不足しています");
            return;
        }
        try {
            await createShopeeShopAccount(String(shopId), String(code));
            setStatus("success");
        } catch (e) {
            setStatus("error");
            setErrorMessage(e instanceof Error ? e.message : "アカウント作成に失敗しました");
        }
    });

    function CallbackSection() {
        return (
            <div>
                <Show when={status() === "loading"}>
                    <p>Shopeeアカウントを連携中...</p>
                </Show>
                <Show when={status() === "success"}>
                    <p>Shopeeアカウントの連携が完了しました</p>
                </Show>
                <Show when={status() === "error"}>
                    <p>エラー: {errorMessage()}</p>
                </Show>
            </div>
        );
    }

    return (
        <>
            <NavHeader />
            <Suspense fallback={<div>Loading...</div>}>
                <CallbackSection />
            </Suspense>
            <NavFooter />
        </>
    );
}
