import { type VariantProps, cva } from "class-variance-authority";
import {
    type Accessor,
    type Component,
    type ComponentProps,
    type JSX,
    Setter,
    Show,
    createContext,
    createMemo,
    createSignal,
    splitProps,
    useContext,
} from "solid-js";

import { Portal } from "solid-js/web";

import { Button } from "@/components/ui/button";
import { cn } from "@/libs/utils";

type OverlaySheetContextValue = {
    topOpen: Accessor<boolean>;
    bottomOpen: Accessor<boolean>;
    setTopOpen: (v: boolean) => void;
    setBottomOpen: (v: boolean) => void;
    topHeight: Accessor<string | undefined>;
    bottomHeight: Accessor<string | undefined>;
    centerHeight: Accessor<string | undefined>;
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
    onTopOpenChange?: (open: boolean) => void;
    onBottomOpenChange?: (open: boolean) => void;
    topHeight?: string;
    centerHeight?: string;
    bottomHeight?: string;
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
    const bottomOpen = createMemo(
        () => props.bottomOpen ?? internalBottomOpen()
    );
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

    const topHeight = createMemo(() => props.topHeight ?? undefined);
    const bottomHeight = createMemo(() => props.bottomHeight ?? undefined);
    const centerHeight = createMemo(() => props.centerHeight ?? undefined);
    return (
        <>
            <Show when={props.portalMount}>
                {(portalMount) => (
                    <Portal mount={portalMount()}>
                        <OverlaySheetContext.Provider
                            value={{
                                topOpen,
                                bottomOpen,
                                setTopOpen,
                                setBottomOpen,
                                topHeight,
                                bottomHeight,
                                centerHeight,
                            }}
                        >
                            {props.children}
                        </OverlaySheetContext.Provider>
                    </Portal>
                )}
            </Show>
            <Show when={!props.portalMount}>
                <OverlaySheetContext.Provider
                    value={{
                        topOpen,
                        bottomOpen,
                        setTopOpen,
                        setBottomOpen,
                        topHeight,
                        bottomHeight,
                        centerHeight,
                    }}
                >
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
    return (
        <div class="flex h-[32px] w-full flex-row items-center justify-center">
            <Button size="xs" onClick={handleClick} {...others} />
        </div>
    );
};

const OverlaySheetBottomClose: Component<ComponentProps<"button">> = (
    props
) => {
    const ctx = useOverlaySheet();
    const [local, others] = splitProps(props, ["onClick"]);
    const handleClick: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (
        e
    ) => {
        if (typeof local.onClick === "function") local.onClick(e);
        ctx.setBottomOpen(false);
    };
    return (
        <div class="flex h-[32px] w-full flex-row items-center justify-center">
            <Button size="xs" onClick={handleClick} {...others} />
        </div>
    );
};

const overlaySheetWrapperVariants = cva(
    "absolute inset-0 z-40 flex flex-col overflow-hidden",
    {
        variants: {
            openState: {
                open: "bg-background opacity-90 pointer-events-auto",
                "top-open":
                    "bg-gradient-to-t from-transparent to-background pointer-events-none",
                "bottom-open":
                    "bg-gradient-to-b from-transparent to-background pointer-events-none]",
                closed: "bg-opacity-0 pointer-events-none",
            },
        },
        defaultVariants: { openState: "closed" },
    }
);

const overlaySheetCenterFillerVariants = cva("", {
    variants: {
        openState: {
            open: "pointer-events-auto opacity-100",
            "top-open": "opacity-100",
            "bottom-open": "opacity-100",
            closed: "opacity-0",
        },
    },
    defaultVariants: { openState: "closed" },
});

const overlaySheetPanelVariants = cva(
    "pointer-events-auto flex w-full h-fit flex-col overflow-y-auto bg-background shadow-lg transition-[transform,opacity] duration-300 ease-out data-[state=closed]:opacity-0",
    {
        variants: {
            position: {
                bottom: "rounded-t-xl border-t data-[state=closed]:translate-y-full",
                top: "rounded-b-xl border-b data-[state=closed]:-translate-y-full",
            },
            size: {
                sm: "",
                md: "",
                lg: "",
                full: "",
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

    const isPanelHeightsDefined = createMemo(() => {
        return (
            ctx.topHeight() !== undefined &&
            ctx.centerHeight() !== undefined &&
            ctx.bottomHeight() !== undefined
        );
    });

    return (
        <div
            data-state={state()}
            aria-hidden={!(ctx.topOpen() || ctx.bottomOpen())}
            class={cn(overlaySheetWrapperVariants({ openState: state() }))}
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
                    !isPanelHeightsDefined() ? "h-2/5" : ""
                )}
                style={
                    isPanelHeightsDefined()
                        ? { height: ctx.topHeight() }
                        : undefined
                }
                {...others}
            >
                {local.topChildren}
            </div>
            <div
                data-state={state()}
                class={cn(
                    overlaySheetCenterFillerVariants({ openState: state() }),
                    "inline-flex h-full w-full items-center justify-center",
                    !isPanelHeightsDefined() ? "h-1/5 min-h-[64px]" : ""
                )}
                style={
                    isPanelHeightsDefined()
                        ? { height: ctx.centerHeight() }
                        : undefined
                }
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
                    !isPanelHeightsDefined() ? "h-2/5" : ""
                )}
                style={
                    isPanelHeightsDefined()
                        ? { height: ctx.bottomHeight() }
                        : undefined
                }
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
            class={cn(
                "h-fit flex-1 overflow-y-auto px-4 pb-4 pt-2",
                local.class
            )}
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
    OverlaySheetBottomClose,
    OverlaySheetContent,
    OverlaySheetDescription,
    OverlaySheetFooter,
    OverlaySheetHeader,
    OverlaySheetTitle,
    OverlaySheetTopClose,
};
