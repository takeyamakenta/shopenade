import { GrantedPrevilege } from "./GrantedPrevilege";
import { Role } from "./Role";

export type AuthSessionData = {
    uid: string;
    idToken: string;
    role: Role | null;
    granted_previleges: GrantedPrevilege[];
};

export const defaultAuthSessionData: AuthSessionData = {
    uid: "",
    idToken: "",
    role: null,
    granted_previleges: [],
};
