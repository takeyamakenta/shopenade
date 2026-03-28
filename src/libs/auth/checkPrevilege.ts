import { GrantedPrevilege } from "@/@types/GrantedPrevilege";
import { Role } from "@/@types/Role";
import { appId } from "@/const/appId";

export const checkPrevilege = (
    grantedPrivileges: GrantedPrevilege[],
    loggedInRole: Role | null,
    group_code: string,
    previleges: string[] | null
): boolean => {
    if (previleges === null) {
        return true;
    }
    if (loggedInRole === null) {
        return false;
    }
    console.log("previleges", previleges);
    const checked = grantedPrivileges.some((grantedPrivilege) => {
        return (
            (
                grantedPrivilege.app_id === appId &&
                grantedPrivilege.group_code === group_code &&
                grantedPrivilege.group_is_public === false &&
                grantedPrivilege.group_owner_company_id === loggedInRole.owner_company_id
            ) || (
                grantedPrivilege.app_id === appId &&
                grantedPrivilege.group_code === group_code &&
                grantedPrivilege.group_is_public === true
            )
        ) && previleges.includes(grantedPrivilege.previlege);
    });
    return checked;
};
