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
type BaseElement = {
    [key: string]: string
}

type OrdinaryClass = {
    study_year_id: number,
    study_address_id: string,
    school_year: number
}

type LearningBlock = {
    id: number,
    number: number,
    school_year: number,
    start: string,
    end: string
}

type CardElements = {
    id: string,
    group: any,
    title: string,
    subtitle: string,
    content: string,
    url: string
}

export { Menu, MenuItem, MenuTitle, BaseElement, OrdinaryClass, LearningBlock, CardElements }