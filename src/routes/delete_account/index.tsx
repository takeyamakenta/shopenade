import { Show, Suspense, createSignal } from "solid-js";

import { query } from "@solidjs/router";
import { Portal } from "solid-js/web";

import { DeleteAccountDialog } from "@/components/dialogs/DeleteAccountDialog";
import { Button } from "@/components/ui/button";
import NavFooter from "@/layouts/NavFooter";
import NavHeader from "@/layouts/NavHeader";
import { getTimetables } from "@/libs/RPCs/busstop/getTimetables";
import { formatDate } from "@/libs/date/formatDate";
import { useAuthStore } from "@/stores/authStore";

const initData = query(async (poleId, routePatternids: string[]) => {
    "use server";
    return await getTimetables(poleId, routePatternids, formatDate(new Date()));
}, "timetables");

export const route = {
    preload: (poleId: string, routePatternids: string[]) =>
        initData(poleId, routePatternids),
};

export default function DeleteAccount() {
    const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] =
        createSignal(false);

    function DeleteSection() {
        const { authStore } = useAuthStore();
        console.log({ authStore });
        const handleDeleteAccountDialog = async () => {
            if (isDeleteAccountDialogOpen()) {
                setIsDeleteAccountDialogOpen(false);
            } else {
                setIsDeleteAccountDialogOpen(true);
            }
        };

        return (
            <>
                <h1>アカウントを削除</h1>
                <Show when={authStore.authData?.uid}>
                    <section class="flex flex-col gap-2">
                        <p>アカウントを削除すると回復できません。</p>
                        <Button onClick={handleDeleteAccountDialog}>
                            アカウントを削除
                        </Button>
                    </section>
                </Show>
                <Show when={!authStore.authData?.uid}>
                    <p>ログインしていません</p>
                </Show>
            </>
        );
    }

    return (
        <>
            <NavHeader />
            <Suspense fallback={<div>Loading...</div>}>
                <DeleteSection />
            </Suspense>
            <NavFooter />
            <Portal mount={document.body}>
                <DeleteAccountDialog
                    isOpen={isDeleteAccountDialogOpen}
                    setIsOpen={setIsDeleteAccountDialogOpen}
                />
            </Portal>
        </>
    );
}
