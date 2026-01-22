import { Accessor, Setter, createContext, useContext } from "solid-js";

export const IsLoadingContext = createContext<{
    isLoading: Accessor<boolean>;
    setIsLoading: Setter<boolean>;
}>();

export const useIsLoading = () => useContext(IsLoadingContext);
