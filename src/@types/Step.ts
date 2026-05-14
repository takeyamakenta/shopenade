import { LucideIcon } from "lucide-solid";
import { JSX } from "solid-js";

import { ErrorClass } from "@/libs/form/validation";

export type StepFormComponentProps = {
    currentStep: number;
    setCurrentStep: (step: number) => void;
    setErrors: (errors: Record<string, ErrorClass>) => void;
    setFields: (fields: Record<string, unknown>) => void;
};

export type Step = {
    title: string;
    description: string;
    icon: LucideIcon;
    stepFormComponent: (props: {
        currentStep: number;
        setCurrentStep: (step: number) => void;
        setErrors: (errors: Record<string, ErrorClass>) => void;
        setFields: (fields: Record<string, unknown>) => void;
    }) => JSX.Element;
};
