
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ValidatedTextField } from "@/components/ui/validated-text-field";
import NavFooter from "@/layouts/NavFooter";
import NavHeader from "@/layouts/NavHeader";
import { createUser } from "@/libs/RPCs/auth/createUser";
import { clientReportError } from "@/libs/error/reportError";
import { useForm } from "@/libs/form/validation";
import { useIsLoadingStore } from "@/stores/isLoadingStore";
import { showToast } from "@/components/ui/toast";

export default function Register() {
    const { setIsLoadingStore, isLoadingStore } = useIsLoadingStore();

    const registerSubmit = async (fields: Record<string, string>) => {
        try {
            setIsLoadingStore("isLoading", true);

            const result = await createUser(fields.email, fields.password, fields.name);
            if (!result) {
                throw new Error("Failed to create user");
            }
            showToast({
                title: "アカウントを作成しました",
                description: "アカウントを作成しました",
                variant: "success",
            });
        } catch (error: unknown) {
            clientReportError(error);
        } finally {
            setIsLoadingStore("isLoading", false);
        }
    };

    const { validate, formSubmit, errors } = useForm({ errorClass: "error" });

    const validateConfirmPassword = (
        element: HTMLInputElement
    ): Promise<string | undefined> => {
        const form = element.closest("form");
        const passwordInput = form?.querySelector<HTMLInputElement>(
            "input[name=\"password\"]"
        );
        if (passwordInput && element.value !== passwordInput.value) {
            return Promise.resolve("パスワードが一致しません");
        }
        return Promise.resolve(undefined);
    };

    return (
        <>
            <NavHeader />
            <section class="flex min-h-screen">
                {/* Left side - Caption */}
                <div class="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 bg-transparent">
                    <h1 class="text-4xl font-bold text-gray-900 mb-4">
                        14日間の無料トライアルを始めよう
                    </h1>
                    <p class="text-lg text-gray-600">
                        クレジットカード不要で、すべての機能をお試しいただけます。
                    </p>
                </div>

                {/* Right side - Form */}
                <div class="w-full lg:w-1/2 flex flex-col items-center justify-center px-4 py-8 bg-white">
                    {/* Mobile caption */}
                    <div class="lg:hidden text-center mb-8">
                        <h1 class="text-2xl font-bold text-gray-900 mb-2">
                            14日間の無料トライアルを始めよう
                        </h1>
                        <p class="text-sm text-gray-600">
                            クレジットカード不要で、すべての機能をお試しいただけます。
                        </p>
                    </div>

                    <Card class="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>アカウント登録</CardTitle>
                            <CardDescription>
                                メールアドレスとパスワードで登録
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                class="flex w-full flex-col items-center gap-4"
                                // @ts-expect-error formSubmit is not a valid prop
                                use:formSubmit={registerSubmit}
                            >
                                <div class="grid w-full gap-4">
                                    <div>
                                        <ValidatedTextField
                                            validate={validate}
                                            class="w-full"
                                            name="name"
                                            type="text"
                                            placeholder="名前"
                                            required
                                        />
                                        <p class="mt-1 text-sm text-red-500">
                                            {errors.name as string}
                                        </p>
                                    </div>
                                    <div>
                                        <ValidatedTextField
                                            validate={validate}
                                            class="w-full"
                                            name="email"
                                            type="email"
                                            placeholder="メールアドレス"
                                            required
                                        />
                                        <p class="mt-1 text-sm text-red-500">
                                            {errors.email as string}
                                        </p>
                                    </div>
                                    <div>
                                        <ValidatedTextField
                                            validate={validate}
                                            class="w-full"
                                            name="password"
                                            type="password"
                                            placeholder="パスワード"
                                            required
                                            minLength={6}
                                        />
                                        <p class="mt-1 text-sm text-red-500">
                                            {errors.password as string}
                                        </p>
                                    </div>
                                    <div>
                                        <ValidatedTextField
                                            validate={validate}
                                            validators={[validateConfirmPassword]}
                                            class="w-full"
                                            name="confirmPassword"
                                            type="password"
                                            placeholder="パスワード（確認）"
                                            required
                                            minLength={6}
                                        />
                                        <p class="mt-1 text-sm text-red-500">
                                            {errors.confirmPassword as string}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    class="w-full"
                                    disabled={isLoadingStore.isLoading}
                                >
                                    登録する
                                </Button>
                                <p class="text-sm text-gray-600">
                                    すでにアカウントをお持ちですか？{" "}
                                    <a href="/" class="text-blue-600 hover:underline">
                                        ログイン
                                    </a>
                                </p>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </section>
            <NavFooter />
        </>
    );
}
