import { Component, ComponentProps, createEffect, createMemo, createSignal, For, splitProps } from "solid-js";
import { ErrorClass } from "@/libs/form/validation";

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
    CarouselContent,
    CarouselItem,
    CarouselApi,
} from "@/components/ui/carousel";
import { hasError } from "@/libs/error/reportError";

type CopyItemsStepperProps = {
    currentStep: number;
    setCurrentStep: (step: number) => void;
    steps: Step[];
    errorMessage?: string;
    errors: Record<string, ErrorClass>;
};

const CopyItemsStepper: Component<ComponentProps<"div"> & CopyItemsStepperProps> = (props: {
    currentStep: number;
    setCurrentStep: (step: number) => void;
    steps: Step[];
    errorMessage?: string;
    errors: Record<string, ErrorClass>;
}) => {
    const [local, others] = splitProps(props, ["currentStep", "setCurrentStep", "steps", "errorMessage", "errors"]);
    const currentStep = createMemo(() => local.currentStep);
    const steps = createMemo(() => local.steps);
    const errorMessage = createMemo(() => local.errorMessage);

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
        carouselApi()?.on("select", onSelectStep);
    });

    return (
        <>
            <div class="flex flex-col gap-4" {...others}>
                <Carousel setApi={setCarouselApi}>
                    <CarouselContent>
                        <For each={steps()}>
                            {(step) => (
                                <CarouselItem>
                                    <div>
                                        <h1>{step.title}</h1>
                                    </div>
                                </CarouselItem>
                            )}
                        </For>
                    </CarouselContent>
                </Carousel>
            </div>
        </>
    );
};

export default CopyItemsStepper;