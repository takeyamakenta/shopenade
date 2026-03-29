import { GrantedPrevilege } from "@/@types/GrantedPrevilege";
import { Role } from "@/@types/Role";
import { appId as defaultAppId } from "@/const/appId";

export const checkPrevilege = (
    grantedPrevileges: GrantedPrevilege[],
    loggedInRole: Role | null,
    group_code: string,
    previleges: string[] | null,
    appId: number | null = null
): boolean => {
    if (appId === null) {
        appId = defaultAppId;
    }
    if (previleges === null) {
        console.log("previleges is null");
        return true;
    }
    if (loggedInRole === null) {
        console.log("loggedInRole is null");
        return false;
    }
    console.log("previleges", previleges);
    console.log("grantedPrevileges", grantedPrevileges);
    const checked = grantedPrevileges.some((grantedPrivilege) => {
        console.log("1", grantedPrivilege.app_id === appId);
        console.log("2", grantedPrivilege.group_code === group_code);
        console.log("3", grantedPrivilege.group_is_public === false);
        console.log(
            "4",
            grantedPrivilege.group_owner_company_id ===
                loggedInRole.owner_company_id
        );
        console.log("5", previleges.includes(grantedPrivilege.previlege));
        return (
            ((grantedPrivilege.app_id === appId &&
                grantedPrivilege.group_code === group_code &&
                grantedPrivilege.group_is_public === false &&
                grantedPrivilege.group_owner_company_id ===
                    loggedInRole.owner_company_id) ||
                (grantedPrivilege.app_id === appId &&
                    grantedPrivilege.group_code === group_code &&
                    grantedPrivilege.group_is_public === true)) &&
            previleges.includes(grantedPrivilege.previlege)
        );
    });
    return checked;
};
