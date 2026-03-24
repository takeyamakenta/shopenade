import { Role } from "./Role";
import { GrantedPrivilege } from "./GrantedPrevilege";

export type AuthSessionData = {
    uid: string;
    idToken: string;
    role: Role|null;
    granted_previleges: GrantedPrivilege[];
};

export const defaultAuthSessionData: AuthSessionData = {
    uid: "",
    idToken: "",
    role: null,
    granted_previleges: [],
};