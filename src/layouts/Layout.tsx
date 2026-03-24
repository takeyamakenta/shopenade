import { JSX, createSignal } from "solid-js";

import { Toaster } from "@/components/ui/toast";
import { IsLoadingContext } from "@/context/isLoadingContext";
import { PrevilegeContext } from "@/context/previlegeContext";

import styles from "./Layout.module.css";
import { GrantedPrivilege } from "@/@types/GrantedPrevilege";

type Props = {
    children: JSX.Element;
};


function Layout(props: Props) {
    const [isLoading, setIsLoading] = createSignal(false);
    const [previleges, setPrevileges] = createSignal<GrantedPrivilege[]|null>(null);
    return (
        <IsLoadingContext.Provider value={{ isLoading, setIsLoading }}>
            <PrevilegeContext.Provider value={{ previleges, setPrevileges }}>
                <main
                    class={`${styles.main} flex min-h-screen w-full flex-col items-center justify-start px-1 pb-[4rem] pt-[3.2rem]`}
                >
                    {props.children}
                </main>
                <Toaster class="mb-9 mt-9" />
            </PrevilegeContext.Provider>
        </IsLoadingContext.Provider>
    );
}

export default Layout;
