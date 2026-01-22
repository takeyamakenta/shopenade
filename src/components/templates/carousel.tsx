import { Index } from "solid-js";

import { TemplateCarouselSettings } from "@/@types/templateSettings";
import { Card, CardContent } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

export default function CarouselTemplate(props: {
    settings: TemplateCarouselSettings;
}) {
    return (
        <div class="flex w-full flex-row items-center justify-center bg-slate-100">
            <Carousel class="w-full max-w-xs">
                <CarouselContent>
                    <Index each={Array.from({ length: 5 })}>
                        {(_, index) => (
                            <CarouselItem>
                                <div class="p-1">
                                    <Card>
                                        <CardContent class="flex aspect-square items-center justify-center p-6">
                                            <span class="text-4xl font-semibold">
                                                {index + 1}
                                            </span>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        )}
                    </Index>
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        </div>
    );
}
