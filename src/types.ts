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
type ResponseItem<T> = {
    origin: string,
    single: boolean,
    query: {
        [key: string]: string
    },
    data: T | T[]
}

type OrdinaryClass = {
    annual_credits_ref: ResponseItem<{
        study_year: number,
        study_address: string,
        definition_year: number
    }>,
    english_displayed_name: string,
    italian_displayed_name: string,
    school_year: number,
    study_address_ref: ResponseItem<{
        id: string
    }>,
    study_year_ref: ResponseItem<{
        id: number
    }>
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