import { Index } from "solid-js";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import NavFooter from "@/layouts/NavFooter";
import NavHeader from "@/layouts/NavHeader";

const customers = [
    { name: "Customer A" },
    { name: "Customer B" },
    { name: "Customer C" },
    { name: "Customer D" },
    { name: "Customer E" },
];

export default function Home() {
    return (
        <>
            <NavHeader />
            <section class="flex min-h-screen flex-col items-center justify-center">
                <h1 class="mb-12 text-4xl font-bold">ようこそ</h1>

                <div class="mb-16 grid w-full max-w-5xl grid-cols-1 gap-8 px-4 md:grid-cols-2">
                    <div class="flex items-center justify-center">
                        <div class="flex h-64 w-full items-center justify-center rounded-xl bg-gray-200 shadow-lg">
                            <span class="text-gray-400">Feature Image</span>
                        </div>
                    </div>
                    <div class="flex flex-col justify-center">
                        <h3 class="mb-4 text-2xl font-bold">機能タイトル</h3>
                        <p class="mb-4 text-gray-600">
                            ここに機能の説明文が入ります。この機能を使うことで、ユーザーは効率的に作業を進めることができます。
                        </p>
                        <p class="text-gray-600">
                            詳細な説明や利点についてもここに記載できます。
                        </p>
                    </div>
                </div>

                <div class="mb-12 w-full max-w-4xl px-4">
                    <h2 class="mb-8 text-center text-2xl font-bold">
                        導入企業
                    </h2>
                    <div class="flex justify-center">
                        <Carousel
                            class="w-full max-w-4xl"
                            opts={{ loop: true, align: "start" }}
                        >
                            <CarouselContent class="-ml-4">
                                <Index each={customers}>
                                    {(customer) => (
                                        <CarouselItem class="basis-1/3 pl-4">
                                            <div class="flex flex-col items-center p-4">
                                                <div class="mb-4 flex h-32 w-32 items-center justify-center rounded-lg bg-gray-200">
                                                    <span class="text-gray-400">
                                                        Logo
                                                    </span>
                                                </div>
                                                <span class="text-center font-medium text-gray-700">
                                                    {customer().name}
                                                </span>
                                            </div>
                                        </CarouselItem>
                                    )}
                                </Index>
                            </CarouselContent>
                            <CarouselPrevious class="-left-12" />
                            <CarouselNext class="-right-12" />
                        </Carousel>
                    </div>
                </div>

                <button class="rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white hover:bg-blue-700">
                    今すぐ登録する
                </button>
            </section>

            <NavFooter />
        </>
    );
}
