import { Accessor, Setter, Show, createMemo, createSignal, createEffect } from "solid-js";

import { createAsync, query } from "@solidjs/router";

import { MinuteOption } from "@/@types/MinuteOption";
import { Timetable } from "@/@types/Timetable";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { showToast } from "@/components/ui/toast";
import { putOneShotNotification } from "@/libs/RPCs/notification/putOneShotNotificationts";
import { doCheckClientAuthData } from "@/libs/auth/checkClientAuthData";
import {
    clientReportError,
    hasError,
    serializeError,
} from "@/libs/error/reportError";
import { Validator, useForm } from "@/libs/form/validation";
import { useAuthSession } from "@/sessions/authSession";
import { useIsLoadingStore } from "@/stores/isLoadingStore";

import { ValidatedTextField } from "../ui/validated-text-field";
import { findMinuteByNumber } from "./findMinuteByNumber";
import { findTimetableById } from "./findTimetableById";
import { OneShotNotificationSchedule } from "@/@types/OneShotNotificationSchedule";

export type DayOption = {
    label: string;
    value: string;
};

const initData = query(async () => {
    "use server";
    const { data: authSession } = await useAuthSession();
    console.log({ authSession });
    if (!authSession?.idToken || !authSession?.uid) {
        return { isLoggedIn: false };
    } else {
        const clientAuthData = await doCheckClientAuthData(authSession);
        if (!clientAuthData) {
            return { isLoggedIn: false };
        }
        return { isLoggedIn: true, clientAuthData };
    }
}, "notificationConfig");

export const route = {
    preload: () => initData(),
};

export function NotificationConfigDialog(props: {
    isOpen: Accessor<boolean>;
    setIsOpen: Setter<boolean>;
    beforeTimetables: Accessor<Timetable[]>;
    endTimetableId: number | undefined;
    editingNotification: OneShotNotificationSchedule | undefined;
}) {
    const minuteOptions: MinuteOption[] = [
        { label: "10分", value: 10 },
        { label: "20分", value: 20 },
        { label: "30分", value: 30 },
        { label: "40分", value: 40 },
        { label: "50分", value: 50 },
    ];
    const notificationConfig = createAsync(() => initData());

    const { setIsLoadingStore, isLoadingStore } = useIsLoadingStore();
    const notificationSubmit = async (fields: Record<string, string>) => {
        try {
            setIsLoadingStore("isLoading", true);
            const result = await putOneShotNotification(
                fields.day,
                parseInt(fields.start_timetable_id),
                parseInt(fields.end_timetable_id),
                parseInt(fields.timetable_former_mins),
                props.editingNotification?.id
            );
            if (result) {
                showToast({
                    title: "通知設定を登録しました",
                    description: "通知設定を登録しました",
                    variant: "success",
                });
                props.setIsOpen(false);
            } else {
                throw new Error(serializeError("Failed to register notification"));
            }
        } catch (error: unknown) {
            clientReportError(error);
        } finally {
            setIsLoadingStore("isLoading", false);
        }
    };

    const [selectedDay] = createSignal<DayOption | undefined | null>({
        label: "今日",
        value: new Date().toISOString().split("T")[0],
    });
    const [selectedTimetable, setSelectedTimetable] = createSignal<
        Timetable | undefined | null
    >(undefined);
    const [selectedMinute, setSelectedMinute] = createSignal<
        MinuteOption | undefined | null
    >(undefined);

    const validators: Validator[] = [
        async (element: HTMLInputElement) => {
            if (!element.value && element.id) {
                return "選択してください";
            }
            return undefined;
        },
    ];

    // 一旦
    const formObject = useForm({ errorClass: "error" });
    const { errors, validate } = formObject;
    // ↓は、use:directiveで、formSubmitがデッドコードと見做されないようにするための措置
    // デッドコードになると formSubmit is not defined というエラーが出る
    // 明らかにバグなのでそのうち修正されると思う
    const formSubmit = formObject.formSubmit;
    const hasAnyError = createMemo(() => {
        return hasError(errors);
    });

    const handleOpenChange = (open: boolean) => {
        if (open === false) {
            setSelectedTimetable(undefined);
            setSelectedMinute(undefined);
        }
        props.setIsOpen(open);
    };

    createEffect(() => {
        if (props.isOpen()) {
            console.log(props.editingNotification);
            setSelectedTimetable(findTimetableById(props.editingNotification?.start_timetable_id?.toString(), props.beforeTimetables()));
            setSelectedMinute(findMinuteByNumber(props.editingNotification?.timetable_former_mins?.toString(), minuteOptions));
        } else {
            setSelectedTimetable(undefined);
            setSelectedMinute(undefined);
        }
    });

    return (
        <Dialog open={props.isOpen()} onOpenChange={handleOpenChange}>
            <Show
                when={notificationConfig()?.isLoggedIn && props.endTimetableId}
                keyed={true}
            >
                <DialogContent class="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>通知設定</DialogTitle>
                        <DialogDescription>
                            通知設定を行います。
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        class="flex w-full flex-col items-center gap-4"
                        // @ts-expect-error formSubmit is not a valid prop
                        use:formSubmit={notificationSubmit}
                    >
                        <ValidatedTextField
                            type="hidden"
                            name="day"
                            valueAccessor={() =>
                                selectedDay()?.value.toString()
                            }
                            validate={validate}
                        />
                        <ValidatedTextField
                            type="hidden"
                            name="start_timetable_id"
                            valueAccessor={() =>
                                selectedTimetable()?.id.toString()
                            }
                            validate={validate}
                            validators={validators}
                        />
                        <ValidatedTextField
                            type="hidden"
                            name="end_timetable_id"
                            valueAccessor={() =>
                                props.endTimetableId?.toString()
                            }
                            validate={validate}
                            validators={validators}
                        />
                        <ValidatedTextField
                            type="hidden"
                            name="timetable_former_mins"
                            valueAccessor={() =>
                                selectedMinute()?.value.toString()
                            }
                            validate={validate}
                            validators={validators}
                        />

                        <div class="w-full gap-1 py-0">
                            <p class="text-md mb-2 pl-2">前のバス停</p>
                            <Select
                                value={selectedTimetable()?.id.toString()}
                                onChange={(value: string | null) => {
                                    setSelectedTimetable(
                                        findTimetableById(
                                            value,
                                            props.beforeTimetables()
                                        )
                                    );
                                }}
                                options={props
                                    .beforeTimetables()
                                    .filter(t => t.arrival_timestamp > Math.floor(Date.now()/1000))
                                    .map((timetable) =>
                                        timetable.id.toString()
                                    )}
                                itemComponent={(p) => {
                                    return (
                                        <SelectItem item={p.item}>
                                            {props
                                                .beforeTimetables()
                                                .indexOf(
                                                    findTimetableById(
                                                        p.item.rawValue,
                                                        props.beforeTimetables()
                                                    )!
                                                ) + 1}{" "}
                                            停前{" "}
                                            {
                                                findTimetableById(
                                                    p.item.rawValue,
                                                    props.beforeTimetables()
                                                )?.pole?.name_ja
                                            }
                                        </SelectItem>
                                    );
                                }}
                            >
                                <SelectTrigger class="w-full">
                                    <SelectValue<string> class="w-full">
                                        {(state) =>
                                            findTimetableById(
                                                state.selectedOption(),
                                                props.beforeTimetables()
                                            )?.pole?.name_ja
                                        }
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent class="max-h-[200px] w-full overflow-y-auto" />
                            </Select>
                            <p>を通過した時、または</p>
                            <p class="text-red-500">
                                {errors.start_timetable_id as string}
                            </p>
                        </div>
                        <div class="w-full gap-1 py-0">
                            <p class="text-md mb-2 pl-2">到着予定時間の</p>
                            <Select
                                value={selectedMinute()?.value.toString()}
                                onChange={(value: string | null) => {
                                    setSelectedMinute(
                                        findMinuteByNumber(value, minuteOptions)
                                    );
                                }}
                                options={minuteOptions.map((option) =>
                                    option.value.toString()
                                )}
                                itemComponent={(p) => {
                                    return (
                                        <SelectItem item={p.item}>
                                            {
                                                findMinuteByNumber(
                                                    p.item.rawValue,
                                                    minuteOptions
                                                )?.label
                                            }
                                        </SelectItem>
                                    );
                                }}
                            >
                                <SelectTrigger class="w-full">
                                    <SelectValue<string> class="w-full">
                                        {(state) =>
                                            findMinuteByNumber(
                                                state.selectedOption(),
                                                minuteOptions
                                            )?.label
                                        }
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent />
                            </Select>
                            <p>前に通知する</p>
                            <p class="text-red-500">
                                {errors.timetable_former_mins as string}
                            </p>
                        </div>
                        <DialogFooter class="justify-right flex w-full flex-row gap-2">
                            <Button
                                type="submit"
                                disabled={
                                    isLoadingStore.isLoading || hasAnyError()
                                }
                            >
                                登録する
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Show>
            <Show when={!notificationConfig()?.isLoggedIn} keyed={true}>
                <DialogContent class="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>通知設定</DialogTitle>
                        <DialogDescription>
                            通知設定を行います。
                        </DialogDescription>
                    </DialogHeader>
                    <p>通知機能の使用には登録とログインが必要です</p>
                </DialogContent>
            </Show>
            <Show when={!props.endTimetableId} keyed={true}>
                <DialogContent class="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>通知設定</DialogTitle>
                    </DialogHeader>
                    <p>到着時刻が選択されていません</p>
                </DialogContent>
            </Show>
        </Dialog>
    );
}
