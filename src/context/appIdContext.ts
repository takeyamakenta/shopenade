import { Accessor, Setter, createContext, useContext } from "solid-js";

export const AppIdContext = createContext<{
    appId: Accessor<number | null>;
    setAppId: Setter<number | null>;
}>();

export const useAppId = () => useContext(AppIdContext);
