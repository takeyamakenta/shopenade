export type RoutePrevilege = {
    path: string;
    pattern: RegExp;
    group_code: string; 
    previleges: string[]|null; // nullはフルアクセス
    show_menu_previleges: string[]|null; // nullはメニュー表示しない
    menu_description: string;
    menu_icon: string;
};