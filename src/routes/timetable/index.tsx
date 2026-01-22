import { Bell, Trash2 } from "lucide-solid";
import { For, Show, Suspense, createMemo, createSignal } from "solid-js";

import { createAsync, query, useSearchParams } from "@solidjs/router";
import { Portal } from "solid-js/web";

import { OneShotNotificationSchedule } from "@/@types/OneShotNotificationSchedule";
import type { Timetable } from "@/@types/Timetable";
import { NotificationConfigDialog } from "@/components/dialogs/NotificationConfigDialog";
import { showToast } from "@/components/ui/toast";
import NavFooter from "@/layouts/NavFooter";
import NavHeader from "@/layouts/NavHeader";
import { getTimetables } from "@/libs/RPCs/busstop/getTimetables";
import { deleteOneShotNotification } from "@/libs/RPCs/notification/deleteOneShotNotificationts";
import { getBeforeTimetables } from "@/libs/RPCs/notification/getBeforeTimetables";
import { formatDate } from "@/libs/date/formatDate";
import { clientReportError, serializeError } from "@/libs/error/reportError";
import { useIsLoadingStore } from "@/stores/isLoadingStore";

const initData = query(async (poleId, routePatternids: string[]) => {
    "use server";
    return await getTimetables(poleId, routePatternids, formatDate(new Date()));
}, "timetables");

export const route = {
    preload: (poleId: string, routePatternids: string[]) =>
        initData(poleId, routePatternids),
};

export default function Timetable() {
    const { setIsLoadingStore } = useIsLoadingStore();
    const [isNotificationConfigDialogOpen, setIsNotificationConfigDialogOpen] =
        createSignal(false);
    const [editingNotification, setEditingNotification] = createSignal<
        OneShotNotificationSchedule | undefined
    >(undefined);

    const [beforeTimetables, setBeforeTimetables] = createSignal<Timetable[]>(
        []
    );
    const [endTimetableId, setEndTimetableId] = createSignal<
        number | undefined
    >(undefined);

    function RouteList() {
        const [searchParams] = useSearchParams();
        const initTimetables = createAsync(() =>
            initData(
                searchParams.pole_id as string,
                searchParams.route_pattern_ids as string[]
            )
        );
        const handleNotificationConfigDialog = async (timetableId: number) => {
            if (isNotificationConfigDialogOpen()) {
                setIsNotificationConfigDialogOpen(false);
                setEditingNotification(undefined);
            } else {
                setEndTimetableId(timetableId);
                // 今日の日付を取得
                const day = new Date().toISOString().split("T")[0];
                const beforeTimetables = await getBeforeTimetables(
                    timetableId,
                    day
                );
                setBeforeTimetables(beforeTimetables);
                const timetable = initTimetables()?.find(
                    (t: Timetable) => t.id === timetableId
                );
                if (timetable) {
                    setEditingNotification(
                        timetable.one_shot_notification_schedules?.[0]
                    );
                }
                setIsNotificationConfigDialogOpen(true);
            }
        };

        const handleDeleteNotification = async (id: number | undefined) => {
            if (!id) {
                return;
            }
            try {
                setIsLoadingStore("isLoading", true);
                const result = await deleteOneShotNotification(id);
                if (result) {
                    showToast({
                        title: "通知設定を削除しました",
                        description: "通知設定を削除しました",
                        variant: "success",
                    });
                } else {
                    throw new Error(
                        serializeError("Failed to register notification")
                    );
                }
            } catch (error: unknown) {
                clientReportError(error);
            } finally {
                setIsLoadingStore("isLoading", false);
            }
        };

        const availableTimetables = createMemo(() => {
            return ((initTimetables() ?? []) as Timetable[]).filter(
                (t) => t.arrival_timestamp > Math.floor(Date.now() / 1000)
            );
        });

        return (
            <>
                <h1>{searchParams.pole_title}</h1>
                <Show when={availableTimetables().length}>
                    <section class="flex flex-col gap-2">
                        <For each={availableTimetables()}>
                            {(timetable) => (
                                <div class="flex items-center gap-2">
                                    <div
                                        class="flex items-center gap-2"
                                        onClick={
                                            () =>
                                                console.log(
                                                    "handleNotificationConfigDialog disabled"
                                                )
                                            // handleNotificationConfigDialog(
                                            //     timetable.id
                                            // )
                                        }
                                    >
                                        {timetable.arrival_clock}
                                    </div>
                                    <Show
                                        when={
                                            timetable
                                                .one_shot_notification_schedules
                                                ?.length
                                        }
                                    >
                                        <Bell />
                                        <Trash2
                                            onClick={() =>
                                                handleDeleteNotification(
                                                    timetable
                                                        .one_shot_notification_schedules?.[0]
                                                        ?.id
                                                )
                                            }
                                        />
                                    </Show>
                                </div>
                            )}
                        </For>
                    </section>
                </Show>
                <Show when={!availableTimetables().length}>
                    <p>利用可能な時刻表がありません</p>
                </Show>
            </>
        );
    }

    return (
        <>
            <NavHeader />
            <Suspense fallback={<div>Loading...</div>}>
                <RouteList />
            </Suspense>
            <NavFooter />
            <Portal mount={document.body}>
                <NotificationConfigDialog
                    isOpen={isNotificationConfigDialogOpen}
                    setIsOpen={setIsNotificationConfigDialogOpen}
                    beforeTimetables={beforeTimetables}
                    endTimetableId={endTimetableId()}
                    editingNotification={editingNotification()}
                />
            </Portal>
        </>
    );
}
