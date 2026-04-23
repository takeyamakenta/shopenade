import { type VariantProps, cva } from "class-variance-authority";
import {
    type Accessor,
    type Component,
    type ComponentProps,
    type JSX,
    Setter,
    createContext,
    createMemo,
    createSignal,
    splitProps,
    useContext,
} from "solid-js";
import { Portal, Show } from "solid-js/web";
import { cn } from "@/libs/utils";

type OverlaySheetContextValue = {
    topOpen: Accessor<boolean>;
    bottomOpen: Accessor<boolean>;
    setTopOpen: (v: boolean) => void;
    setBottomOpen: (v: boolean) => void;
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
    topOpen?: boolean;
    setTopOpen?: Setter<boolean>;
    bottomOpen?: boolean;
    setBottomOpen?: Setter<boolean>;
    defaultOpen?: boolean;
    defaultTopOpen?: boolean;
    defaultBottomOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onTopOpenChange?: (open: boolean) => void;
    onBottomOpenChange?: (open: boolean) => void;
    children?: JSX.Element;
    portalMount?: Node;
};

const OverlaySheet: Component<OverlaySheetProps> = (props) => {
    const [internalTopOpen, setInternalTopOpen] = createSignal(
        props.defaultTopOpen ?? false
    );
    const [internalBottomOpen, setInternalBottomOpen] = createSignal(
        props.defaultBottomOpen ?? false
    );

    const topOpen = createMemo(() => props.topOpen ?? internalTopOpen());
    const bottomOpen = createMemo(() => props.bottomOpen ?? internalBottomOpen());
    const setTopOpen = (v: boolean) => {
        if (props.topOpen === undefined) {
            setInternalTopOpen(v);
        } else {
            props.setTopOpen?.(v);
        }
        props.onTopOpenChange?.(v);
    };
    const setBottomOpen = (v: boolean) => {
        if (props.bottomOpen === undefined) {
            setInternalBottomOpen(v);
        } else {
            props.setBottomOpen?.(v);
        }
        props.onBottomOpenChange?.(v);
    };

    return (
        <>
            <Show when={props.portalMount}>
                {(portalMount) => (
                    <Portal mount={portalMount()}>
                        <OverlaySheetContext.Provider value={{ topOpen, bottomOpen, setTopOpen, setBottomOpen }}>
                            {props.children}
                        </OverlaySheetContext.Provider>
                    </Portal>
                )}
            </Show>
            <Show when={!props.portalMount}>
                <OverlaySheetContext.Provider value={{ topOpen, bottomOpen, setTopOpen, setBottomOpen }}>
                    {props.children}
                </OverlaySheetContext.Provider>
            </Show>
        </>
    );
};

const OverlaySheetTopClose: Component<ComponentProps<"button">> = (props) => {
    const ctx = useOverlaySheet();
    const [local, others] = splitProps(props, ["onClick"]);
    const handleClick: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (
        e
    ) => {
        if (typeof local.onClick === "function") local.onClick(e);
        ctx.setTopOpen(false);
    };
    return <button type="button" onClick={handleClick} {...others} />;
};

const OverlaySheetBottomClose: Component<ComponentProps<"button">> = (props) => {
    const ctx = useOverlaySheet();
    const [local, others] = splitProps(props, ["onClick"]);
    const handleClick: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (
        e
    ) => {
        if (typeof local.onClick === "function") local.onClick(e);
        ctx.setBottomOpen(false);
    };
    return <button type="button" onClick={handleClick} {...others} />;
};

const overlaySheetWrapperVariants = cva(
    "absolute inset-0 z-40 flex flex-col overflow-hidden",
    {
        variants: {
            openState: {
                open: "bg-background opacity-90 pointer-events-auto",
                "top-open": "bg-gradient-to-t from-transparent to-background pointer-events-none",
                "bottom-open": "bg-gradient-to-b from-transparent to-background pointer-events-none",
                closed: "bg-opacity-0 pointer-events-none",
            },
        },
        defaultVariants: { openState: "closed" },
    }
);

const overlaySheetFillerVariants = cva(
    "",
    {
        variants: {
            openState: {
                open: "opacity-100",
                "top-open": "opacity-100",
                "bottom-open": "opacity-100",
                closed: "opacity-0",
            },
        },
        defaultVariants: { openState: "closed" },
    }
);


const overlaySheetPanelVariants = cva(
    "pointer-events-auto flex w-full flex-col overflow-y-auto bg-background shadow-lg transition-[transform,opacity] duration-300 ease-out data-[state=closed]:opacity-0",
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
    VariantProps<typeof overlaySheetPanelVariants> & {
        topChildren?: JSX.Element;
        bottomChildren?: JSX.Element;
        centerChildren?: JSX.Element;
    };

const OverlaySheetContent: Component<OverlaySheetContentProps> = (props) => {
    const ctx = useOverlaySheet();
    const [local, others] = splitProps(props, [
        "class",
        "position",
        "size",
        "topChildren",
        "bottomChildren",
        "centerChildren",
    ]);
    const state = () => {
        if (ctx.topOpen() && ctx.bottomOpen()) {
            return "open";
        } else if (ctx.topOpen()) {
            return "top-open";
        } else if (ctx.bottomOpen()) {
            return "bottom-open";
        } else {
            return "closed";
        }
    };
    const topState = () => (ctx.topOpen() ? "open" : "closed");
    const bottomState = () => (ctx.bottomOpen() ? "open" : "closed");

    return (
        <div
            data-state={state()}
            aria-hidden={!(ctx.topOpen() || ctx.bottomOpen())}
            class={cn(
                overlaySheetWrapperVariants({ openState: state() }),
            )}
        >
            <div
                data-state={topState()}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                class={cn(
                    overlaySheetPanelVariants({
                        position: "top",
                        size: local.size,
                    }),
                    local.class,
                    "h-2/5"
                )}
                {...others}
            >
                {local.topChildren}
            </div>
            <div
                data-state={state()}
                class={cn(
                    overlaySheetFillerVariants({ openState: state() }),
                    "pointer-events-none w-full h-full inline-flex justify-center items-center",
                    "h-1/5 min-h-[64px]"
                )}
            >
                {local.centerChildren}
            </div>
            <div
                data-state={bottomState()}
                class={cn(
                    overlaySheetPanelVariants({
                        position: "bottom",
                        size: local.size,
                    }),
                    local.class,
                    "h-2/5"
                )}
                {...others}
            >
                {local.bottomChildren}
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
    OverlaySheetTopClose,
    OverlaySheetBottomClose,
    OverlaySheetContent,
    OverlaySheetDescription,
    OverlaySheetFooter,
    OverlaySheetHeader,
    OverlaySheetTitle,
};
