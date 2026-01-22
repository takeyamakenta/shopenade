import type { ValidComponent, VoidProps, Accessor } from "solid-js";
import { splitProps } from "solid-js";

import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import type { TextFieldInputProps } from "@kobalte/core/text-field";
import { Validator } from "@/libs/form/validation";

import { cn } from "@/libs/utils";

type myTextFieldInputProps<T extends ValidComponent = "input"> = VoidProps<
    TextFieldInputProps<T> & {
        class?: string;
        //validate?: (ref: HTMLInputElement, accessor: () => Validator[]) => void;
        validate?: (ref: HTMLInputElement, accessor: () => [Validator[], Accessor<string|undefined|null>]) => void;
        validators?: Validator[];
        valueAccessor?: Accessor<string|number|undefined|null>;
    }
>;


export const ValidatedTextField = <T extends ValidComponent = "input">(
    props: PolymorphicProps<T, myTextFieldInputProps<T>>
) => {
    const [local, rest] = splitProps(props as myTextFieldInputProps, ["class"]);
    // eslint-disable-next-line solid/reactivity
    const { validate } = rest;
    return (
        <input
            class={cn(
                "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-shadow file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[1.5px] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                local.class
            )}
            {...rest}
            // @ts-expect-error this is a solid-js component
            use:validate={[rest.validators ?? [], rest.valueAccessor ?? (() => undefined)]}
        />
    );
};
