import { GrantedPrivilege } from "@/@types/GrantedPrevilege";
import { Accessor, Setter, createContext, useContext } from "solid-js";

export const PrevilegeContext = createContext<{
    previleges: Accessor<GrantedPrivilege[]|null>;
    setPrevileges: Setter<GrantedPrivilege[]|null>;
}>();

export const usePrevilege = () => useContext(PrevilegeContext);
