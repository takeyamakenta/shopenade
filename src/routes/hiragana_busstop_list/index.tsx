import { For, Suspense } from "solid-js";

import {
    createAsync,
    query,
    useNavigate,
    useSearchParams,
} from "@solidjs/router";

import NavHeader from "@/layouts/NavHeader";
import NavFooter from "@/layouts/NavFooter";
import { getBusstopsByHiragana } from "@/libs/RPCs/busstop/getBusstopsByHiragana";

const initData = query(async (hiragana: string) => {
    "use server";
    return await getBusstopsByHiragana(hiragana);
}, "busstops");

export const route = {
    preload: (hiragana: string) => initData(hiragana),
};

export default function HiraganaBusstopList() {
    function RouteList() {
        const [searchParams] = useSearchParams();
        const initBusstops = createAsync(() =>
            initData(searchParams.hiragana as string)
        );
        const navigate = useNavigate();

        return (
            <>
                <h1>{searchParams.pole_title}</h1>
                <section class="flex flex-col gap-2">
                    <For each={initBusstops()}>
                        {(busstop) => (
                            <div class="flex items-center gap-2">
                                <div
                                    class="flex items-center gap-2"
                                    onClick={() =>
                                        navigate(`/busstop?id=${busstop.id}`)
                                    }
                                >
                                    {busstop.name_ja}
                                </div>
                            </div>
                        )}
                    </For>
                </section>
            </>
        );
    }

    return (
        <>
            <NavHeader />
            <Suspense fallback={<div>Loading...</div>}>
                <RouteList />
            </Suspense>
            <NavFooter />
        </>
    );
}
