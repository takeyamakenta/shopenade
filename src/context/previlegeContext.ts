import { Accessor, Setter, createContext, useContext } from "solid-js";

import { GrantedPrevilege } from "@/@types/GrantedPrevilege";

export const PrevilegeContext = createContext<{
    previleges: Accessor<GrantedPrevilege[] | null>;
    setPrevileges: Setter<GrantedPrevilege[] | null>;
}>();

export const usePrevilege = () => useContext(PrevilegeContext);
