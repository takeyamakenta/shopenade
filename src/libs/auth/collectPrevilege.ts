import { GrantedPrevilege } from "@/@types/GrantedPrevilege";
import { Role } from "@/@types/Role";
import { appId } from "@/const/appId";

export const collectPrevilege = (
    grantedPrevileges: GrantedPrevilege[],
    loggedInRole: Role | null,
    previleges_for_group_code: { [key: string]: string[] } | null
): GrantedPrevilege[] | null => {
    if (previleges_for_group_code === null) {
        return null;
    }
    if (loggedInRole === null) {
        return [];
    }
    const collected = grantedPrevileges.filter((grantedPrivilege) => {
        const groupCodes = Object.keys(previleges_for_group_code ?? {});
        return groupCodes.some((groupCode) => {
            const previleges = previleges_for_group_code?.[groupCode];
            return (
                ((grantedPrivilege.app_id === appId &&
                    grantedPrivilege.group_code === groupCode &&
                    grantedPrivilege.group_is_public === false &&
                    grantedPrivilege.group_owner_company_id ===
                        loggedInRole.owner_company_id) ||
                    (grantedPrivilege.app_id === appId &&
                        grantedPrivilege.group_code === groupCode &&
                        grantedPrivilege.group_is_public === true)) &&
                previleges.includes(grantedPrivilege.previlege)
            );
        });
    });
    return collected;
};
