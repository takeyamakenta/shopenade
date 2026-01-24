import { Accessor, Setter } from "solid-js";

import {
    signInWithEmailAndPassword
} from "firebase/auth";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ValidatedTextField } from "@/components/ui/validated-text-field";
import { login } from "@/libs/RPCs/auth/login";
import { clientReportError } from "@/libs/error/reportError";
import { auth } from "@/libs/firebase/client";
import { useForm } from "@/libs/form/validation";
import { useIsLoadingStore } from "@/stores/isLoadingStore";
import { showToast } from "@/components/ui/toast";

export function LoginDialog(props: {
    isOpen: Accessor<boolean>;
    setIsOpen: Setter<boolean>;
}) {
    const { setIsLoadingStore, isLoadingStore } = useIsLoadingStore();
    const loginSubmit = async (fields: Record<string, string>) => {
        try {
            setIsLoadingStore("isLoading", true);
            const result = await signInWithEmailAndPassword(
                auth,
                fields.email,
                fields.password
            );
            await login(await result.user?.getIdToken());
            showToast({
                title: "ログインしました",
                description: "ログインしました",
                variant: "success",
            });
        } catch (error: unknown) {
            clientReportError(error);
        } finally {
            setIsLoadingStore("isLoading", false);
        }
    };
    const { validate, formSubmit, errors } = useForm({ errorClass: "error" });
    return (
        <Dialog open={props.isOpen()} onOpenChange={props.setIsOpen}>
            <DialogContent class="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>ログインする</DialogTitle>
                    <DialogDescription>
                        Eメールとパスワードでログイン
                    </DialogDescription>
                </DialogHeader>
                <form
                    class="flex w-full flex-col items-center gap-4"
                    // @ts-expect-error formSubmit is not a valid prop
                    use:formSubmit={loginSubmit}
                >
                    <div class="grid w-full gap-4 py-4">
                        <ValidatedTextField
                            validate={validate}
                            class="w-full"
                            name="email"
                            type="email"
                            placeholder="Email"
                            required
                        />
                        <p>{errors.email as string}</p>
                        <ValidatedTextField
                            validate={validate}
                            class="w-full"
                            name="password"
                            type="password"
                            placeholder="Password"
                            required
                        />
                    </div>
                    <DialogFooter class="justify-right flex w-full flex-row gap-2">
                        <Button
                            type="submit"
                            disabled={isLoadingStore.isLoading}
                        >
                            ログイン
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
