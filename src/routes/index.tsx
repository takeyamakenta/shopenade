import { Suspense } from "solid-js";

import { query } from "@solidjs/router";

import NavHeader from "@/layouts/NavHeader";
import NavFooter from "@/layouts/NavFooter";

const initData = query(async () => {
    "use server";
}, "tasks");

export const route = {
    preload: () => initData(),
};

export default function Home() {
    return (
        <>
            <NavHeader />
            <section class="flex h-full w-full flex-col items-start justify-start gap-4">
                <Suspense fallback={<div>Loading...</div>}>
                    <div>test</div>
                </Suspense>
            </section>
            <NavFooter />
        </>
    );
}
