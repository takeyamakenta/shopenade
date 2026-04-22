import { type VariantProps, cva } from "class-variance-authority";
import {
    type Accessor,
    type Component,
    type ComponentProps,
    type JSX,
    Ref,
    createContext,
    createMemo,
    createSignal,
    splitProps,
    useContext,
} from "solid-js";
import { Portal, Show } from "solid-js/web";
import { cn } from "@/libs/utils";

type OverlaySheetContextValue = {
    open: Accessor<boolean>;
    setOpen: (v: boolean) => void;
    toggle: () => void;
};

const OverlaySheetContext = createContext<OverlaySheetContextValue>();

const useOverlaySheet = () => {
    const ctx = useContext(OverlaySheetContext);
    if (!ctx) {
        throw new Error(
            "OverlaySheet subcomponents must be used within <OverlaySheet>"
        );
    }
    return ctx;
};

type OverlaySheetProps = {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: JSX.Element;
    portalRef?: Ref<HTMLDivElement>;
};

const OverlaySheet: Component<OverlaySheetProps> = (props) => {
    const [internalOpen, setInternalOpen] = createSignal(
        props.defaultOpen ?? false
    );
    const open = createMemo(() => props.open ?? internalOpen());
    const setOpen = (v: boolean) => {
        if (props.open === undefined) setInternalOpen(v);
        props.onOpenChange?.(v);
    };
    const toggle = () => setOpen(!open());

    return (
        <>
            <Show when={props.portalRef}>
                {(portalRef) => (
                    <Portal ref={portalRef}>
                        <OverlaySheetContext.Provider value={{ open, setOpen, toggle }}>
                            {props.children}
                        </OverlaySheetContext.Provider>
                    </Portal>
                )}
            </Show>
            <Show when={!props.portalRef}>
                <OverlaySheetContext.Provider value={{ open, setOpen, toggle }}>
                    {props.children}
                </OverlaySheetContext.Provider>
            </Show>
        </>
    );
};

const OverlaySheetTrigger: Component<ComponentProps<"button">> = (props) => {
    const ctx = useOverlaySheet();
    const [local, others] = splitProps(props, ["onClick"]);
    const handleClick: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (
        e
    ) => {
        if (typeof local.onClick === "function") local.onClick(e);
        ctx.toggle();
    };
    return (
        <button
            type="button"
            data-state={ctx.open() ? "open" : "closed"}
            onClick={handleClick}
            {...others}
        />
    );
};

const OverlaySheetClose: Component<ComponentProps<"button">> = (props) => {
    const ctx = useOverlaySheet();
    const [local, others] = splitProps(props, ["onClick"]);
    const handleClick: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (
        e
    ) => {
        if (typeof local.onClick === "function") local.onClick(e);
        ctx.setOpen(false);
    };
    return <button type="button" onClick={handleClick} {...others} />;
};

const overlaySheetWrapperVariants = cva(
    "pointer-events-none absolute inset-0 z-40 flex overflow-hidden",
    {
        variants: {
            position: {
                bottom: "flex-col",
                top: "flex-col-reverse",
            },
        },
        defaultVariants: { position: "bottom" },
    }
);

const overlaySheetFadeVariants = cva(
    "pointer-events-none flex-1 transition-opacity duration-300 ease-out",
    {
        variants: {
            position: {
                bottom: "bg-gradient-to-b from-transparent to-background",
                top: "bg-gradient-to-t from-transparent to-background",
            },
        },
        defaultVariants: { position: "bottom" },
    }
);

const overlaySheetPanelVariants = cva(
    "pointer-events-auto flex w-full flex-col overflow-y-auto bg-background shadow-lg transition-transform duration-300 ease-out",
    {
        variants: {
            position: {
                bottom:
                    "rounded-t-xl border-t data-[state=closed]:translate-y-full",
                top: "rounded-b-xl border-b data-[state=closed]:-translate-y-full",
            },
            size: {
                sm: "max-h-[40%]",
                md: "max-h-[60%]",
                lg: "max-h-[80%]",
                full: "max-h-full",
            },
        },
        defaultVariants: { position: "bottom", size: "md" },
    }
);

type OverlaySheetContentProps = ComponentProps<"div"> &
    VariantProps<typeof overlaySheetPanelVariants>;

const OverlaySheetContent: Component<OverlaySheetContentProps> = (props) => {
    const ctx = useOverlaySheet();
    const [local, others] = splitProps(props, [
        "class",
        "position",
        "size",
        "children",
    ]);
    const state = () => (ctx.open() ? "open" : "closed");
    return (
        <div
            data-state={state()}
            aria-hidden={!ctx.open()}
            class={cn(
                overlaySheetWrapperVariants({ position: local.position })
            )}
        >
            <div
                class={cn(
                    overlaySheetFadeVariants({ position: local.position }),
                    !ctx.open() && "opacity-0"
                )}
            />
            <div
                data-state={state()}
                class={cn(
                    overlaySheetPanelVariants({
                        position: local.position,
                        size: local.size,
                    }),
                    local.class
                )}
                {...others}
            >
                {local.children}
            </div>
        </div>
    );
};

const OverlaySheetHeader: Component<ComponentProps<"div">> = (props) => {
    const [local, others] = splitProps(props, ["class"]);
    return (
        <div
            class={cn(
                "flex flex-col space-y-1.5 px-4 pt-4 text-left",
                local.class
            )}
            {...others}
        />
    );
};

const OverlaySheetTitle: Component<ComponentProps<"h3">> = (props) => {
    const [local, others] = splitProps(props, ["class"]);
    return (
        <h3
            class={cn(
                "text-md font-semibold leading-none text-foreground",
                local.class
            )}
            {...others}
        />
    );
};

const OverlaySheetDescription: Component<ComponentProps<"p">> = (props) => {
    const [local, others] = splitProps(props, ["class"]);
    return (
        <p
            class={cn("text-sm text-muted-foreground", local.class)}
            {...others}
        />
    );
};

const OverlaySheetBody: Component<ComponentProps<"div">> = (props) => {
    const [local, others] = splitProps(props, ["class"]);
    return (
        <div
            class={cn("flex-1 overflow-y-auto px-4 pb-4 pt-2", local.class)}
            {...others}
        />
    );
};

const OverlaySheetFooter: Component<ComponentProps<"div">> = (props) => {
    const [local, others] = splitProps(props, ["class"]);
    return (
        <div
            class={cn(
                "flex flex-col-reverse gap-2 px-4 pb-4 pt-2 sm:flex-row sm:justify-end",
                local.class
            )}
            {...others}
        />
    );
};

export {
    OverlaySheet,
    OverlaySheetBody,
    OverlaySheetClose,
    OverlaySheetContent,
    OverlaySheetDescription,
    OverlaySheetFooter,
    OverlaySheetHeader,
    OverlaySheetTitle,
    OverlaySheetTrigger,
};
