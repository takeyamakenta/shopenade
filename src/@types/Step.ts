import { LucideIcon } from "lucide-solid";
import { JSX } from "solid-js";

import { ErrorClass } from "@/libs/form/validation";

export type StepFormComponentProps = {
    currentStep: number;
    setCurrentStep: (step: number) => void;
    stepAttributes: Record<string, unknown>;
    setStepAttributes: (stepAttributes: Record<string, unknown>) => void;
    setErrors: (errors: Record<string, ErrorClass>) => void;
};

export type Step = {
    title: string;
    description: string;
    icon: LucideIcon;
    stepFormComponent: (props: {
        currentStep: number;
        setCurrentStep: (step: number) => void;
        stepAttributes: Record<string, unknown>;
        setStepAttributes: (stepAattributes: Record<string, unknown>) => void;
        setErrors: (errors: Record<string, ErrorClass>) => void;
    }) => JSX.Element;
};
