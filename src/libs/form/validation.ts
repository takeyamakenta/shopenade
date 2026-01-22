import { Accessor, createEffect } from "solid-js";

import { createStore } from "solid-js/store";

export type Validator = (
    element: HTMLInputElement
) => Promise<string | undefined>;

export type ErrorClass = string | Record<string, string>;

function checkValid(
    {
        element,
        validators = [],
    }: { element: HTMLInputElement; validators: Validator[] },
    setErrors: (errors: Record<string, ErrorClass>) => void,
    errors: Record<string, ErrorClass>,
    errorClass: string
) {
    return async (
        e: Event | undefined = undefined,
        value: string | number | undefined | null = undefined
    ) => {
        if (value !== undefined) {
            element.value = value?.toString() ?? "";
        }
        void e;
        element.setCustomValidity("");
        element.checkValidity();
        let message = element.validationMessage;
        if (!message) {
            for (const validator of validators) {
                const text = await validator(element);
                if (text) {
                    element.setCustomValidity(text);
                    message = text;
                    break;
                }
            }
        }
        if (message) {
            if (errorClass) element.classList.toggle(errorClass, true);
            console.log("errors set", element.name, message);
            setErrors({ ...errors, [element.name]: message });
        } else {
            setErrors({ ...errors, [element.name]: "" });
        }
    };
}

export function useForm({ errorClass }: { errorClass: string }) {
    const [errors, setErrors] = createStore<Record<string, ErrorClass>>({});
    const configs: Record<
        string,
        { element: HTMLInputElement; validators: Validator[] }
    > = {};
    const fields: Record<string, string> = {};

    const validate = (
        ref: HTMLInputElement,
        accessor: () => [
            Validator[],
            Accessor<string | number | undefined | null>,
        ]
    ) => {
        const [accessorValue, valueAccessor] = accessor();
        const validators = Array.isArray(accessorValue) ? accessorValue : [];
        const config:
            | { element: HTMLInputElement; validators: Validator[] }
            | undefined = { element: ref, validators };
        createEffect(() => {
            configs[ref.name] = config;
        });
        createEffect(() => {
            if (ref.type === "hidden") {
                checkValid(
                    config,
                    setErrors,
                    errors,
                    errorClass
                )(undefined, valueAccessor());
                fields[ref.name] = ref.value;
            }
        });
        if (ref.type !== "hidden") {
            ref.onblur = checkValid(config, setErrors, errors, errorClass);
            ref.oninput = () => {
                if (errors[ref.name]) {
                    setErrors({ [ref.name]: undefined });
                    if (errorClass) ref.classList.toggle(errorClass, false);
                } else {
                    fields[ref.name] = ref.value;
                }
            };
        }
    };

    const formSubmit = (
        ref: HTMLInputElement,
        accessor: () => ((fields: Record<string, string>) => void) | undefined
    ) => {
        const callback = accessor() || (() => {});
        ref.setAttribute("novalidate", "");
        ref.onsubmit = async (e) => {
            e.preventDefault();
            e.stopPropagation();
            let errored = false;

            for (const k in configs) {
                const config = configs[k];
                await checkValid(config, setErrors, errors, errorClass)();
                if (!errored && config.element.validationMessage) {
                    config.element.focus();
                    errored = true;
                }
            }
            console.log({fields});
            if (!errored) callback(fields);
        };
    };
    return { validate, formSubmit, errors };
}
