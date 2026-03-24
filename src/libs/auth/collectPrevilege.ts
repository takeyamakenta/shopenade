import { GrantedPrivilege } from "@/@types/GrantedPrevilege";
import { appId } from "@/const/appId";
import { Role } from "@/@types/Role";

export const collectPrevilege = (grantedPrivileges: GrantedPrivilege[], loggedInRole: Role | null, group_code: string, previleges: string[]|null): GrantedPrivilege[]|null => {
    if (previleges === null) {
        return null;
    }
    if (loggedInRole === null) {
        return [];
    }
    const collectedPrevileges = grantedPrivileges.filter((grantedPrivilege) => {
        return (
                (
                    grantedPrivilege.app_id === appId &&
                    grantedPrivilege.group_code === group_code &&
                    grantedPrivilege.group_is_public === false &&
                    grantedPrivilege.group_owner_company_id === loggedInRole.owner_company_id
                )
                || 
                (
                    grantedPrivilege.app_id === appId
                    && grantedPrivilege.group_code === group_code
                    && grantedPrivilege.group_is_public === true
                )
            && previleges.includes(grantedPrivilege.previlege)
        );
    });
    return collectedPrevileges;
};