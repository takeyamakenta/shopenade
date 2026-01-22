import { For, Suspense } from "solid-js";

import { createAsync, query, useSearchParams } from "@solidjs/router";

import { BusroutePattern } from "@/@types/BusroutePattern";
import NavHeader from "@/layouts/NavHeader";
import NavFooter from "@/layouts/NavFooter";
import { getBusstopData } from "@/libs/RPCs/busstop/getBusstopData";
import { useNavigate } from "@solidjs/router";

const initData = query(async (id: string) => {
    "use server";
    const data = await getBusstopData(id);
    const stopData = {
        ...data,
        poles: data.poles?.map((pole) => {
            return {
                ...pole,
                route_patterns: pole.route_patterns?.reduce(
                    (acc, route_pattern) => {
                        acc[route_pattern.name_ja] = {
                            ...route_pattern,
                            ids: [
                                ...(acc[route_pattern.name_ja]?.ids ?? []),
                                route_pattern.id,
                            ],
                        };
                        return acc;
                    },
                    {} as Record<string, BusroutePattern & { ids: string[] }>
                ),
            };
        }),
    };
    return stopData;
}, "busstop");

export const route = {
    preload: (id: string) => initData(id),
};

function RouteList() {
    const [searchParams] = useSearchParams();
    const busstop = createAsync(() => initData(searchParams.id as string));
    const navigate = useNavigate();
    return (
        <>
            <h1>{busstop()?.name_ja}</h1>
            <section class="flex flex-col gap-2">
                <For each={busstop()?.poles ?? []}>
                    {(pole) => (
                        <div class="flex flex-col gap-2">
                            のりば {pole.busstop_pole_number}
                            <hr class="border-gray-300" />
                            <For
                                each={Object.values(pole.route_patterns ?? {})}
                            >
                                {(route_pattern) => (
                                    <div onClick={() => {
                                        navigate(`/timetable?pole_id=${pole.id}&route_pattern_ids=0&${route_pattern.ids.map(id => `route_pattern_ids=${id}`).join("&")}`);
                                    }}>
                                        {route_pattern.name_ja}
                                    </div>
                                )}
                            </For>
                        </div>
                    )}
                </For>
            </section>
        </>
    );
}

export default function Busstop() {
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
