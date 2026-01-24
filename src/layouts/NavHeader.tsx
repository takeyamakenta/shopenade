import {
    Suspense,
    createEffect,
    createRenderEffect,
    createSignal,
} from "solid-js";

import { createTween } from "@solid-primitives/tween";
import { createAsync } from "@solidjs/router";
import { Portal } from "solid-js/web";

import { defaultAuthSessionData } from "@/@types/AuthSessionData";
import { Button } from "@/components/ui/button";
import { LoginDialog } from "@/layouts/LoginDaialog";
import { clearSession } from "@/libs/RPCs/auth/clearSession";
import { getAuthSession } from "@/sessions/authSession";
import { useAuthStore } from "@/stores/authStore";
import { useIsLoadingStore } from "@/stores/isLoadingStore";

import styles from "./Layout.module.css";

const initData = async () => {
    "use server";
    return await getAuthSession();
};

export const route = {
    preload: () => initData(),
};

function NavHeader() {
    const { isLoadingStore } = useIsLoadingStore();
    // 基本色の定義（開始色と終了色）
    const baseFromColor = { r: 59, g: 130, b: 246 }; // 青系
    const baseToColor = { r: 235, g: 52, b: 52 }; // 赤系

    // グラデーションの色を管理する状態
    const [fromR, setFromR] = createSignal(baseFromColor.r);
    const tweenedFromR = createTween(fromR, { duration: 1000 });
    const [fromG, setFromG] = createSignal(baseFromColor.g);
    const tweenedFromG = createTween(fromG, { duration: 1000 });
    const [fromB, setFromB] = createSignal(baseFromColor.b);
    const tweenedFromB = createTween(fromB, { duration: 1000 });

    const [toR, setToR] = createSignal(baseToColor.r);
    const tweenedToR = createTween(toR, { duration: 1000 });
    const [toG, setToG] = createSignal(baseToColor.g);
    const tweenedToG = createTween(toG, { duration: 1000 });
    const [toB, setToB] = createSignal(baseToColor.b);
    const tweenedToB = createTween(toB, { duration: 1000 });

    // 最終的なRGB文字列を生成
    const [fromColor, setFromColor] = createSignal<string>(
        `rgb(${baseFromColor.r}, ${baseFromColor.g}, ${baseFromColor.b})`
    );
    const [toColor, setToColor] = createSignal<string>(
        `rgb(${baseToColor.r}, ${baseToColor.g}, ${baseToColor.b})`
    );

    createRenderEffect(() => {
        setFromColor(
            `rgb(${tweenedFromR()}, ${tweenedFromG()}, ${tweenedFromB()})`
        );
        setToColor(`rgb(${tweenedToR()}, ${tweenedToG()}, ${tweenedToB()})`);
    });

    const [intervalId, setIntervalId] = createSignal<NodeJS.Timeout | null>(
        null
    );

    const [isEven, setIsEven] = createSignal(false);

    const [isLoginDialogOpen, setIsLoginDialogOpen] = createSignal(false);

    createEffect((prev: boolean) => {
        if (isLoadingStore.isLoading) {
            // ローディング中は色の変化とグラデーションの移動を組み合わせる
            setIntervalId(
                setInterval(() => {
                    if (isEven()) {
                        setFromR(baseFromColor.r);
                        setFromG(baseFromColor.g);
                        setFromB(baseFromColor.b);
                        setToR(baseToColor.r);
                        setToG(baseToColor.g);
                        setToB(baseToColor.b);
                    } else {
                        setFromR(baseToColor.r);
                        setFromG(baseToColor.g);
                        setFromB(baseToColor.b);
                        setToR(baseFromColor.r);
                        setToG(baseFromColor.g);
                        setToB(baseFromColor.b);
                    }
                    setIsEven(!isEven());
                }, 1000)
            );
        } else if (intervalId() !== null) {
            // ローディング終了時
            clearInterval(intervalId() as NodeJS.Timeout);
            setIntervalId(null);
            // 基本色に戻す
            setFromR(baseFromColor.r);
            setFromG(baseFromColor.g);
            setFromB(baseFromColor.b);
            setToR(baseToColor.r);
            setToG(baseToColor.g);
            setToB(baseToColor.b);
        }
        return !prev;
    }, true);

    const { authStore, setAuthStore } = useAuthStore();

    const logout = async () => {
        await clearSession();
        setAuthStore({...defaultAuthSessionData});
        location.reload();
    };

    const data = createAsync(() => initData());

    createEffect(() => {
        setAuthStore(data() || defaultAuthSessionData);
    });

    return (
        <>
            <nav
                class={`${styles.header} bg-slate-100`}
                style={{
                    "border-image": `linear-gradient(to left, ${fromColor()}, ${toColor()} 50%, ${fromColor()}) 1`,
                }}
            >
                <div class="px-4"><span class="font-bold italic">Shopenade</span><span> 📦 🏃</span></div>
                <Suspense fallback={<div>Loading...</div>}>
                    <div class="flex flex-row items-center justify-center gap-2 px-2">
                        {authStore.idToken?.length > 0 ? (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={logout}
                                disabled={isLoadingStore.isLoading}
                            >
                                ログアウト
                            </Button>
                        ) : (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setIsLoginDialogOpen(true)}
                                disabled={isLoadingStore.isLoading}
                            >
                                ログイン
                            </Button>
                        )}
                    </div>
                </Suspense>
            </nav>
            <Portal mount={document.body}>
                <LoginDialog
                    isOpen={isLoginDialogOpen}
                    setIsOpen={setIsLoginDialogOpen}
                />
            </Portal>
        </>
    );
}

export default NavHeader;
