import { FileText, MessageCircleQuestion, Shield } from "lucide-solid";
import { Accessor, For, Show, createMemo } from "solid-js";

import { useNavigate } from "@solidjs/router";

import { GrantedPrevilege } from "@/@types/GrantedPrevilege";
import { Button } from "@/components/ui/button";
import { usePrevilege } from "@/context/previlegeContext";
import { collectMenu } from "@/libs/auth/collectMenu";
import { routePrevileges } from "@/libs/const/routePrevileges";
import { useAuthStore } from "@/stores/authStore";
import { useAppId } from "@/context/appIdContext";

import styles from "./Layout.module.css";

function NavFooter() {
    const navigate = useNavigate();
    const { authStore } = useAuthStore();
    const { previleges } = usePrevilege() as {
        previleges: Accessor<GrantedPrevilege[] | null>;
    };
    const { appId } = useAppId() as { appId: Accessor<number | null> };
    const menuItems = createMemo(() => {
        if (appId() === null) {
            return null;
        }
        const menuDict = collectMenu(
            previleges() ?? [],
            routePrevileges,
            authStore.role,
            appId()
        );
        // flat 化 してから uniq にする
        const result = Object.values(menuDict ?? {})
            .flat()
            .filter(
                (menuItem, index, self) =>
                    index === self.findIndex((t) => t.path === menuItem.path)
            );
        return result;
    });

    return (
        <>
            <nav class={`${styles.footer} bg-gray-800 text-yellow-100`}>
                <div class="flex flex-row items-center justify-center gap-4 px-2">
                    <Show
                        when={menuItems()?.length}
                        fallback={
                            <>
                                <Button
                                    variant="nav"
                                    size="sm"
                                    onClick={() => navigate("/tokushoho")}
                                >
                                    <FileText class="h-6 w-6 sm:h-5 sm:w-5" />
                                    <span class="ml-2 hidden sm:inline">
                                        特定商取引法に基づく表記
                                    </span>
                                </Button>
                                <Button
                                    variant="nav"
                                    size="sm"
                                    onClick={() => navigate("/privacy")}
                                >
                                    <Shield class="h-6 w-6 sm:h-5 sm:w-5" />
                                    <span class="ml-2 hidden sm:inline">
                                        プライバシーポリシー
                                    </span>
                                </Button>
                            </>
                        }
                    >
                        <Show when={menuItems()?.length}>
                            <For each={Object.values(menuItems() ?? [])}>
                                {(menuItem) => {
                                    // LucideIcon | undefined は JSX タグにできないため、フォールバック付きでコンポーネントに束縛する
                                    const Icon =
                                        menuItem.icon ?? MessageCircleQuestion;
                                    return (
                                        <Button
                                            variant="nav"
                                            size="sm"
                                            onClick={() =>
                                                navigate(menuItem.path)
                                            }
                                        >
                                            <Icon class="h-6 w-6 sm:h-5 sm:w-5" />
                                            <span class="ml-2 hidden sm:inline">
                                                {menuItem.menu_description}
                                            </span>
                                        </Button>
                                    );
                                }}
                            </For>
                        </Show>
                    </Show>
                </div>
            </nav>
        </>
    );
}

export default NavFooter;
