import { showToast } from "@/components/ui/toast";
import { ErrorClass } from "@/libs/form/validation";
import { messages } from "@/libs/const/messages";


/**
 * エラーを文字列に変換する
 * @param error エラー
 * @returns エラーの文字列
 */
export const serializeError = (error: unknown) => {
    if (error instanceof Error) {
        return error.message;
    } else if (typeof error === "string") {
        return error;
    } else if (typeof error === "object") {
        return Object.values(
            error as Record<string | number, string>
        ).join(" ");
    }
    return "エラーが発生しました";
};

/**
 * エラーオブジェクトに有効なエラーがあるかどうかをチェックする
 * @param errors Record<string, ErrorClass> エラーオブジェクト
 * @returns 有効なエラーがあるかどうか
 */
export const hasError = (errors: Record<string, ErrorClass>) => {
    console.log(errors);
    return Object.values(errors).some((error) => {
        if (typeof error === "string") {
            return error !== "" && error !== undefined && error !== null;
        } else if (typeof error === "object") {
            return Object.values(error).some((error) => {
                return error !== "" && error !== undefined && error !== null;
            });
        }
        return false;
    });
};

/**
 * エラーをクライアントに報告する
 * @param error エラー
 */
export const clientReportError = (error: unknown) => {
    const errorMessage = serializeError(error);
    showToast({
        title: "エラーが発生しました",
        description: messages[errorMessage as keyof typeof messages] ?? errorMessage,
        variant: "error",
    });
};
