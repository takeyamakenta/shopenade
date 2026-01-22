import { For, Suspense } from "solid-js";

import NavHeader from "@/layouts/NavHeader";
import NavFooter from "@/layouts/NavFooter";
import { HIRAGANA } from "@/libs/const/hiragana";
import { useNavigate } from "@solidjs/router";

export default function HiraganaList() {
    const navigate = useNavigate();
    return (
        <>
            <NavHeader />
            <Suspense fallback={<div>Loading...</div>}>
                <h1>名前からバス停を探す</h1>
                <section class="flex flex-col gap-2">
                    <For each={HIRAGANA}>
                        {(hiragana) => (
                            <div class="flex items-center gap-2" onClick={() => navigate(`/hiragana_busstop_list?hiragana=${hiragana}`)}>
                                <div class="flex items-center gap-2">
                                    {hiragana}
                                </div>
                            </div>
                        )}
                    </For>
                </section>
            </Suspense>
            <NavFooter />
        </>
    );
}
