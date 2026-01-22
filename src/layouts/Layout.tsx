import { createSignal, JSX } from "solid-js";


import { Toaster } from "@/components/ui/toast";
import { IsLoadingContext } from "@/context/isLoadingContext";

import styles from "./Layout.module.css";

type Props = {
    children: JSX.Element;
};

function Layout(props: Props) {
    const [isLoading, setIsLoading] = createSignal(false);

    return (
        <IsLoadingContext.Provider value={{ isLoading, setIsLoading }}>
            <main
                class={`${styles.main} flex min-h-screen w-full flex-col items-center justify-start px-1 pt-[3.2rem] pb-[4rem]`}
            >
                {props.children}
            </main>
            <Toaster class="mb-9 mt-9" />
        </IsLoadingContext.Provider>
    );
}

export default Layout;
