type Language = "italian" | "english";

type MenuTitle = {
    [key: string]: string
};

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
    path: string,
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

enum LearningBlockStatus {
    FUTURE,
    UPCOMING,
    CURRENT,
    COMPLETED,
}

type LearningArea = {
    id: string,
    credits: number
} & {
    [key in keyof string as `${Language}_title`]: string
} & {
    [key in keyof string as `${Language}_description`]: string | null
}

type CourseBase = {
    id: number,
    credits: number,
    learning_area_ref: ResponseItem<{
        id: string
    }>
} & {
    [key in keyof string as `${Language}_title`]: string
} & {
    [key in keyof string as `${Language}_displayed_name`]: string | null
}

type CourseSummary = CourseBase & {
    pending: boolean
}

type Course = CourseBase & {
    creation_date: string,
    up_hours: number,
    learning_area_ita: string,
    learning_area_eng: string,
    growth_area_ita: string,
    growth_area_eng: string,
    min_students: number,
    max_students: number,
    proposer_teacher_ref: ResponseItem<{
        id: number
    }>,
    teacher_name: string,
    teacher_surname: string,
    certifying_admin_ref: ResponseItem<{
        id: number
    }>,
    admin_name: string,
    admin_surname: string,
    admin_confirmation: string
} & {
    [key in keyof string as `${Language}_expected_learning_results`]: string
} & {
    [key in keyof string as `${Language}_criterions`]: string
} & {
    [key in keyof string as `${Language}_activities`]: string
}

export { Language, Menu, MenuItem, MenuTitle, BaseElement, OrdinaryClass, LearningBlock, CardElements, LearningBlockStatus, LearningArea, CourseSummary, Course }