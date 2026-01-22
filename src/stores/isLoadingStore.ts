import { createStore } from "solid-js/store";

const [isLoadingStore, setIsLoadingStore] = createStore<{
    isLoading: boolean;
}>({
    isLoading: false,
});

export const useIsLoadingStore = () => {
    return { isLoadingStore, setIsLoadingStore };
};
