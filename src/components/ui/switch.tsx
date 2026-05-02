import type { JSX, ValidComponent } from "solid-js";
import { splitProps } from "solid-js";

import type { PolymorphicProps } from "@kobalte/core";
import * as SwitchPrimitive from "@kobalte/core/switch";

import { cn } from "@/libs/utils";
import { cva } from "class-variance-authority";

const Switch = SwitchPrimitive.Root;
const SwitchDescription = SwitchPrimitive.Description;
const SwitchErrorMessage = SwitchPrimitive.ErrorMessage;

const controlVariants = cva(
  "opacity-70",
  {
      variants: {
          variant: {
              primary:
                  "inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-primary-theme-foreground transition-[color,background-color,box-shadow] data-[disabled]:cursor-not-allowed data-[checked]:bg-primary-theme data-[disabled]:opacity-50"
           },
      },
      defaultVariants: {
          variant: "primary",
      },
  }
);
const thumbVariants = cva(
  "opacity-70",
  {
      variants: {
          variant: {
              primary:
                  "pointer-events-none block size-5 translate-x-0 rounded-full bg-primary-theme shadow-lg ring-0 transition-[color,background-color,box-shadow,transform] data-[checked]:translate-x-5 data-[checked]:bg-primary-theme-foreground",
           },
      },
      defaultVariants: {
          variant: "primary",
      },
  }
);

type SwitchControlProps = SwitchPrimitive.SwitchControlProps & {
    class?: string | undefined;
    children?: JSX.Element;
};

const SwitchControl = <T extends ValidComponent = "input">(
    props: PolymorphicProps<T, SwitchControlProps>
) => {
    const [local, others] = splitProps(props as SwitchControlProps, [
        "class",
        "children",
    ]);
    return (
        <>
            <SwitchPrimitive.Input
                class={cn(
                    "[&:focus-visible+div]:outline-none [&:focus-visible+div]:ring-2 [&:focus-visible+div]:ring-ring [&:focus-visible+div]:ring-offset-2 [&:focus-visible+div]:ring-offset-background",
                    local.class
                )}
            />
            <SwitchPrimitive.Control
                class={cn(
                    controlVariants({ variant: "primary" }),
                    local.class
                )}
                {...others}
            >
                {local.children}
            </SwitchPrimitive.Control>
        </>
    );
};

type SwitchThumbProps = SwitchPrimitive.SwitchThumbProps & {
    class?: string | undefined;
};

const SwitchThumb = <T extends ValidComponent = "div">(
    props: PolymorphicProps<T, SwitchThumbProps>
) => {
    const [local, others] = splitProps(props as SwitchThumbProps, ["class"]);
    return (
        <SwitchPrimitive.Thumb
            class={cn(
                thumbVariants({ variant: "primary" }),
                local.class
            )}
            {...others}
        />
    );
};

type SwitchLabelProps = SwitchPrimitive.SwitchLabelProps & {
    class?: string | undefined;
};

const SwitchLabel = <T extends ValidComponent = "label">(
    props: PolymorphicProps<T, SwitchLabelProps>
) => {
    const [local, others] = splitProps(props as SwitchLabelProps, ["class"]);
    return (
        <SwitchPrimitive.Label
            class={cn(
                "text-sm font-medium leading-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-70",
                local.class
            )}
            {...others}
        />
    );
};

export {
    Switch,
    SwitchControl,
    SwitchDescription,
    SwitchErrorMessage,
    SwitchLabel,
    SwitchThumb,
};
