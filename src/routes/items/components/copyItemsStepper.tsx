import {
    Component,
    ComponentProps,
    For,
    createEffect,
    createMemo,
    createSignal,
    splitProps,
} from "solid-js";

import { Step } from "@/@types/Step";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Carousel,
    CarouselApi,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import { hasError } from "@/libs/error/reportError";
import { ErrorClass } from "@/libs/form/validation";

type CopyItemsStepperProps = {
    currentStep: number;
    setCurrentStep: (step: number) => void;
    steps: Step[];
    errorMessage?: string;
    errors: Record<string, ErrorClass>;
};

const CopyItemsStepper: Component<
    ComponentProps<"div"> & CopyItemsStepperProps
> = (props: ComponentProps<"div"> & CopyItemsStepperProps) => {
    const [local, others] = splitProps(props, [
        "currentStep",
        "setCurrentStep",
        "steps",
        "errorMessage",
        "errors",
    ]);
    const currentStep = createMemo(() => local.currentStep);
    const steps = createMemo(() => local.steps);

    const onSelectStep = (api: NonNullable<ReturnType<CarouselApi>>) => {
        const originalStep = currentStep();
        if (hasError(local.errors)) {
            // knock back the carousel
            api.scrollTo(originalStep);
            return;
        }
        local.setCurrentStep(api.selectedScrollSnap());
    };

    const [carouselApi, setCarouselApi] =
        createSignal<ReturnType<CarouselApi>>();

    createEffect(() => {
        if (!carouselApi()) {
            return;
        }
        carouselApi()?.scrollTo(currentStep());
    });

    createEffect(() => {
        if (!carouselApi()) {
            return;
        }
        carouselApi()?.on("select", onSelectStep);
    });

    return (
        <>
            <div class="flex flex-col gap-2" {...others}>
                <Carousel setApi={setCarouselApi} orientation="horizontal">
                    <CarouselContent>
                        <For each={steps()}>
                            {(step) => (
                                <CarouselItem>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle class="justify-left flex flex-row items-center gap-2">
                                                <step.icon class="size-4" />{" "}
                                                {step.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription>
                                                {step.description}
                                            </CardDescription>
                                        </CardContent>
                                    </Card>
                                </CarouselItem>
                            )}
                        </For>
                    </CarouselContent>
                </Carousel>
                <div class="flex justify-center gap-2">
                    <For each={steps()}>
                        {(_, index) => (
                            <span
                                class={`h-2 w-2 rounded-full transition-colors ${
                                    index() === currentStep()
                                        ? "bg-gray-800"
                                        : "bg-gray-300"
                                }`}
                            />
                        )}
                    </For>
                </div>
            </div>
        </>
    );
};

export default CopyItemsStepper;
