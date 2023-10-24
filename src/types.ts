import { Method } from "axios";
import { store } from "./store";
import { AlertButton, AlertInput } from "@ionic/vue"
import { executeLink, getActualLearningContext, getCompleteSchoolYear, getCurrentElement, getCurrentLanguage, getCurrentSchoolYear, getCustomMessage, getGender, getIcon, getRagneString, getStatusColor, getStatusString, getStudyAddressVisualization, hashCode, numberToSection, toDateString } from "./utils";

type Language = "italian" | "english";

type MenuItem = {
    url_names: {
        [key in keyof string as UserType]: string[]
    },
    icon_ref: string
};

type Menu = {
    items: {
        [key: string]: MenuItem
    },
    order: {
        [key in keyof string as UserType]: string[]
    },
    default_item: {
        [key in keyof string as UserType]: string
    },
    index: number
};

type BaseElement = {
    [key: string]: string // TODO (9): mettere [key in keyof string as Language]
}

type ElementsList = {
    [key in keyof string as Language]: {
        [key: string]: string
    }
}

type ResponseItem<T> = {
    path: string,
    single: boolean,
    query: {
        [key: string]: string
    },
    data: T | T[]
}

type AnnualCredits = {
    study_year: number,
    study_address: string,
    definition_year: number
}

type OrdinaryClassProps = {
    annual_credits_ref: ResponseItem<AnnualCredits>,
    english_displayed_name: string, // TODO (8): sistemare visualizzazione nome classe
    italian_displayed_name: string,
    school_year: number,
    study_address_ref: ResponseItem<{
        id: string
    }>,
    study_year_ref: ResponseItem<{
        id: number
    }>
}

type OrdinaryClassSummaryProps = {
    study_year: number,
    address: string,
    section: string,
    school_year?: number
}

class OrdinaryClassSummary implements OrdinaryClassSummaryProps {
    study_year: number;
    address: string;
    section: string;
    school_year: number;

    constructor(classObj: OrdinaryClassSummaryProps) {
        this.study_year = classObj.study_year;
        this.address = classObj.address;
        this.section = classObj.section;
        this.school_year = classObj.school_year ?? getCurrentSchoolYear();
    }

    toString(section = true, school_year = false) {
        return this.study_year + " " + this.address + (store.state.sections_use && section ? " " + this.section : "") + (school_year ? " " + this.school_year : "");
    }

    toCard(section = true, school_year = false, selected = false): GeneralCardElements {
        const id = this.toString(section, school_year);
        return {
            id: id,
            group: this.school_year,
            title: getCustomMessage("title", this.toString(section, school_year), "title"),
            selected: selected,
            link: {
                event: 'change_selection',
                data: {
                    id: id,
                },
            }
        };
    }
}

/*class OrdinaryClass {
    annual_credits?: AnnualCredits
    english_displayed_name?: string // TODO (8): sistemare visualizzazione nome classe
    italian_displayed_name?: string
    school_year: number
    address: string
    study_year: number
    section?: string

    constructor(classObj : OrdinaryClassProps) {
        this.annual_credits = classObj.annual_credits_ref.data as AnnualCredits;
        this.english_displayed_name = classObj.english_displayed_name;
        this.italian_displayed_name = classObj.italian_displayed_name;
        this.school_year = classObj.school_year;
        this.address = (classObj.study_address_ref.data as {id: string}).id;
        this.study_year = (classObj.study_year_ref.data as {id: number}).id;
    }

    toCard(path? : string) : GeneralCardElements {
        const language = getCurrentLanguage();
        return {
            id: this.study_year + "_" + this.address,
            group: "",
            content: [{
                id: "title",
                type: "html",
                content: this.study_year + " " + this.address
            }],
            link: path != undefined ? {
                url: path,
                method: "get"
            } : undefined
        }
    }
}*/

class Enrollment {
    private _enrollment: string
    private _editable: boolean
    constructor(pending: string, learning_session: LearningSession, reference = new Date(), open_enrollment = false) {
        this._enrollment = pending;
        this._editable = learning_session.getStatus(reference) == LearningSessionStatus.FUTURE && open_enrollment;
    }
    get enrollment(): Date | boolean {
        if (this._enrollment === "true") {
            return true;
        } else if (this._enrollment === "false") {
            return false;
        } else {
            return new Date(this._enrollment);
        }
    }
    set enrollment(enrollment: Date | boolean) {
        if (enrollment instanceof Date) {
            this._enrollment = enrollment.toISOString();
        } else {
            this._enrollment = enrollment ? "true" : "false";
        }
    }
    get editable(): boolean {
        return this._editable;
    }
    set editable(editable: boolean) {
        this._editable = editable;
    }
    isPending(): boolean {
        return this._enrollment !== "true" && this._enrollment !== "false";
    }
    getChangingMethod(): Method {
        return this.enrollment ? "delete" : "post";
    }
    getEnrollmentIcon(path: string, method?: Method): RequestIcon {
        return {
            url: path,
            method: this.editable ?
                (method ?? this.getChangingMethod())
                : (method ?? "get"),
            icon: this.enrollment === false ? getIcon("add") : getIcon("close")
        }
    }
    getStatusColors(): Colors<GeneralSubElements> {
        return {
            text: {
                name: this.isPending()
                    ? "medium"
                    : this.enrollment === true
                        ? "success"
                        : "danger",
                type: "var"
            },
            background: !this.isPending() ? {
                name: this.enrollment === true
                    ? "light_success"
                    : "light_danger",
                type: "var"
            } : undefined
        }
    }
    getChangeButtonColors(): Colors<GeneralSubElements> {
        return {
            text: this.enrollment === false ? {
                name: "white",
                type: "var"
            } : undefined,
            background: this.enrollment === false ? {
                name: "light",
                type: "var"
            } : undefined,
            borders: this.enrollment !== false ? {
                name: "light",
                type: "var"
            } : undefined,
        }
    }
    toString(): string {
        return this.isPending() ? getCurrentElement(store.state.static_subscription ? "fully_booked" : "pending")
            : (this.enrollment === true ? getCurrentElement("enrolled")
                : getCurrentElement("not_enrolled"))
    }
}

type CardElements = {
    id: string,
    group: any,
    colors?: Colors<GeneralSubElements>,
    classes?: Classes<CardSubElements>
}

type GeneralCardElements = CardElements & {
    title?: CustomElement,
    subtitle?: CustomElement,
    content?: CustomElement[],
    side_element?: CustomElement,
    selected?: boolean,
    link?: LinkParameters,
}

type CourseCardElements = CardElements & {
    credits: number,
    content: CustomElement[],
    enrollment: Enrollment
}

enum LearningSessionStatus {
    FUTURE,
    UPCOMING,
    CURRENT,
    COMPLETED,
}

type LearningArea = {
    id: string,
    credits?: number
} & {
        [key in keyof string as `${Language}_title`]: string
    } & {
        [key in keyof string as `${Language}_description`]: string | null
    }

type MinimumCourseProps = {
    id: number,
    section: string
} & {
        [key in keyof string as `${Language}_title`]: string
    }

class MinimizedCourse implements MinimumCourseProps {
    id: number;
    section: string;
    italian_title: string;
    english_title: string;

    constructor(course: MinimumCourseProps) {
        this.id = course.id;
        this.section = course.section;
        this.italian_title = course.italian_title;
        this.english_title = course.english_title;
    }

    toCard(path?: string): GeneralCardElements {
        const language = getCurrentLanguage();
        const card: GeneralCardElements = {
            id: "" + this.id + "_" + this.section,
            group: "",
            content: [{
                id: "title",
                type: "html",
                content: this[`${language}_title`]
            }],
            link: path != undefined ? {
                url: path,
                method: "get"
            } : undefined
        };
        if (store.state.sections_use) {
            card.content?.push({
                id: "section",
                type: "string",
                content: getCurrentElement("section") + ": " + this.section
            });
        }
        
        return card;
    }
}

type CourseBaseProps = {
    id: number,
    credits: number,
    learning_area_ref: ResponseItem<{
        id: string
    }>
} & {
        [key in keyof string as `${Language}_title`]: string
    }

type CourseSummaryProps = CourseBaseProps & {
    section?: string,
    pending: string,
    group: number
}

type CurriculumCourseProps = CourseBaseProps & {
    section: string,
    final_grade: GradeProps | null,
    learning_context_ref: ResponseItem<{
        id: string
    }>,
    future_course: number
}

type CourseProps = CourseBaseProps & {
    creation_school_year: number,
    up_hours: number,
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
    } & {
        [key in keyof string as `${Language}_learning_area`]: string
    } & {
        [key in keyof string as `${Language}_description`]: string
    }

class CourseBase {
    id: number;
    credits: number;
    learning_area_ref: ResponseItem<{
        id: string
    }>;
    italian_title: string;
    english_title: string;

    constructor(courseObj: CourseBaseProps) {
        this.id = courseObj.id;
        this.credits = courseObj.credits;
        this.learning_area_ref = courseObj.learning_area_ref; // TODO (6): in /courses/:id vengno dati solo i titoli e non l'id
        this.italian_title = courseObj.italian_title; // TODO (8): sistemare lingue mettendo get
        this.english_title = courseObj.english_title;
    }
}

class CourseSummary extends CourseBase {

    section?: string | undefined;
    pending: string;
    group: number;

    constructor(courseObj: CourseSummaryProps) {
        super(courseObj);
        this.section = courseObj.section;
        this.pending = courseObj.pending;
        this.group = courseObj.group;
    }

    toCard(learning_session: LearningSession, path?: string, method?: Method, open_enrollment = false, reference = new Date()): CourseCardElements {
        const language = getCurrentLanguage();
        const tmp_enrollment = new Enrollment(this.pending, learning_session, reference, open_enrollment);
        const card: CourseCardElements = {
            id: "" + this.id,
            group: this.group,
            credits: this.credits,
            enrollment: tmp_enrollment,
            content: [{
                id: this.id + "_credits",
                type: "string",
                content: getCurrentElement("credits") + ": " + this.credits,
                colors: {
                    text: {
                        name: "white",
                        type: "var"
                    },
                    background: {
                        name: "primary",
                        type: "var"
                    }
                }
            }, {
                id: this.id + "_title",
                type: "string",
                linkType: "event",
                content: {
                    event: "course_details",
                    data: {
                        title: this[`${language}_title`],
                        course_id: this.id,
                        section: this.section,
                    },
                    text: this[`${language}_title`] + (store.state.sections_use && this.section != null ? " - " + getCurrentElement("section") + ": " + this.section : "")
                },
            }, {
                id: this.id + "_enrollment",
                type: "string",
                content: tmp_enrollment.toString(),
                colors: tmp_enrollment.getStatusColors()
            }]
        }
        if ((!store.state.static_subscription || tmp_enrollment.enrollment === false) && path != undefined) {
            card.content.push({
                id: this.id + "_change_enrollment",
                type: "icon",
                linkType: "request",
                content: tmp_enrollment.getEnrollmentIcon(path, method),
                colors: tmp_enrollment.getChangeButtonColors(),
                params: {
                    border_radius: "10px" // (10): capire cos'è params
                }
            });
        }
        return card;
    }
}

class CurriculumCourse extends CourseBase {

    section: string;
    final_grade: GradeProps | null;
    learning_context_id: string;
    future_course: boolean;

    constructor(courseObj: CurriculumCourseProps) {
        super(courseObj);
        this.section = courseObj.section;
        this.final_grade = courseObj.final_grade;
        this.learning_context_id = (courseObj.learning_context_ref.data as { id: string }).id;
        this.future_course = courseObj.future_course == 1;
    }

    /*concatGrades(grades : Grade[]) {
        
        let finalPos : number;

        if (grades.length > 0) {
            finalPos = grades.findIndex((grade) => grade.final);
            if (finalPos >= 0) {
                this.final_grade = grades.splice(finalPos,1);
            }
        }
        this.intermediate_grades = this.intermediate_grades.concat(grades);
    }*/

    toCard(path?: string, method?: Method): GeneralCardElements { // ! (3): per visualizzazione tabella a telefono
        const language = getCurrentLanguage();
        return {
            id: "" + this.id,
            group: "",
            content: [{
                id: this.id + "_title",
                type: "html",
                content: this[`${language}_title`]
            }],
            link: path != undefined ? {
                url: path,
                method: method ?? "get"
            } : undefined
        }
    }

    toTableRow(session_id: number, student_id: number, teacher_id?: number): CustomElement[] {
        const language = getCurrentLanguage();
        const row: CustomElement[] = [
            {
                id: this.id + "_title",
                type: "string",
                linkType: "event",
                content: {
                    event: "course_details",
                    data: {
                        title: this[`${language}_title`],
                        course_id: this.id,
                        learning_session_id: session_id,
                        section: this.section,
                    },
                    text: this[`${language}_title`]
                }
            }, {
                id: this.id + "_credits",
                type: "string",
                content: "" + this.credits
            }, {
                id: this.id + "_learning_area",
                type: "string",
                content: (this.learning_area_ref.data as { id: string }).id
            }, {
                id: this.id + "_gardes", // TODO (4): mettere il controllo con future_course al passaggio a curriculum_v2
                type: "icon",
                linkType: "event",
                content: {
                    event: "grades",
                    data: {
                        title: this[`${language}_title`],
                        parameters: {
                            course_id: this.id,
                            session_id: session_id,
                            student_id: student_id,
                            teacher_id: teacher_id
                        }
                    },
                    icon: getIcon("document_text")
                }
            }, {
                id: this.id + "_final_grade",
                type: "string",
                content: this.final_grade != null ? "" + this.final_grade : "-"
            }
        ];
        if (store.state.sections_use) {
            row.splice(1,0,{
                id: this.id + "_section", // TODO (8): Mettere differenza tra visualizzazione con corso frequentato una volta e più
                type: "string",
                content: this.section
            });
        }
        return row;
    }
}

class Course extends CourseBase { // TODO (6): "unire" con ModelProposition

    creation_school_year: number;
    up_hours: number;
    min_students: number;
    max_students: number;
    proposer_teacher: TeacherSummary;
    certifying_admin?: AdminSummary;
    admin_confirmation?: string;
    italian_expected_learning_results: string;
    english_expected_learning_results: string;
    italian_criterions: string; // TODO (7): vedere se conviene raggruppare le cose con le lingue in oggetti, per poter rendere più facile l'aggiunta di lingue
    english_criterions: string;
    italian_activities: string;
    english_activities: string;
    italian_learning_area: string;
    english_learning_area: string;
    italian_description: string;
    english_description: string;
    access_object: PropositionAccessObject;
    teaching_list: Teaching[];
    growth_list: GrowthArea[];
    images: ImageDescriptor[];
    private learning_contexts: {
        [key: string]: LearningContext
    };

    constructor(courseObj: CourseProps) {
        super(courseObj);
        this.creation_school_year = courseObj.creation_school_year;
        this.up_hours = courseObj.up_hours;
        this.min_students = courseObj.min_students;
        this.max_students = courseObj.max_students;
        this.proposer_teacher = new TeacherSummary({
            id: (courseObj.proposer_teacher_ref.data as { id: number }).id,
            name: courseObj.teacher_name,
            surname: courseObj.teacher_surname
        });
        this.certifying_admin = new AdminSummary({
            id: (courseObj.certifying_admin_ref.data as { id: number }).id,
            name: courseObj.admin_name,
            surname: courseObj.admin_surname
        });
        this.admin_confirmation = courseObj.admin_confirmation;
        this.italian_expected_learning_results = courseObj.italian_expected_learning_results;
        this.english_expected_learning_results = courseObj.english_expected_learning_results;
        this.italian_criterions = courseObj.italian_criterions;
        this.english_criterions = courseObj.english_criterions;
        this.italian_activities = courseObj.italian_activities;
        this.english_activities = courseObj.english_activities;
        this.italian_learning_area = courseObj.italian_learning_area;
        this.english_learning_area = courseObj.english_learning_area;
        this.italian_description = courseObj.italian_description;
        this.english_description = courseObj.english_description;
        this.growth_list = [];
        this.teaching_list = [];
        this.access_object = {};
        this.images = [];
        this.learning_contexts = {};
    }

    private async loadParams() {
        await executeLink("/v1/courses/" + this.id + "/growth_areas",
            response => this.growth_list = response.data.data.map((a: GrowthAreaProps) => new GrowthArea(a)));
        await executeLink("/v1/courses/" + this.id + "/teachings",
            response => this.teaching_list = response.data.data.map((a: TeachingProps) => new Teaching(a)));
        await executeLink("/v1/courses/" + this.id + "/opento",
            response => {
                let learning_context_id;
                for (const constraint of (response.data.data as OpenToConstraint[])) {
                    learning_context_id = (constraint.learning_context_ref.data as { id: string }).id;
                    if (this.access_object[learning_context_id] == undefined) {
                        this.access_object[learning_context_id] = [];
                    }
                    this.access_object[learning_context_id].push({
                        study_year: (constraint.study_year_ref.data as { id: number }).id,
                        study_address: (constraint.study_address_ref.data as { id: string }).id,
                        main_study_year: constraint.main_study_year == 1,
                        presidium: constraint.presidium == 1
                    });
                }
            });
        await executeLink("/v1/learning_contexts",
            response => {
                for (const learning_context of (response.data.data as LearningContext[])) {
                    this.learning_contexts[learning_context.id] = learning_context;
                }
            },
            () => []);
    }

    static async newCourse(courseObj: CourseProps) {
        const course = new Course(courseObj);
        await course.loadParams();

        return course;
    }

    getAccessCardsList() {
        const language = getCurrentLanguage();
        const access_list: OrderedCardsList<GeneralCardElements> = {
            order: [],
            cards: {}
        };

        let ordinary_classes_cards: {
            [study_address: string]: {
                card: GeneralCardElements,
                study_years: number[],
            };
        };
        let study_address_visualization: {
            icon: IconAlternatives,
            background: ColorObject
        } | undefined;

        for (const learning_context_id of Object.keys(this.access_object)) {
            if (access_list.cards[learning_context_id] == undefined) {
                access_list.order.push({
                    key: learning_context_id,
                    title: getCustomMessage(learning_context_id, this.learning_contexts[learning_context_id][`${language}_title`], "title", {
                        text: {
                            name: 'medium',
                            type: 'var'
                        }
                    })
                });
                access_list.cards[learning_context_id] = [];
            }

            ordinary_classes_cards = {};
            for (const access of this.access_object[learning_context_id]) {
                if (ordinary_classes_cards[access.study_address] == undefined) {
                    study_address_visualization = getStudyAddressVisualization(access.study_address);
                    ordinary_classes_cards[access.study_address] = {
                        card: {
                            id: access.study_address,
                            group: learning_context_id,
                            content: [{
                                id: access.study_address,
                                type: study_address_visualization != undefined ? "string_icon" : "string",
                                content: study_address_visualization != undefined ? {
                                    text: "",
                                    icon: study_address_visualization.icon,
                                    order: true
                                } : "",
                                colors: {
                                    text: {
                                        name: "white",
                                        type: "var"
                                    },
                                    background: study_address_visualization != undefined ? study_address_visualization.background : {
                                        name: "medium",
                                        type: "var"
                                    }
                                },
                                classes: {
                                    item: {
                                        radius: true,
                                    }
                                }
                            }],
                            classes: {
                                content: {
                                    "ion-no-padding": true
                                }
                            }
                        },
                        study_years: [access.study_year]
                    }
                } else {
                    ordinary_classes_cards[access.study_address].study_years.push(access.study_year);
                }
            }

            for (const study_address of Object.keys(ordinary_classes_cards)) {
                ordinary_classes_cards[study_address].study_years.sort();
                ((ordinary_classes_cards[study_address].card.content as CustomElement[])[0].content as StringIcon).text = ordinary_classes_cards[study_address].study_years.join("-") + " " + study_address;
                access_list.cards[learning_context_id].push(ordinary_classes_cards[study_address].card);
            }
        }

        return access_list;
    }

    getGrowthCardsList(): OrderedCardsList<GeneralCardElements> {
        let tmp_card: GeneralCardElements;

        return {
            order: [],
            cards: {
                "": this.growth_list.map(a => {
                    tmp_card = a.toCard(true);
                    (tmp_card.content as CustomElement[])[0].colors = {
                        text: {
                            name: "white",
                            type: "var"
                        },
                        background: {
                            name: "odo",
                            type: "var"
                        },
                    };
                    (tmp_card.content as CustomElement[])[0].classes = {
                        label: {
                            "ion-padding": true,
                            radius: true,
                            "ion-text-wrap": true,
                        }
                    };
                    tmp_card.classes = {
                        content: {
                            "ion-no-padding": true
                        }
                    };

                    return tmp_card;
                })
            }
        };
    }

    getTeachingCardsList(): OrderedCardsList<GeneralCardElements> {
        let tmp_card: GeneralCardElements;
        return {
            order: [],
            cards: {
                "": this.teaching_list.map(a => {
                    tmp_card = a.toCard(true);
                    (tmp_card.content as CustomElement[])[0].colors = {
                        text: {
                            name: "white",
                            type: "var"
                        },
                        background: {
                            name: "bio",
                            type: "var"
                        }
                    };
                    (tmp_card.content as CustomElement[])[0].classes = {
                        label: {
                            "ion-padding": true,
                            radius: true,
                            "ion-text-wrap": true,
                        }
                    };
                    tmp_card.classes = {
                        content: {
                            "ion-no-padding": true
                        }
                    };

                    return tmp_card;
                })
            }
        };
    }

    toCard(user?: User) {

        const language = getCurrentLanguage();

        const hours_per_credit: number = store.state.hours_per_credit;
        const hours = this.credits * hours_per_credit;

        const course: GeneralCardElements = {
            id: "" + this.id,
            group: "",
            content: [{
                id: this.id + "_description", // TODO (9): usare getCustomMessage
                type: "html",
                content: this[`${language}_description`]
            }, {
                id: this.id + "_expected_learning_resuts_title",
                type: "title",
                content: getCurrentElement("expected_learning_results").toUpperCase()
            }, {
                id: this.id + "_expected_learning_resuts",
                type: "html",
                content: this[`${language}_expected_learning_results`]
            }, {
                id: this.id + "_criterions_title",
                type: "title",
                content: getCurrentElement("criterions").toUpperCase()
            }, {
                id: this.id + "_criterions",
                type: "html",
                content: this[`${language}_criterions`]
            }, {
                id: this.id + "_activities_title",
                type: "title",
                content: getCurrentElement("activities").toUpperCase()
            }, {
                id: this.id + "_activities",
                type: "html",
                content: this[`${language}_activities`]
            }, {
                id: this.id + "_technical_information",
                type: "title",
                content: getCurrentElement("characteristics").toUpperCase()
            }, {
                id: this.id + "_learning_area",
                type: "html",
                content: "<b>" + getCurrentElement("learning_area") + "</b>: " + this[`${language}_learning_area`] // TODO (8): mettere grasseto dentro
            }, {
                id: this.id + "_credits",
                type: "html",
                content: "<b>" + getCurrentElement("credits") + "</b>: " + this.credits + " (" + (hours) + " " + getCurrentElement(hours == 1 ? "hour" : "hours") + ")"
            }, {
                id: this.id + "_up_hours",
                type: "html",
                content: "<b>" + getCurrentElement("up_hours") + "</b>: " + this.up_hours + " " + getCurrentElement(this.up_hours == 1 ? "hour" : "hours")
            }, {
                id: this.id + "_students_number",
                type: "html",
                content: "<b>" + getCurrentElement("students_number") + "</b>: <ul class='ion-no-margin'><li>" + getCurrentElement("min") + ": " + this.min_students + "</li><li>" + getCurrentElement("max") + ": " + this.max_students + "</li></ul>"
            }, {
                id: this.id + "_proposer_teacher",
                type: "html",
                content: "<b>" + getCurrentElement("proposer_teacher") + "</b>: " + this.proposer_teacher.surname + " " + this.proposer_teacher.name
            }]
        };

        if (user != undefined && user.user != "student") {
            course.content?.push({
                id: this.id + "_creation_date",
                type: "html",
                content: "<b>" + getCurrentElement("creation_school_year") + "</b>: " + this.creation_school_year
            });
            if(this.certifying_admin != undefined){
                course.content?.push({
                    id: this.id + "_certifying_admin",
                    type: "html",
                    content: "<b>" + getCurrentElement("certifying_admin") + "</b>: " + this.certifying_admin.name + " " + this.certifying_admin.surname
                });
            } 
        }

        return course;
    }
}

type LearningSessionProps = {
    id: number;
    number: number;
    school_year: number;
    start: string;
    end: string;
    num_groups: number;
    open_day: string;
}

class LearningSessionSummary {
    id: number;
    number: number;
    school_year: number;

    constructor(sessionObj: {
        id: number,
        number: number,
        school_year: number,
    }) {
        this.id = sessionObj.id;
        this.number = sessionObj.number;
        this.school_year = sessionObj.school_year;
    }
}

class LearningSession extends LearningSessionSummary { // TODO (4): sistema numero-anno dove visualizzo solo ID

    start: Date;
    end: Date;
    num_groups: number;
    open_day: Date;

    constructor(sessionObj: LearningSessionProps) {
        super(sessionObj);
        this.start = new Date(sessionObj.start);
        this.end = new Date(sessionObj.end);
        this.num_groups = sessionObj.num_groups;
        this.open_day = new Date(sessionObj.open_day);
    }

    getStatus(reference = new Date()) { // future [TDB] upcoming [SD] current [ED] completed
        const startDate = this.start;
        const endDate = this.end;
        const tenDaysBefore = new Date(startDate);
        tenDaysBefore.setDate(tenDaysBefore.getDate() - 10);

        return reference < tenDaysBefore ? LearningSessionStatus.FUTURE
            : reference >= tenDaysBefore && reference < startDate ? LearningSessionStatus.UPCOMING
                : reference >= startDate && reference <= endDate ? LearningSessionStatus.CURRENT
                    : LearningSessionStatus.COMPLETED;
    }

    /*async getDividedCourseList(session: LearningSession, learning_areas: LearningArea[]) {
        const language = getCurrentLanguage();
        const courses : CourseSummary[] = (await $axios.get("/v1/courses?student_id=" + user_id + "&session_id=" + session.id)).data.data;
        let tmp_learning_area_id : string,
            tmp_learning_area : LearningArea | undefined,
            i : number,
            course_list = "";
        while (courses.length > 0) {
            tmp_learning_area_id = (courses[0].learning_area_ref.data as {id: string}).id;
            tmp_learning_area = learning_areas.find(area => area.id == tmp_learning_area_id);
            course_list += "<label>" + (tmp_learning_area != undefined ? tmp_learning_area[`${language}_title`] : "") + ":</label><br /><ul>";
            i = 0;
            while (i < courses.length) {
            if ((courses[i].learning_area_ref.data as {id: string}).id == tmp_learning_area_id) {
                course_list += "<li>" + courses[i][`${language}_title`] + "</li>";
                courses.splice(i,1);
            } else {
                i++;
            }
            }
        }

        return course_list;
    }*/

    async getSessionList(learning_context?: LearningContextSummary, reference = new Date(), credits?: boolean, courses_list?: boolean): Promise<string> {

        const language = getCurrentLanguage();
        const user = User.getLoggedUser() as User;

        const status = this.getStatus(reference);
        const put_credits = credits ?? status == LearningSessionStatus.FUTURE;
        const put_courses_list = courses_list ?? (status == LearningSessionStatus.CURRENT || status == LearningSessionStatus.UPCOMING);
        const actual_learning_context = getActualLearningContext(learning_context);
        const courses: {
            [learning_area_id: string]: CourseSummary[]
        } = {};
        const learning_areas = await executeLink("/v1/learning_areas?all_data=true&session_id=" + this.id + "&credits=" + put_credits,
            response => response.data.data,
            () => []);

        let courses_presence: boolean;
        let session_list = put_courses_list ? "" : "<ul class='ion-no-margin'>";

        await executeLink("/v1/courses?student_id=" + user.id + "&context_id=" + actual_learning_context.id + "&session_id=" + this.id,
            response => (response.data.data as CourseSummaryProps[]).map(x => {
                const course = new CourseSummary(x);
                const learning_area_id = (course.learning_area_ref.data as { id: string }).id;
                if (courses[learning_area_id] == undefined) {
                    courses[learning_area_id] = [];
                }
                courses[learning_area_id].push(course);
            }));

        for (const area of learning_areas) { // ! (3): mettere informazione su corsi pubblicati o no
            session_list += (put_courses_list ? "<label>" : "<li>") + area[`${language}_title`] + ": " + (put_credits ? (courses[area.id] != undefined ? courses[area.id].filter(course => course.pending == "true").reduce((pv, cv) => pv + cv.credits, 0) : 0) + "/" + area.credits : "") + (put_courses_list ? "</label>" : "</li>");
            if (put_courses_list) {
                courses_presence = courses[area.id] != undefined && courses[area.id].length > 0;
                session_list += courses_presence ? "<ul class='ion-no-margin'>" : "<br />";
                if (courses_presence) {
                    for (const course of courses[area.id]) {
                        if (course.pending == "true") {
                            session_list += "<li>"
                                + course[`${language}_title`]
                                + (store.state.sections_use && (status == LearningSessionStatus.CURRENT || status == LearningSessionStatus.UPCOMING) && course.section != null
                                    ? " - " + getCurrentElement("section") + " " + course.section : "")
                                + "</li>";
                        }
                    }
                    session_list += "</ul>";
                }
            }
        }
        session_list += (put_courses_list ? "" : "</ul>");

        return session_list;
    }

    async getSubscribedCredits(learning_context_id: string): Promise<number> {

        const user = User.getLoggedUser() as User;

        return await executeLink("/v1/courses?student_id=" + user.id + "&session_id=" + this.id + "&context_id=" + learning_context_id,
            response => response.data.data.reduce((a: number, b: CourseSummaryProps) => a + (b.pending == "true" ? b.credits : 0), 0),
            () => 0);
    }

    async toCard(selected?: boolean, learning_context?: LearningContextSummary, credits?: boolean, courses_list?: boolean, reference = new Date()): Promise<GeneralCardElements> {

        const status = this.getStatus(reference);
        const put_credits = credits ?? status == LearningSessionStatus.FUTURE;
        const actual_learning_context: LearningContextSummary = getActualLearningContext(learning_context);
        const tmp_element: GeneralCardElements = {
            id: "" + this.id,
            group: this.school_year,
            title: getCustomMessage("title", getCurrentElement("session") + " " + this.number, "title"),
            subtitle: getCustomMessage("subtitle", getRagneString(new Date(this.start), new Date(this.end))),
            content: selected == undefined && (status != LearningSessionStatus.COMPLETED || credits != undefined || courses_list != undefined) ? [{
                id: this.id + "_open_day",
                type: "string",
                content: getCurrentElement("open_day") + ": " + toDateString(this.open_day), // TODO (4): sistemare titoli che appaiono più piccoli, cambiando il tipo in "title"
            }, {
                id: this.id + "_description",
                type: "html",
                content: (put_credits ? "<label>" + getCurrentElement("constraints") + ":"
                    + (actual_learning_context.credits != null ? " " + (await this.getSubscribedCredits(actual_learning_context.id)) + "/" + actual_learning_context.credits : "") + "</label>" : "")
                    + (actual_learning_context.credits == null ? (await this.getSessionList(actual_learning_context, reference, credits, courses_list)) : "")
            }] : undefined,
            side_element: selected != undefined ? {
                id: "status",
                type: "string",
                colors: {
                    text: {
                        name: getStatusColor(status),
                        type: "var"
                    }
                },
                content: getStatusString(status)
            } : undefined,
            selected: selected,
            link: selected == undefined ? {
                url: "learning_sessions/" + this.id,
                method: "get"
            } : {
                event: "change_selection",
                data: {
                    id: this.id,
                },
            }
        };

        return tmp_element;
    }
}

type IconAlternatives = {
    ios: string,
    md: string
}

type IconsList = {
    [key: string]: IconAlternatives
}

type StringIcon = {
    text: string,
    icon: IconAlternatives,
    order?: boolean
}

type RequestParameters = {
    url: string,
    method: Method,
}

type EventParameters = {
    event: string,
    data?: {
        [key: string]: any
    }
}

type LinkParameters = RequestParameters | EventParameters;

type RequestIcon = RequestParameters & {
    icon: IconAlternatives
}

type EventIcon = EventParameters & {
    icon: IconAlternatives
}

type RequestString = RequestParameters & {
    text: string
}

type EventString = EventParameters & {
    text: string
}

type RequestStringIcon = {
    whole_link?: boolean,
} & RequestParameters & StringIcon;

type EventStringIcon = {
    whole_link?: boolean,
} & EventParameters & StringIcon;

type CardsList<T = CardElements> = {
    [key: string | number]: T[]
}

type OrderedCardsList<T = CardElements> = {
    order: {
        key: string | number,
        title: CustomElement
    }[],
    cards: CardsList<T>
}

type OrderedCardsGrid<T = CardElements> = {
    order: {
        key: string | number,
        title: CustomElement
    }[],
    cards: {
        [key: string | number]: T[][] | undefined
    }
}

type ElementType = "string" | "html" | "icon" | "title" | "string_icon";

type LinkType = "request" | "event";

type ContentType = string | number | IconAlternatives | StringIcon | RequestIcon | EventIcon | RequestString | EventString | RequestStringIcon | EventStringIcon;

type ColorType = "var" | "text" | "hex";

type ColorObject = {
    name: string,
    type: ColorType
};

type GeneralSubElements = "text" | "background" | "borders";

type GeneralCardSubElements = "background" | "text" | "dividers_text" | "external_borders" | "cards_borders" | "list_borders" | "dividers";

type SubElements = "label" | "html" | "icon" | "button" | "item";

type CardSubElements = "card" | "header" | "content";

type SelectSubElements = "select" | "option";

type EditorSubElements = "editor";

type CardsCommonElements = CardSubElements | "divider" | "item";

type CardsListElements = CardsCommonElements | "list";

type CardsGridElements = CardsCommonElements | "grid" | "row" | "col";

type Colors<T extends GeneralSubElements | GeneralCardSubElements> = {
    [key in keyof string as T]?: ColorObject
};

type Classes<T extends SubElements | CardsListElements | CardsGridElements | SelectSubElements | EditorSubElements> = {
    [key in keyof string as T]?: {
        [key: string]: boolean
    }
}

type CustomElement = { // TODO (6): togliere type e usare funzioni is... o roba tipo CustomElement<T>
    id: string,
    type: ElementType,
    linkType?: LinkType,
    colors?: Colors<GeneralSubElements>,
    classes?: Classes<SubElements>,
    params?: TmpList,
    content: ContentType
}

type GradeProps = {
    publication: Date,
    grade: number,
    final: boolean
} & {
        [key in keyof string as `${Language}_description`]: string
    }

class Grade implements GradeProps {

    id: number;
    publication: Date;
    grade: number;
    italian_description: string;
    english_description: string;
    final: boolean;

    constructor(props: GradeProps) {
        this.publication = new Date(props.publication);
        this.grade = props.grade;
        this.italian_description = props.italian_description;
        this.english_description = props.english_description;
        this.final = props.final;

        this.id = hashCode(this.publication.toISOString());
    }

    toCard(): GeneralCardElements { // ! (3): per visualizzazione tabella a telefono
        const language = getCurrentLanguage();
        return {
            id: "" + this.id,
            group: "",
            content: [{
                id: this.id + "_description",
                type: "html",
                content: this[`${language}_description`]
            }]
        }
    }

    toTableRow(teacher_id: number): CustomElement[] {
        const language = getCurrentLanguage();

        teacher_id + 5; // Temporary dummy use
        return [{
            id: this.id + "_description",
            type: "html",
            content: this[`${language}_description`]
        }, {
            id: this.id + "_pubblication",
            type: "string",
            content: toDateString(this.publication)
        }, {
            id: this.id + "_value",
            type: "html",
            content: (this.final ? "<b>" + getCurrentElement("final") + "</b><br />" : "") + this.grade
        }/*, {
            id: this.id + "_edit",
            type: "icon",
            linkType: "event",
            content: {
                event: "edit_grade",
                data: {
                    id: this.id,
                    teacher_id: teacher_id,
                },
                icon: getIcon("pencil")
            }
        }, {
            id: this.id + "_remove",
            type: "icon",
            linkType: "event",
            content: {
                event: "remove_grade",
                data: {
                    id: this.id,
                    teacher_id: teacher_id,
                },
                icon: getIcon("close")
            }
        }*/];
    }
}

type GradesParameters = {
    course_id: number,
    session_id: number,
    student_id: number,
    teacher_id?: number,
    associated_teacher?: boolean,
}

type ProjectClassTeachingsResponse = {
    id: string,
    italian_title: string,
    english_title: string,
    section: string,
    teaching_ref: ResponseItem<{
        "id": string
    }>,
    my_teaching?: boolean
}

class CourseSectionsTeachings {

    id: string;
    italian_title: string;
    english_title: string;
    sections: Set<string>;
    my_teaching_refs: Set<string>;

    constructor(props: ProjectClassTeachingsResponse) {
        this.id = props.id;
        this.italian_title = props.italian_title;
        this.english_title = props.english_title;
        this.sections = new Set([props.section]);
        this.my_teaching_refs = new Set([(props.teaching_ref.data as {
            "id": string
        }).id]);
    }

    toCard(group: string, learning_session: string): GeneralCardElements { // ! (3): per visualizzazione tabella a telefono
        const language = getCurrentLanguage();
        const card: GeneralCardElements = {
            id: "" + this.id,
            group: group,
            content: [{
                id: this.id + "_title",
                type: "title",
                content: this[`${language}_title`]
            }],
            link: {
                url: "project_courses/" + this.id + "/" + learning_session,
                method: "get"
            }
        };
        if (store.state.sections_use) {
            card.content?.push({
                id: this.id + "_sections",
                type: "string",
                content: getCurrentElement("sections") + ": " + Array.from(this.sections).join(", ")
            });
        }
        card.content?.push({
            id: this.id + "_my_associated_teachings",
            type: "string",
            content: getCurrentElement("my_associated_teachings") + ": " + Array.from(this.my_teaching_refs).join(", ")
        });
        return card;
    }
}

type StudentSummaryProps = {
    id: number,
    name: string,
    surname: string,
}

type StudentProps = StudentSummaryProps & {
    learning_context_ref?: ResponseItem<{
        "id": string
    }>,
    ord_class_study_year: number,
    ord_class_address: string,
    ord_class_section: string
}

type StudentInformationProps = StudentSummaryProps & {
    username: string,
    gender: string,
    birth_date: string,
    address: string,
    email: string,
    ordinary_class_ref: ResponseItem<{
        study_address: string,
        study_year: number
    }>,
    class_section: string
}

class StudentSummary implements StudentSummaryProps {

    id: number;
    name: string;
    surname: string;

    constructor(student: StudentSummaryProps) {
        this.id = student.id;
        this.name = student.name;
        this.surname = student.surname;
    }

    toCard(path: string): GeneralCardElements {
        return {
            id: "" + this.id,
            group: "",
            content: [{
                id: this.id + "_name_surname",
                type: "string",
                content: this.name + " " + this.surname
            }],
            link: {
                url: path,
                method: "get"
            }
        }
    }
}

class Student extends StudentSummary {

    learning_context_id?: string;
    ordinary_class: OrdinaryClassSummary;

    constructor(props: StudentProps) {
        super(props);
        this.learning_context_id = props.learning_context_ref != undefined ? (props.learning_context_ref.data as { id: string }).id : undefined;
        this.ordinary_class = new OrdinaryClassSummary({
            study_year: props.ord_class_study_year,
            address: props.ord_class_address,
            section: props.ord_class_section
        })
    }

    toCard(): GeneralCardElements { // ! (3): per visualizzazione tabella a telefono
        return {
            id: "" + this.id,
            group: "",
            content: [{
                id: this.id + "_name",
                type: "string",
                content: this.name
            }, {
                id: this.id + "_surname",
                type: "string",
                content: this.surname
            }]
        }
    }

    toTableRow(course_id: string, session_id: string, teacher_id?: number, grades?: boolean, final_grade?: Grade): CustomElement[] {
        const row_to_return: CustomElement[] = [{ // TODO (4): rendere cliccabile
            id: this.id + "_name_surname",
            type: "string",
            content: this.name + " " + this.surname
        }];
        const tmp_row: CustomElement[] = [{
            id: this.id + "_class",
            type: "string",
            content: this.ordinary_class.toString()
        }];

        if (this.learning_context_id != undefined) {
            row_to_return.push({
                id: this.id + "_learning_context",
                type: "string",
                content: this.learning_context_id
            })
        }
        if (grades) {
            tmp_row.push({
                id: this.id + "_gardes", // TODO (4): Mettere il controllo con future_course al passaggio a curriculum_v2
                type: "icon",
                linkType: "event",
                content: {
                    event: "grades",
                    data: {
                        title: this.name + " " + this.surname,
                        parameters: {
                            course_id: course_id,
                            session_id: session_id,
                            student_id: this.id,
                            teacher_id: teacher_id
                        }
                    },
                    icon: getIcon("document_text")
                }
            }, {
                id: this.id + "_final_grade",
                type: "string",
                content: final_grade != undefined ? "" + final_grade.grade : "-"
            })
        } else {
            tmp_row.push({
                id: this.id + "_edit",
                type: "icon",
                linkType: "event",
                content: {
                    event: "edit",
                    data: {
                        title: this.name + " " + this.surname,
                        parameters: {
                            course_id: course_id,
                            session_id: session_id,
                            student_id: this.id
                        }
                    },
                    icon: getIcon("pencil")
                }
            })
        }

        return row_to_return.concat(tmp_row);
    }
}

class StudentInformation extends StudentSummary {

    username: string;
    gender?: Gender;
    birth_date?: Date;
    address?: string;
    email: string;
    ordinary_class: OrdinaryClassSummary;

    constructor(props: StudentInformationProps) {
        super(props);
        this.username = props.username;
        this.gender = props.gender as Gender;
        this.birth_date = new Date(props.birth_date);
        this.address = props.address;
        this.email = props.email;

        const tmp_class = props.ordinary_class_ref.data as {
            study_address: string,
            study_year: number,
            section: string
        };
        this.ordinary_class = new OrdinaryClassSummary({
            study_year: tmp_class.study_year,
            address: tmp_class.study_address,
            section: props.class_section
        });
    }

    toCard(): GeneralCardElements {
        return { // TODO (6): sistemare roba undefined
            id: "" + this.username,
            title: getCustomMessage("title", this.username, "title"),
            group: "",
            content: [{
                id: this.id + "_name",
                type: "string",
                content: getCurrentElement("name") + ": " + this.name
            }, {
                id: this.id + "_surname",
                type: "string",
                content: getCurrentElement("surname") + ": " + this.surname
            }, {
                id: this.id + "_gender",
                type: "string",
                content: getCurrentElement("gender") + ": " + (this.gender != undefined ? getGender(this.gender) : "-")
            }, {
                id: this.id + "_birth_date",
                type: "string",
                content: getCurrentElement("birth_date") + ": " + (this.birth_date != undefined ? toDateString(this.birth_date) : "-")
            }, {
                id: this.id + "_address",
                type: "string",
                content: getCurrentElement("address") + ": " + this.address
            }, {
                id: this.id + "_email",
                type: "string",
                content: getCurrentElement("email") + ": " + this.email
            }, {
                id: this.id + "_class",
                type: "string",
                content: getCurrentElement("class") + ": " + this.ordinary_class.toString()
            }]
        }
    }
}

type LearningContextSummary = {
    id: string
    credits?: number | null
}

type LearningContext = LearningContextSummary & TitleDescription;

type AnnouncementSummaryProps = {
    id: number,
    publishment: Date
} & {
        [key in keyof Language as `${Language}_title`]: string
    }

type Announcement = AnnouncementSummaryProps & {
    [key in keyof Language as `${Language}_message`]: string
}

class AnnouncementSummary implements AnnouncementSummaryProps {
    id: number;
    publishment: Date;
    italian_title: string;
    english_title: string;

    constructor(props: AnnouncementSummaryProps) {
        this.id = props.id;
        this.publishment = new Date(props.publishment);
        this.italian_title = props.italian_title;
        this.english_title = props.english_title;
    }

    toCard(): GeneralCardElements {
        const language = getCurrentLanguage();
        return {
            id: "" + this.id,
            group: "",
            content: [{
                id: this.id + "_title",
                type: "string",
                linkType: "event",
                content: {
                    event: "announcement",
                    data: {
                        title: this[`${language}_title`],
                        announcement_id: this.id,
                    },
                    text: this[`${language}_title`]
                }
            }, {
                id: this.id + "_publishment",
                type: "string",
                content: getCurrentElement("publishment") + ": " + toDateString(this.publishment)
            }]
        }
    }
}

type AnnouncementParameters = {
    course_id: number,
    session_id: number,
    sections: string[],
    current_section_index: number,
    teacher_id?: number
}

type Gender = "M" | "F" | "O";

const GenderKeys: {
    [key in keyof string as Gender]: string
} = {
    "M": "male",
    "F": "female",
    "O": "other"
}

type AlternateList<T> = {
    [key: string]: TmpList<T> | T
};

type TmpList<T = any> = {
    [key: string | number]: T
};

type Progression = {
    learning_area_ref: ResponseItem<{
        id: string | null
    }>,
    learning_context_ref: ResponseItem<{
        id: string
    }>,
    credits: string,
    max_credits: number
}

type LoginInformation = {
    type: UserType,
    parameters: {
        [key: string]: string
    }
}

type UserType = "student" | "teacher" | "admin";

type LoginResponse = {
    success: boolean,
    message: string
}

type SuccessLoginResponse = LoginResponse & {
    user: UserType,
    token: string,
    username: string,
    id: number
}

type UserProps = {
    id: number,
    username: string,
    token: string,
    user: UserType,
    expirationDate: string,
    // ! (3): mettere first_access
}

class User {

    [key: string]: any;

    id: number;
    username: string;
    token: string;
    user: UserType;
    expiration_date: Date;

    constructor(props: UserProps) {
        this.id = props.id;
        this.username = props.username;
        this.token = props.token;
        this.user = props.user;
        this.expiration_date = new Date(props.expirationDate);
    }

    static getProperties() {
        return ["id", "username", "token", "user", "expiration_date"];
    }

    static getLoggedUser() {

        const session = window.sessionStorage;
        const user: User | undefined = store.state.user;

        if (user != undefined) {
            return user;
        } else if (session.getItem("id") != undefined) {
            const a = new User({
                id: parseInt(session.getItem("id") as string),
                username: session.getItem("username") as string,
                token: session.getItem("token") as string,
                user: session.getItem("user") as UserType,
                expirationDate: session.getItem("expiration_date") as string,
            });
            return a;
        } else {
            return undefined;
        }
    }
}

type CourseModelProps = {
    course_ref: ResponseItem<{
        id: number
    }>,
    creation_school_year: number,
    learning_session_id: number | null,
    project_class_confirmation_date: string | null,
    project_class_to_be_modified: boolean | null,
    course_confirmation_date: string | null,
    course_to_be_modified: boolean | null,
    certifying_admin_ref: ResponseItem<{
        id: number
    }> | null,
    admin_name: string | null,
    admin_surname: string | null,
    proposer_teacher_ref: ResponseItem<{ // TODO (9): raccogliere ref, name e surname in un unico type
        id: number
    }> | null,
    teacher_name: string | null,
    teacher_surname: string | null,
} & {
        [key in keyof string as `${Language}_title`]: string
    }

class CourseModel {

    id: number;
    creation_school_year: number;
    learning_session?: LearningSessionSummary;
    italian_title: string;
    english_title: string;
    project_class_confirmation_date?: Date;
    project_class_to_be_modified?: boolean;
    course_confirmation_date?: Date;
    course_to_be_modified?: boolean;
    certifying_admin?: AdminSummary;
    proposer_teacher?: TeacherSummary;

    constructor(props: CourseModelProps, learning_session?: LearningSession) {
        this.id = (props.course_ref.data as { id: number }).id;
        this.learning_session = learning_session ?? (props.learning_session_id != undefined ? new LearningSessionSummary({
            id: props.learning_session_id,
            number: -1,
            school_year: -1,
        }) : undefined);
        this.italian_title = props.italian_title;
        this.english_title = props.english_title;
        this.creation_school_year = props.creation_school_year;
        this.project_class_confirmation_date = props.project_class_confirmation_date != null ? new Date(props.project_class_confirmation_date) : undefined;
        this.project_class_to_be_modified = props.project_class_to_be_modified ?? undefined;
        this.course_confirmation_date = props.course_confirmation_date != null ? new Date(props.course_confirmation_date) : undefined;
        this.course_to_be_modified = props.course_to_be_modified ?? undefined;
        this.proposer_teacher = props.proposer_teacher_ref != undefined && props.teacher_name != undefined && props.teacher_surname != undefined ? new TeacherSummary({
            id: (props.proposer_teacher_ref.data as { id: number }).id,
            name: props.teacher_name,
            surname: props.teacher_surname
        }) : undefined; // Project class
        this.certifying_admin = props.certifying_admin_ref != null && props.admin_name != null && props.admin_surname != null ? new AdminSummary({
            id: (props.certifying_admin_ref.data as { id: number }).id,
            name: props.admin_name,
            surname: props.admin_surname
        }) : undefined; // Project class
    }

    async loadParms() {
        if (this.learning_session) {
            this.learning_session = await executeLink("/v1/learning_sessions/" + this.learning_session.id,
                response => new LearningSessionSummary(response.data.data)); // TODO (4): mettere alternativa dove vengono passati i parametri al costruttore per diminuire il numero di richieste
        }
    }

    isApproved() {
        return this.course_confirmation_date instanceof Date
            && !isNaN(this.course_confirmation_date.getMilliseconds())
            && (this.learning_session == undefined
                || (this.project_class_confirmation_date instanceof Date
                    && !isNaN(this.project_class_confirmation_date.getMilliseconds())));
    }

    toString() {
        const language = getCurrentLanguage();
        return this[`${language}_title`] + " - " + getCompleteSchoolYear(this.creation_school_year);
    }

    toCard(user: User, view = false): GeneralCardElements { // TODO (5): evidenziare quando project_class_to_be_modified | course_to_be_modified
        const language = getCurrentLanguage();
        
        let project_class = "<label>" + getCurrentElement("project_class") + ":";

        const card: GeneralCardElements = {
            id: this.id + "_" + this.creation_school_year + (this.learning_session != undefined ? "_" + this.learning_session.id : ""),
            group: "",
            title: getCustomMessage("title", this[`${language}_title`] + " - " + this.creation_school_year, "title"),
            subtitle: this.learning_session != undefined ? getCustomMessage("subtitle", getCurrentElement("session") + ": " + this.learning_session.number + " - " + this.learning_session.school_year) : undefined,
            content: [{
                id: this.id + "_course_confirmation_date",
                type: "string",
                content: getCurrentElement("course_confirmation_date") + ": " + (this.course_confirmation_date != undefined ? toDateString(this.course_confirmation_date) : "-")
            }],
            link: {
                url: "/course_proposal?" + (view ? "view=" + this.id + (this.learning_session != undefined ? "_" + this.learning_session.id : "") : ""), // TODO (6*): mettere guardia che sistema il link, salvando le cose sulla sessione
                method: "get"
            }
        }

        if (user.user != "teacher") {
            card.content?.push({
                id: this.id + "_proposer_teacher",
                type: "string",
                content: getCurrentElement("proposer_teacher") + ": " + (this.proposer_teacher != undefined ? (this.proposer_teacher.surname + " " + this.proposer_teacher.name) : "-"),
            });
        }
        if (this.learning_session != undefined && card.content != undefined) {
            if (this.certifying_admin != undefined && this.project_class_confirmation_date != undefined) {
                project_class += "</label><ul class='ion-no-margin'><li>"
                    + getCurrentElement("confirmation_date") + ": " + toDateString(this.project_class_confirmation_date) + "</li>"
                    + "<li>" + getCurrentElement("certifying_admin") + ": " + this.certifying_admin.surname + " " + this.certifying_admin.surname
                    + "</li></ul>"
            } else {
                project_class += " " + getCurrentElement("not_confirmed") + "</label>";
            }
            card.content.push({
                id: this.id + "_project_class",
                type: "html",
                content: project_class,
            })
        }

        return card;
    }
}

type PagesType = "pages" | "editor" | "no_inner_props";

type Pages = "course_id" | "title" | "characteristics1" | "characteristics2" | "description" | "expected_learning_results" | "criterions" | "activities" | "access_object" | "specific_information";

type PropositionKeysType = "required" | "optional" | "lists";

type PropositionListsKeys = "access_object" | "teaching_list" | "growth_list" | "teacher_list";

type PropositionRequiredKeys = PropositionListsKeys | "italian_title" | "italian_descr" | "up_hours" | "credits" | "italian_exp_l" | "italian_cri" | "italian_act" | "area_id" | "min_students" | "max_students" | "session_id" | "class_group" | "num_section";

type PropositionOptionalKeys = "english_title" | "english_descr" | "english_exp_l" | "english_cri" | "english_act";

type PropositionKeys = PropositionRequiredKeys | PropositionOptionalKeys | "course_id";

type PropositionTitles = {
    [key in keyof string as `${Language}_title`]: string
};

type PropositionCharacteristics1 = {
    up_hours: number,
    credits: number,
    area_id: string,
    min_students: number,
    max_students: number,
};

type PropositionCharacteristics2 = {
    growth_list: number[],
    teaching_list: string[]
}

type PropositionDescription = {
    [key in keyof string as `${Language}_descr`]: string
};

type PropositionExpectedLearningResults = {
    [key in keyof string as `${Language}_exp_l`]: string
};

type PropositionCriterions = {
    [key in keyof string as `${Language}_cri`]: string
};

type PropositionActivities = {
    [key in keyof string as `${Language}_act`]: string
};

type AccessObject = {
    study_year: number
    study_address: string
    main_study_year: boolean
    presidium: boolean
}

type PropositionAccessObject = {
    [key: string]: AccessObject[]
};

type PropositionTeacher = {
    teacher_id: number,
    main: boolean,
    sections: string[]
};

type PropositionSpecificInformation = {
    session_id: number,
    class_group: number
    num_section: number,
    teacher_list: PropositionTeacher[]
}

type PropositionObj = {
    [key in keyof string as PropositionKeys]: any;
} & {
    course_id: number;
    access_object: PropositionAccessObject;
} & PropositionTitles & PropositionCharacteristics1 & PropositionCharacteristics2 & PropositionDescription & PropositionExpectedLearningResults & PropositionCriterions & PropositionActivities & PropositionSpecificInformation;

type PagesTitlesRefs = {
    [key in keyof string as Pages]: string
}

class ModelProposition {

    [key: string]: any;

    private _course_id?: number;
    private _title: PropositionTitles;
    private _characteristics1: PropositionCharacteristics1;
    private _characteristics2: PropositionCharacteristics2;
    private _description: PropositionDescription;
    private _expected_learning_results: PropositionExpectedLearningResults;
    private _criterions: PropositionCriterions;
    private _activities: PropositionActivities;
    private _access_object: PropositionAccessObject;
    private _specific_information: PropositionSpecificInformation;
    private _remaining: Pages[];

    constructor(proposition?: PropositionObj) {
        const actual_proposition = proposition ?? ModelProposition.emptyProposition();
        const empty_proposition = proposition != undefined;

        this._course_id = actual_proposition.course_id;
        this._title = {
            italian_title: actual_proposition.italian_title,
            english_title: actual_proposition.english_title
        };
        this._characteristics1 = {
            up_hours: actual_proposition.up_hours,
            credits: actual_proposition.credits,
            area_id: actual_proposition.area_id,
            min_students: actual_proposition.min_students,
            max_students: actual_proposition.max_students,
        };
        this._characteristics2 = {
            growth_list: actual_proposition.growth_list,
            teaching_list: actual_proposition.teaching_list
        };
        this._description = {
            italian_descr: actual_proposition.italian_descr,
            english_descr: actual_proposition.english_descr
        };
        this._expected_learning_results = {
            italian_exp_l: actual_proposition.italian_exp_l,
            english_exp_l: actual_proposition.english_exp_l
        };
        this._criterions = {
            italian_cri: actual_proposition.italian_cri,
            english_cri: actual_proposition.english_cri
        };
        this._activities = {
            italian_act: actual_proposition.italian_act,
            english_act: actual_proposition.english_act
        };
        this._access_object = actual_proposition.access_object;
        this._specific_information = {
            session_id: actual_proposition.session_id,
            class_group: actual_proposition.class_group,
            num_section: actual_proposition.num_section,
            teacher_list: actual_proposition.teacher_list,
        };

        if (empty_proposition) {
            this._remaining = ModelProposition.getProps();
        } else {
            this._remaining = []; // TODO (4): check remaining (usare sessione per persistenza)
        }
    }

    public static emptyProposition(): PropositionObj {
        return {
            course_id: 0, // TODO (4): mettere undefined di base a quelli che possono permetterselo
            italian_title: "",
            english_title: "",
            up_hours: 0,
            credits: 0,
            area_id: "",
            growth_list: [],
            session_id: -1,
            class_group: -1,
            num_section: 1,
            min_students: 0,
            max_students: 0,
            teaching_list: [],
            italian_descr: "",
            english_descr: "",
            italian_exp_l: "",
            english_exp_l: "",
            italian_cri: "",
            english_cri: "",
            italian_act: "",
            english_act: "",
            access_object: {},
            teacher_list: []
        }
    }

    public get course_id() {
        return this._course_id;
    }
    public set course_id(value: number | undefined) {
        this._course_id = value;
        this._remaining = this._remaining.filter(a => a != "course_id");
    }

    public get title() {
        return this._title;
    }
    public set title(value: PropositionTitles) {
        this._title = value;
        this._remaining = this._remaining.filter(a => a != "title");
    }

    public get characteristics1() {
        return this._characteristics1;
    }
    public set characteristics1(value: PropositionCharacteristics1) {
        this._characteristics1 = value;
        this._remaining = this._remaining.filter(a => a != "characteristics1");
    }

    public get characteristics2() {
        return this._characteristics2;
    }
    public set characteristics2(value: PropositionCharacteristics2) {
        this._characteristics2 = value;
        this._remaining = this._remaining.filter(a => a != "characteristics2");
    }

    public get description() {
        return this._description;
    }
    public set description(value: PropositionDescription) {
        this._description = value;
        this._remaining = this._remaining.filter(a => a != "description");
    }

    public get expected_learning_results() {
        return this._expected_learning_results;
    }
    public set expected_learning_results(value: PropositionExpectedLearningResults) {
        this._expected_learning_results = value;
        this._remaining = this._remaining.filter(a => a != "expected_learning_results");
    }

    public get criterions() {
        return this._criterions;
    }
    public set criterions(value: PropositionCriterions) {
        this._criterions = value;
        this._remaining = this._remaining.filter(a => a != "criterions");
    }

    public get activities() {
        return this._activities;
    }
    public set activities(value: PropositionActivities) {
        this._activities = value;
        this._remaining = this._remaining.filter(a => a != "activities");
    }

    public get access_object() {
        return this._access_object;
    }
    public set access_object(value: PropositionAccessObject) {
        this._access_object = value;
        this._remaining = this._remaining.filter(a => a != "access_object");
    }

    public get specific_information() {
        return this._specific_information;
    }
    public set specific_information(value: PropositionSpecificInformation) {
        this._specific_information = {
            session_id: value.session_id,
            class_group: value.class_group,
            num_section: value.num_section,
            teacher_list: value.teacher_list.map(a => {
                return {
                    teacher_id: a.teacher_id,
                    main: /*!!*/a.main ? true : false,
                    sections: a.sections
                }
            })
        };
        this._remaining = this._remaining.filter(a => a != "specific_information");
    }

    toProposition(): PropositionObj {
        const proposition: {
            [key: string]: any
        } = {};
        const keys = Object.keys(this).filter(a => a != "_remaining" && (a != "course_id" || this.course_id != 0));

        let inner_keys: string[];

        for (const page of keys) {
            if (ModelProposition.getProps("no_inner_props").findIndex(a => a == page.slice(1)) == -1) {
                inner_keys = Object.keys(this[page]);
                for (const key of inner_keys) {
                    proposition[key] = this[page][key];
                }
            } else {
                proposition[page.slice(1)] = this[page];
            }
        }

        return proposition as PropositionObj;
    }

    isComplete() {
        return this._remaining.length == 0;
    }


    public get remaining(): string[] {
        return this._remaining;
    }


    static getProps(type?: PagesType): Pages[] {
        switch (type) {
            case undefined:
                return ["course_id", "title", "characteristics1", "characteristics2", "description", "expected_learning_results", "criterions", "activities", "access_object", "specific_information"];
            case "pages":
                return ["title", "characteristics1", "characteristics2", "description", "expected_learning_results", "criterions", "activities", "access_object", "specific_information"];
            case "editor":
                return ["description", "expected_learning_results", "criterions", "activities"];
            case "no_inner_props":
                return ["course_id", "access_object"];
        }
    }

    static getTitles(): PagesTitlesRefs {
        return {
            course_id: "reference_model",
            title: "title",
            characteristics1: "characteristics",
            characteristics2: "characteristics",
            description: "description",
            expected_learning_results: "expected_learning_results",
            criterions: "criterions",
            activities: "activities",
            access_object: "access_object",
            specific_information: "specific_information"
        }
    }

    static getPageIndex(page: Pages) {
        return ModelProposition.getProps().findIndex(a => a == page);
    }

    getKeyIndex(key: PropositionKeys) {
        const pages = ModelProposition.getProps("pages");

        let index: number;
        let count = 0;

        if ((index = pages.findIndex(a => a == key)) == -1) {
            while (index == -1 && count < pages.length) {
                if (key in (this[pages[count]] as object)) {
                    index = count;
                }
                count++;
            }
        }

        return index;
    }

    static getPropositionProps(type: PropositionKeysType): PropositionKeys[] {
        const lists: PropositionListsKeys[] = ["access_object","teaching_list","growth_list","teacher_list"];

        let keys: PropositionKeys[];

        switch (type) {
            case "required":
                keys = lists;
                keys.push("italian_title","italian_descr","up_hours","credits","italian_exp_l","italian_cri","italian_act","area_id","min_students","max_students","session_id","class_group","num_section");
                break;
            case "optional":
                keys = ["english_title","english_descr","english_exp_l","english_cri","english_act"];
                break;
            default:
                keys = [];
                break;
        }

        return keys;
    }

    private getRequiredInformation(): {
        [key in keyof string as PropositionRequiredKeys]: {
            rule: boolean | number[],
            error_message: string,
        }
    } {
        return {
            italian_title: {
                rule: true,
                error_message: getCurrentElement("missing_italian_title"),
            },
            italian_descr: {
                rule: true,
                error_message: getCurrentElement("missing_italian_description"),
            },
            up_hours: {
                rule: [0],
                error_message: getCurrentElement("up_hours_error"),
            },
            credits: {
                rule: [1],
                error_message: getCurrentElement("credits_error"),
            },
            italian_exp_l: {
                rule: true,
                error_message: getCurrentElement("missing_italian_expected_learning_results"),
            },
            italian_cri: {
                rule: true,
                error_message: getCurrentElement("missing_italian_criterions"),
            },
            italian_act: {
                rule: true,
                error_message: getCurrentElement("missing_italian_activities"),
            },
            area_id: {
                rule: true,
                error_message: getCurrentElement("missing_area_id"),
            },
            growth_list: {
                rule: [1],
                error_message: getCurrentElement("missing_growth_areas"),
            },
            min_students: {
                rule: [1],
                error_message: getCurrentElement("students_error"),
            },
            max_students: {
                rule: [1],
                error_message: getCurrentElement("students_error"),
            },
            session_id: {
                rule: [1],
                error_message: getCurrentElement("missing_session_id"),
            },
            access_object: {
                rule: [1],
                error_message: getCurrentElement("missing_access"),
            },
            teaching_list: {
                rule: [1, 4],
                error_message: getCurrentElement("teaching_error"),
            },
            class_group: {
                rule: [1],
                error_message: getCurrentElement("missing_class_group"),
            },
            num_section: {
                rule: [1],
                error_message: getCurrentElement("num_sections_error"),
            },
            teacher_list: {
                rule: [1],
                error_message: getCurrentElement("missing_teachers"),
            },
        }
    }

    check() {
        const required_information = this.getRequiredInformation(); // TODO (5): trovare un modo per dare un ordine
        const proposition = this.toProposition();
        const missing_information: {
            [key in keyof string as PropositionRequiredKeys]?: string
        } = {};

        let len: number;
        let actual_number: number;

        for (const key of Object.keys(required_information) as PropositionRequiredKeys[]) {
            if (typeof required_information[key].rule == "boolean") {
                if (proposition[key] == undefined || proposition[key] == "") {
                    missing_information[key] = required_information[key].error_message;
                }
            } else if (Array.isArray(required_information[key].rule)) {
                len = (required_information[key].rule as number[]).length;
                if (Array.isArray(proposition[key])) {
                    if (!(proposition[key].length >= (required_information[key].rule as number[])[0] &&
                        (len == 1 || proposition[key].length < (required_information[key].rule as number[])[1]))) {
                        missing_information[key] = required_information[key].error_message;
                    }
                } else if (typeof proposition[key] == "number" || (typeof proposition[key] == "string" && (!isNaN(proposition[key]) || !isNaN(parseFloat(proposition[key]))))) {
                    actual_number = typeof proposition[key] == "number"
                        ? proposition[key]
                        : !isNaN(proposition[key])
                            ? parseInt(proposition[key])
                            : parseFloat(proposition[key]);
                    if (actual_number < (required_information[key].rule as number[])[0]) {
                        missing_information[key] = required_information[key].error_message;
                    }
                } else if (key == "access_object") {
                    if (Object.keys(proposition[key]).length < (required_information[key].rule as number[])[0]) {
                        missing_information[key] = required_information[key].error_message;
                    }
                }
            }
        }

        return missing_information;
    }
}

type TitleDescription = {
    [key in keyof string as `${Language}_title`]: string
} & {
        [key in keyof string as `${Language}_description`]?: string // TODO (4): vedere descrizioni che possono essere null
    };

type GrowthAreaProps = {
    id?: number,
    growth_area_ref?: ResponseItem<{ id: number }>
} & TitleDescription;

class GrowthArea {
    id: number;
    italian_title: string;
    english_title: string;
    italian_description?: string;
    english_description?: string;

    constructor(props: GrowthAreaProps) {
        this.id = props.growth_area_ref != undefined ? (props.growth_area_ref.data as { id: number }).id : props.id as number;
        this.italian_title = props.italian_title;
        this.english_title = props.english_title;
        this.italian_description = props.italian_description;
        this.english_description = props.english_description;
    }

    toCard(disabled = false): GeneralCardElements {
        const language = getCurrentLanguage();
        return {
            id: "" + this.id,
            group: "",
            side_element: disabled ? undefined : {
                id: this.id + "_remove",
                type: "icon",
                linkType: "event",
                content: {
                    event: "remove",
                    data: {
                        id: this.id,
                    },
                    icon: getIcon("close"),
                },
            },
            content: [
                {
                    id: "" + this.id,
                    type: "string",
                    content: this[`${language}_title`],
                },
            ],
        }
    }
}

type TeachingProps = {
    id?: string
    teaching_ref?: ResponseItem<{ id: string }>
} & TitleDescription;

class Teaching {
    id: string;
    italian_title: string;
    english_title: string;
    italian_description?: string;
    english_description?: string;

    constructor(props: TeachingProps) {
        this.id = props.teaching_ref != undefined ? (props.teaching_ref.data as { id: string }).id : props.id as string;
        this.italian_title = props.italian_title;
        this.english_title = props.english_title;
        this.italian_description = props.italian_description;
        this.english_description = props.english_description;
    }

    toCard(disabled = false): GeneralCardElements {
        const language = getCurrentLanguage();
        return {
            id: this.id,
            group: "",
            side_element: disabled ? undefined : {
                id: this.id + "_remove",
                type: "icon",
                linkType: "event",
                content: {
                    event: "remove",
                    data: {
                        id: this.id,
                    },
                    icon: getIcon("close"),
                },
            },
            content: [
                {
                    id: this.id,
                    type: "string",
                    content: this[`${language}_title`],
                },
            ],
        }
    }
}

type StudyAddress = {
    id: string,
    max_classes: number
} & TitleDescription;

class AccessProposition {
    study_year: number;
    study_address: StudyAddress;
    presidium: boolean;
    main_study_year: boolean;

    constructor(
        study_year: number,
        study_address: StudyAddress,
        presidium: boolean,
        main_study_year: boolean
    ) {
        this.study_year = study_year;
        this.study_address = study_address;
        this.presidium = presidium;
        this.main_study_year = main_study_year;
    }

    toCard(learning_context_id: string, disabled = false): GeneralCardElements {
        const language = getCurrentLanguage();

        return {
            id: this.study_address.id + "_" + this.study_year,
            group: learning_context_id,
            side_element: disabled ? undefined : {
                id: this.study_address.id + "_remove",
                type: "icon",
                linkType: "event",
                content: {
                    event: "remove",
                    data: {
                        learning_context_id: learning_context_id,
                        study_address_id: this.study_address.id,
                        study_year: this.study_year,
                    },
                    icon: getIcon("close"),
                },
            },
            content: [
                {
                    id: "class",
                    type: "string",
                    content: this.study_year + " " + this.study_address[`${language}_title`],
                },
                /*{
                    id: "presidium",
                    type: "string",
                    content: getCurrentElement("presidium") + ": " + this.presidium,
                },*/
                {
                    id: "main_study_year",
                    type: "string",
                    content: getCurrentElement("main_study_year") + ": " + (this.main_study_year ? getCurrentElement("yes") : getCurrentElement("no")),
                },
            ],
        }
    }

    toAccessObj(): AccessObject {
        return {
            study_year: this.study_year,
            study_address: this.study_address.id,
            presidium: this.presidium,
            main_study_year: this.main_study_year,
        }
    }
}

type TeacherProps = {
    id: number,
    cf: string,
    username: string,
    name: string,
    surname: string,
    gender: string,
    birth_date: string,
    address: string,
    email: string
}

class TeacherSummary {
    id: number;
    name: string;
    surname: string;

    constructor(summary: { id: number, name: string, surname: string }) {
        this.id = summary.id;
        this.name = summary.name;
        this.surname = summary.surname;
    }
}

class Teacher extends TeacherSummary {
    cf?: string;
    surname: string;
    gender?: Gender;
    birth_date?: Date;
    address?: string;
    email?: string;

    constructor(teacher: TeacherProps) {
        super({
            id: teacher.id,
            name: teacher.name,
            surname: teacher.surname
        });
        this.cf = teacher.cf;
        this.surname = teacher.surname;
        this.gender = teacher.gender == "M" || teacher.gender == "F" ? teacher.gender : "O";
        this.birth_date = new Date(teacher.birth_date);
        this.address = teacher.address;
        this.email = teacher.email;
    }
}

class TeacherProposition {
    teacher: TeacherSummary;
    main: boolean;
    sections: string[];

    constructor(teacher: TeacherSummary, main: boolean, sections: boolean[] | string[]) {
        this.teacher = teacher;
        this.main = main;
        this.sections = [];
        for (const key in sections) {
            if (typeof sections[key] == "string") {
                this.sections.push(sections[key] as string);
            } else if (sections[key]) {
                this.sections.push(numberToSection(parseInt(key)));
            }
        }
    }

    toCard(disabled = false): GeneralCardElements {
        const card: GeneralCardElements = { // TODO (6): sistemare roba undefined
            id: "" + this.teacher.id,
            group: "",
            side_element: disabled ? undefined : {
                id: this.teacher.id + "_remove",
                type: "icon",
                linkType: "event",
                content: {
                    event: "remove",
                    data: {
                        id: this.teacher.id,
                    },
                    icon: getIcon("close"),
                },
            },
            content: [
                /*{
                    id: "name",
                    type: "string_icon",
                    linkType: "event",
                    content: {
                        event: "teacher_info",
                        data: {
                            teacher_id: this.teacher.id,
                        },
                        icon: getIcon("information_circle"),
                        text: this.teacher.name + " " + this.teacher.surname// + (this.main ? " [" + getCurrentElement("main_teacher") + "]" : "")
                    },
                },*/ // TODO (6): creare info teacher
                {
                    id: "name",
                    type: "string",
                    linkType: "event",
                    content: {
                        event: "teacher_info",
                        data: {
                            teacher_id: this.teacher.id,
                        },
                        text: this.teacher.name + " " + this.teacher.surname// + (this.main ? " [" + getCurrentElement("main_teacher") + "]" : "")
                    },
                },
            ],
        };
        if (store.state.sections_use) {
            card.content?.push({
                id: "sections",
                type: "string",
                content: getCurrentElement("sections") + ": " + this.sections.join(", "),
            });
        }
        return card;
    }

    toTeacherObj(): PropositionTeacher {
        return {
            teacher_id: this.teacher.id,
            main: this.main,
            sections: this.sections
        }
    }
}

type OpenToConstraint = {
    study_year_ref: ResponseItem<{ id: number }>,
    study_address_ref: ResponseItem<{ id: string }>,
    presidium: number,
    main_study_year: number,
    learning_context_ref: ResponseItem<{ id: string }>
} & {
        [key in keyof string as `${Language}_title`]: string
    }

type AdminProjectClassProps = { // TODO (9): cambiare nome, dato che possono accederci tutti
    course_id: number,
    learning_session: number,
    group: number,
    teacher_ref: ResponseItem<{
        id: number
    }>,
    teacher_name: string,
    teacher_surname: string,
    admin_ref: ResponseItem<{
        id: number
    }>,
    admin_name: string,
    admin_surname: string,
    to_be_modified: string | null
} & {
        [key in keyof string as `${Language}_title`]: string
    }

class AdminProjectClass {
    course_id: number;
    learning_session: LearningSession;
    group: number;
    italian_title: string;
    english_title: string;
    teacher_id: number;
    teacher_name: string;
    teacher_surname: string;
    admin_id: number;
    admin_name: string;
    admin_surname: string;
    to_be_modified?: string;

    constructor(props: AdminProjectClassProps) {
        this.course_id = props.course_id;
        this.learning_session = new LearningSession({
            id: props.learning_session,
            number: -1,
            school_year: -1,
            start: "",
            end: "",
            num_groups: 0,
            open_day: "invalid",
        });
        this.group = props.group;
        this.italian_title = props.italian_title;
        this.english_title = props.english_title;
        this.teacher_id = (props.teacher_ref.data as { id: number }).id; // TODO (5): raccogliere in tipo TeacherSummary
        this.teacher_name = props.teacher_name;
        this.teacher_surname = props.teacher_surname;
        this.admin_id = (props.admin_ref.data as { id: number }).id;
        this.admin_name = props.admin_name;
        this.admin_surname = props.admin_surname;
        this.to_be_modified = props.to_be_modified ?? undefined;
    }

    async loadParms() {
        await executeLink("/v1/learning_sessions/" + this.learning_session.id,
            response => {
                this.learning_session = new LearningSession(response.data.data)
            });
    }

    toCard(path?: string, user?: User, section?: string, separated_elements = false): GeneralCardElements {  // TODO (5): evidenziare quando project_class_to_be_modified | course_to_be_modified
        const language = getCurrentLanguage();
        const tmp_card: GeneralCardElements = {
            id: "" + this.course_id + "_" + this.learning_session + "_" + this.group,
            group: "",
            title: getCustomMessage("title", this[`${language}_title`], "title"),
            content: [],
            link: path != undefined ? {
                url: path,
                method: "get"
            } : undefined
        };

        if (separated_elements) {
            tmp_card.content?.push({
                id: "learning_session",
                type: "html",
                content: "<b>" + getCurrentElement("session") + "</b>: " + this.learning_session.number + " - " + this.learning_session.school_year + "/" + (this.learning_session.school_year % store.state.year_module + 1),
            }, {
                id: "group",
                type: "html",
                content: "<b>" + getCurrentElement("group") + "</b>: " + this.group,
            });
            if (section != undefined) {
                tmp_card.content?.push({
                    id: "section",
                    type: "html",
                    content: "<b>" + getCurrentElement("section") + "</b>: " + section,
                });
            }
        } else {
            tmp_card.content?.push({
                id: "session_group" + (section != undefined ? "_section" : ""),
                type: "html",
                content:
                    "<b>" + getCurrentElement("session")
                    + " - " + getCurrentElement("group")
                    + (section != undefined ? " - " + getCurrentElement("section") : "")
                    + "</b>: (" + this.learning_session.number + " - " + this.learning_session.school_year + "/" + (this.learning_session.school_year % store.state.year_module + 1) // TODO (4): modificare tutti gli anni scolastici per la visualizzazione
                    + ") - " + this.group
                    + (section != undefined ? " - " + section : ""),
            });
        }
        if (this[`${language}_title`] != undefined) {
            tmp_card.content?.push({
                id: "title",
                type: "html",
                content: "<b>" + getCurrentElement("title") + "</b>: " + this[`${language}_title`],
            });
        }
        tmp_card.content?.push({
            id: "proposer_teacher",
            type: "html",
            content: "<b>" + getCurrentElement("proposer_teacher") + "</b>: " + this.teacher_name + " " + this.teacher_surname,
        });
        if (user == undefined || user.user != "student") {
            tmp_card.content?.push({
                id: "admin",
                type: "html",
                content: "<b>" + getCurrentElement("certifying_admin") + "</b>: " + this.admin_name + " " + this.admin_surname,
            });
        }

        return tmp_card;
    }
}

type CardListDescription = {
    title?: CustomElement,
    emptiness_message: CustomElement,
    cards_list: OrderedCardsList,
    on_click?: () => any
}

class AdminSummary {
    id: number;
    name: string;
    surname: string;

    constructor(summary: { id: number, name: string, surname: string }) {
        this.id = summary.id;
        this.name = summary.name;
        this.surname = summary.surname;
    }
}

type ImageDescriptor = {
    url: string,
    caption: string
}

type DefaultLink = {
    name: string,
    index: number,
}

type AlertInformation = { // TODO (9): trovare gli altri posti dove metterlo
    title: string,
    message: string,
    buttons: (string | AlertButton)[],
    inputs?: AlertInput[],
}

export { Language, Menu, MenuItem, BaseElement, ElementsList, OrdinaryClassProps, OrdinaryClassSummaryProps, OrdinaryClassSummary, LearningSessionProps, LearningSession, Enrollment, MinimumCourseProps, MinimizedCourse, CourseSummaryProps, CourseProps, CardElements, GeneralCardElements, CourseCardElements, LearningSessionStatus, LearningArea, CourseBase, CourseSummary, CurriculumCourse, Course, IconAlternatives, IconsList, StringIcon, RequestIcon, EventIcon, RequestString, EventString, RequestStringIcon, EventStringIcon, CardsList, OrderedCardsList, OrderedCardsGrid, RequestParameters, EventParameters, LinkParameters, ElementType, LinkType, ContentType, ColorType, ColorObject, GeneralSubElements, GeneralCardSubElements, SubElements, CardSubElements, SelectSubElements, EditorSubElements, CardsCommonElements, CardsListElements, CardsGridElements, Colors, Classes, CustomElement, GradeProps, Grade, GradesParameters, ProjectClassTeachingsResponse, CourseSectionsTeachings, StudentSummaryProps, StudentProps, StudentInformationProps, StudentSummary, Student, StudentInformation, LearningContextSummary, LearningContext, AnnouncementSummaryProps, Announcement, AnnouncementSummary, AnnouncementParameters, Gender, GenderKeys, AlternateList, TmpList, Progression, LoginInformation, UserType, LoginResponse, SuccessLoginResponse, UserProps, User, CourseModelProps, CourseModel, AccessObject, PropositionAccessObject, PropositionActivities, PropositionCharacteristics1, PropositionCriterions, PropositionDescription, PropositionExpectedLearningResults, PropositionCharacteristics2, PropositionSpecificInformation, PropositionTitles, PropositionTeacher, ModelProposition, GrowthAreaProps, GrowthArea, Pages, PropositionListsKeys, PropositionRequiredKeys, PropositionOptionalKeys, PropositionKeys, TeachingProps, Teaching, StudyAddress, AccessProposition, TeacherProps, TeacherSummary, Teacher, TeacherProposition, OpenToConstraint, AdminProjectClassProps, AdminProjectClass, CardListDescription, DefaultLink, AlertInformation }