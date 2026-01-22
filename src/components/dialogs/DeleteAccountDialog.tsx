import { Accessor, Setter, Show, createMemo } from "solid-js";

import { createAsync, query } from "@solidjs/router";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { showToast } from "@/components/ui/toast";
import { deleteAccount } from "@/libs/RPCs/account/deleteAccount";
import { doCheckClientAuthData } from "@/libs/auth/checkClientAuthData";
import { clientReportError, serializeError } from "@/libs/error/reportError";
import { useForm } from "@/libs/form/validation";
import { useAuthSession } from "@/sessions/authSession";
import { useAuthStore } from "@/stores/authStore";
import { useIsLoadingStore } from "@/stores/isLoadingStore";

import { ValidatedTextField } from "../ui/validated-text-field";

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
        return {
            isLoggedIn: true,
            clientAuthData,
        };
    }
}, "deleteAccountData");

export const route = {
    preload: () => initData(),
};

export function DeleteAccountDialog(props: {
    isOpen: Accessor<boolean>;
    setIsOpen: Setter<boolean>;
}) {
    const { setAuthStore } = useAuthStore();
    const deleteAccountData = createAsync(() => initData());

    if (deleteAccountData()?.isLoggedIn) {
        setAuthStore({
            authData: deleteAccountData()?.clientAuthData,
        });
    }

    const { setIsLoadingStore, isLoadingStore } = useIsLoadingStore();
    const deleteAccountSubmit = async (fields: Record<string, string>) => {
        try {
            setIsLoadingStore("isLoading", true);
            const result = await deleteAccount(fields.uid);
            if (result) {
                showToast({
                    title: "ユーザーアカウントを削除しました",
                    description: "ユーザーアカウントを削除しました",
                    variant: "success",
                });
                props.setIsOpen(false);
            } else {
                throw new Error(serializeError("Failed to delete account"));
            }
        } catch (error: unknown) {
            clientReportError(error);
        } finally {
            setIsLoadingStore("isLoading", false);
        }
    };

    const hasAnyError = createMemo(() => {
        return false;
    });

    const handleOpenChange = (open: boolean) => {
        props.setIsOpen(open);
    };

    const formObject = useForm({ errorClass: "error" });
    const { errors, validate } = formObject;
    // ↓は、use:directiveで、formSubmitがデッドコードと見做されないようにするための措置
    // デッドコードになると formSubmit is not defined というエラーが出る
    // 明らかにバグなのでそのうち修正されると思う
    const formSubmit = formObject.formSubmit;

    return (
        <Dialog open={props.isOpen()} onOpenChange={handleOpenChange}>
            <Show when={deleteAccountData()?.isLoggedIn} keyed={true}>
                <DialogContent class="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>アカウントを削除</DialogTitle>
                        <DialogDescription>
                            アカウントを削除します。
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        class="flex w-full flex-col items-center gap-4"
                        // @ts-expect-error formSubmit is not a valid prop
                        use:formSubmit={deleteAccountSubmit}
                    >
                        <ValidatedTextField
                            type="hidden"
                            name="uid"
                            valueAccessor={() =>
                                deleteAccountData()?.clientAuthData?.uid
                            }
                            validate={validate}
                        />
                        <p class="text-red-500">{errors.uid as string}</p>
                        <DialogFooter class="justify-right flex w-full flex-row gap-2">
                            <Button
                                type="submit"
                                disabled={
                                    isLoadingStore.isLoading || hasAnyError()
                                }
                            >
                                削除する
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Show>
            <Show when={!deleteAccountData()?.isLoggedIn} keyed={true}>
                <DialogContent class="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>アカウントを削除</DialogTitle>
                        <DialogDescription>
                            アカウントを削除します。
                        </DialogDescription>
                    </DialogHeader>
                    <p>ログインしていません</p>
                </DialogContent>
            </Show>
        </Dialog>
    );
}
