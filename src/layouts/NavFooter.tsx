import { MapPinned, ArrowDownAZ } from "lucide-solid";

import { Button } from "@/components/ui/button";

import styles from "./Layout.module.css";
import { useNavigate } from "@solidjs/router";



function NavFooter() {
    const navigate = useNavigate();
    return (
        <>
            <nav class={`${styles.footer} bg-gray-800 text-yellow-100`}>
                <div class="flex flex-row items-center justify-center gap-4 px-2">
                    <Button variant="nav" size="sm" onClick={() => navigate("/search_by_map")}>
                        <MapPinned class="h-6 w-6 sm:h-5 sm:w-5" />
                        <span class="hidden sm:inline ml-2">地図から探す</span>
                    </Button>
                    <Button variant="nav" size="sm" onClick={() => navigate("/search_by_hiragana")}>
                        <ArrowDownAZ class="h-6 w-6 sm:h-5 sm:w-5" />
                        <span class="hidden sm:inline ml-2">名前から探す</span>
                    </Button>
                </div>
            </nav>
        </>
    );
}

export default NavFooter;
