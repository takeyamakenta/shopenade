import { createStore } from "solid-js/store";


const [copyItemStepAttributeStore, setCopyItemStepAttributeStore] = createStore<Record<string, unknown>>({});

export const useCopyItemStepAttributeStore = () => {
    return { copyItemStepAttributeStore, setCopyItemStepAttributeStore };
};
