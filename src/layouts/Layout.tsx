import { JSX, createSignal } from "solid-js";

import { GrantedPrevilege } from "@/@types/GrantedPrevilege";
import { Toaster } from "@/components/ui/toast";
import { IsLoadingContext } from "@/context/isLoadingContext";
import { PrevilegeContext } from "@/context/previlegeContext";
import { AppIdContext } from "@/context/appIdContext";

import styles from "./Layout.module.css";

type Props = {
    children: JSX.Element;
};

function Layout(props: Props) {
    const [isLoading, setIsLoading] = createSignal(false);
    const [previleges, setPrevileges] = createSignal<GrantedPrevilege[] | null>(
        null
    );
    const [appId, setAppId] = createSignal<number | null>(null);
    return (
        <AppIdContext.Provider value={{ appId, setAppId }}>
            <IsLoadingContext.Provider value={{ isLoading, setIsLoading }}>
                <PrevilegeContext.Provider value={{ previleges, setPrevileges }}>
                    <main
                        class={`${styles.main} flex h-[calc(100vh-1.2rem)] w-full flex-col items-center justify-start px-1 pb-[4rem] pt-[3.2rem]`}
                    >
                        {props.children}
                    </main>
                    <Toaster class="mb-9 mt-9" />
                </PrevilegeContext.Provider>
            </IsLoadingContext.Provider>
        </AppIdContext.Provider>
    );
}

export default Layout;
