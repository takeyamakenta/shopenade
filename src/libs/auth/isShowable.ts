import { GrantedPrevilege } from "@/@types/GrantedPrevilege";
/**
 * 
 * @param groupCode グループコード
 * @param grantedPrevileges 付与された権限
 * @param previleges 表示可能な権限
 * @returns 表示可能かどうか
 */
export const isShowable = (groupCode: string, grantedPrevileges: GrantedPrevilege[]|null, previleges: string[]|null = null): boolean => {
    if (previleges === null) {
        if (grantedPrevileges === null) {
            return true;
        } else if (grantedPrevileges.filter((grantedPrevilege) => grantedPrevilege.group_code === groupCode).length === 0) {
            return false;
        } else {
            // 少なくとも1つでも権限があれば表示する
            return true;
        }
    }
    return grantedPrevileges?.filter((grantedPrevilege) => grantedPrevilege.group_code === groupCode).some((grantedPrevilege) => {
        return previleges.includes(grantedPrevilege.previlege);
    }) || false;
};