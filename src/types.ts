type MenuTitle = {
    [key: string]: string
}
type MenuItem = {
    title: MenuTitle,
    url: string,
    iosIcon: any,
    mdIcon: any
};
type Menu = {
    [key: string]: MenuItem[]
};

export { Menu, MenuItem, MenuTitle }