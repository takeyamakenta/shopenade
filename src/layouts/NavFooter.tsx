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
                        <MapPinned class="h-8 w-8" />
                    </Button>
                    <Button variant="nav" size="sm" onClick={() => navigate("/search_by_hiragana")}>
                        <ArrowDownAZ class="h-8 w-8" />
                    </Button>
                </div>
            </nav>
        </>
    );
}

export default NavFooter;
