import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { JSX, ValidComponent } from "solid-js";
import { splitProps } from "solid-js";

import * as ButtonPrimitive from "@kobalte/core/button";
import type { PolymorphicProps } from "@kobalte/core/polymorphic";

import { cn } from "@/libs/utils";

import styles from "./button.module.css";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                primary:
                    "bg-blue-300/20 text-primary-theme-foreground hover:bg-blue-300/50 rounded-full",
                secondary:
                    "bg-green-300/10 text-secondary-theme-foreground hover:bg-green-300/50 rounded-full",
                destructive:
                    "bg-destructive text-destructive-foreground hover:bg-destructive/80 rounded-md",
                confirm:
                    "bg-confirm text-confirm-foreground hover:bg-confirm/70 rounded-md",
                inert:
                    "bg-inert text-inert-foreground hover:bg-inert/70 rounded-md",
                nav:
                    "bg-nav text-nav-foreground hover:bg-nav/70 rounded-md border border-nav shadow-[0px_0px_2px_2px_rgba(172_181_49_/0.5)]",
            },
            size: {
                md: "h-10 px-4 py-2",
                sm: "h-9 px-3 text-xs",
                lg: "h-11 px-8",
                icon: "size-10",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "md",
        },
    }
);

type ButtonProps<T extends ValidComponent = "button"> =
    ButtonPrimitive.ButtonRootProps<T> &
        VariantProps<typeof buttonVariants> & {
            class?: string | undefined;
            children?: JSX.Element;
        };

const Button = <T extends ValidComponent = "button">(
    props: PolymorphicProps<T, ButtonProps<T>>
) => {
    const [local, others] = splitProps(props as ButtonProps, [
        "variant",
        "size",
        "class",
    ]);
    return (
        <div
            class={
                others.disabled ? styles.disabled : styles[local.variant as string] ?? ""
            }
        >
            <ButtonPrimitive.Root
                class={cn(
                    buttonVariants({
                        variant: local.variant,
                        size: local.size,
                    }),
                    local.class
                )}
                {...others}
            />
        </div>
    );
};

export { Button, buttonVariants };
export type { ButtonProps };
