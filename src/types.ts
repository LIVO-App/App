import { AxiosInstance, Method } from "axios";
import { Store } from "vuex";
import { executeLink, getActualLearningContext, getCurrentElement, getCurrentSchoolYear, getEnrollmentIcon, getGender, getIcon, getRagneString, hashCode, numberToSection, toDateString } from "./utils";

type Language = "italian" | "english";

type MenuTitle = {
    [key: string]: string
};

type MenuItem = {
    title: MenuTitle,
    url: string,
    iconRef: string
};

type Menu = {
    [key: string]: MenuItem[]
};

type BaseElement = {
    [key: string]: string //Da sistemare: mettere [key in keyof string as Language]
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
    english_displayed_name: string, //Da sistemare: sistemare visualizzazione nome classe
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
        return this.study_year + " " + this.address + (section ? " " + this.section : "") + (school_year ? " " + this.school_year : "");
    }

    toHighlightCard(store: Store<any>, section = true, school_year = false, selected = false): HiglightCardElements {
        return {
            id: this.toString(section, school_year),
            group: this.school_year,
            title: this.toString(section, school_year),
            selected: selected
        };
    }
}

/*class OrdinaryClass {
    annual_credits?: AnnualCredits
    english_displayed_name?: string //Da sistemare: sistemare visualizzazione nome classe
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

    toCard(store : Store<any>, path? : string) : GeneralCardElements {
        const language : Language = store.state.language;
        return {
            id: this.study_year + "_" + this.address,
            group: "",
            content: [{
                id: "title",
                type: "html",
                content: this.study_year + " " + this.address
            }],
            url: path,
            method: "get"
        }
    }
}*/

class Enrollment {
    private _enrollment: string
    private _editable: boolean
    constructor(pending: string, learning_block: LearningBlock, reference = new Date(), open_enrollment = false) {
        this._enrollment = pending;
        this._editable = learning_block.getStatus(reference) == LearningBlockStatus.FUTURE && open_enrollment;
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
    toString(store: Store<any>): string {
        return this.isPending() ? getCurrentElement(store, "pending")
            : (this.enrollment === true ? getCurrentElement(store, "enrolled")
                : getCurrentElement(store, "not_enrolled"))
    }
}

type CardElements = {
    id: string,
    group: any,
    url?: string,
    method?: Method
}

type GeneralCardElements = CardElements & {
    title?: string,
    subtitle?: string,
    side_button?: CustomElement,
    content: CustomElement[]
}

type CourseCardElements = CardElements & {
    credits: number,
    content: CustomElement[],
    enrollment: Enrollment
}

type HiglightCardElements = CardElements & {
    title: string,
    selected: boolean
}

type HiglightBlockCardElements = HiglightCardElements & {
    subtitle: string,
    status: LearningBlockStatus
}

enum LearningBlockStatus {
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

    toCard(store: Store<any>, path?: string): GeneralCardElements {
        const language: Language = store.state.language;
        return {
            id: "" + hashCode(this.italian_title),
            group: "",
            content: [{
                id: "title",
                type: "html",
                content: this[`${language}_title`]
            }, {
                id: "section",
                type: "string",
                content: getCurrentElement(store, "section") + ": " + this.section
            }],
            url: path,
            method: "get"
        }
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
    creation_date: Date,
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
        [key in keyof string as `${Language}_growth_area`]: string
    } & {
        [key in keyof string as `${Language}_description`]: string
    }

class CourseBase implements CourseBaseProps {
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
        this.learning_area_ref = courseObj.learning_area_ref;
        this.italian_title = courseObj.italian_title; //Da sistemare: sistemare lingue mettendo get
        this.english_title = courseObj.english_title;
    }
}

class CourseSummary extends CourseBase implements CourseSummaryProps {

    section?: string | undefined;
    pending: string;
    group: number;

    constructor(courseObj: CourseSummaryProps) {
        super(courseObj);
        this.section = courseObj.section;
        this.pending = courseObj.pending;
        this.group = courseObj.group;
    }

    toCard(store: Store<any>, learning_block: LearningBlock, path?: string, method?: Method, open_enrollment = false, reference = new Date()): CourseCardElements {
        const language: Language = store.state.language;
        const tmp_enrollment = new Enrollment(this.pending, learning_block, reference, open_enrollment);
        const card: CourseCardElements = {
            id: "" + this.id,
            group: this.group,
            credits: this.credits,
            enrollment: tmp_enrollment,
            content: [{
                id: this.id + "_credits",
                type: "string",
                content: getCurrentElement(store, "credits") + ": " + this.credits
            }, {
                id: this.id + "_title",
                type: "string",
                linkType: "event",
                content: {
                    event: "course_details",
                    data: {
                        title: this[`${language}_title`],
                        course_id: this.id,
                    },
                    text: this[`${language}_title`] + (this.section != null ? " - " + getCurrentElement(store, "section") + ": " + this.section : "")
                }
            }, {
                id: this.id + "_enrollment",
                type: "string",
                content: tmp_enrollment.toString(store)
            }]
        }
        if (path != undefined) {
            card.content.push({
                id: this.id + "_change_enrollment",
                type: "icon",
                linkType: "request",
                content: getEnrollmentIcon(store, tmp_enrollment, path, method)
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

    toCard(store: Store<any>, path?: string, method?: Method): GeneralCardElements { //Da sistemare: per visualizzazione tabella a telefono
        const language: Language = store.state.language;
        return {
            id: "" + this.id,
            group: "",
            content: [{
                id: this.id + "_title",
                type: "html",
                content: this[`${language}_title`]
            }],
            url: path,
            method: path != undefined ? (method ?? "get") : undefined
        }
    }

    toTableRow(store: Store<any>, block_id: number, student_id: number, teacher_id?: number): CustomElement[] {
        const language: Language = store.state.language;
        return [
            {
                id: this.id + "_title",
                type: "string",
                linkType: "event",
                content: {
                    event: "course_details",
                    data: {
                        title: this[`${language}_title`],
                        course_id: this.id,
                    },
                    text: this[`${language}_title`]
                }
            }, {
                id: this.id + "_section",
                type: "string",
                content: this.section
            }, {
                id: this.id + "_credits",
                type: "string",
                content: "" + this.credits
            }, {
                id: this.id + "_learning_area",
                type: "string",
                content: (this.learning_area_ref.data as { id: string }).id
            }, {
                id: this.id + "_gardes", //Da sistemare: mettere il controllo con future_course al passaggio a curriculum_v2
                type: "icon",
                linkType: "event",
                content: {
                    event: "grades",
                    data: {
                        title: this[`${language}_title`],
                        parameters: {
                            course_id: this.id,
                            block_id: block_id,
                            student_id: student_id,
                            teacher_id: teacher_id
                        }
                    },
                    icon: getIcon(store, "document_text")
                }
            }, {
                id: this.id + "_final_grade",
                type: "string",
                content: this.final_grade != null ? "" + this.final_grade : "-"
            }
        ];
    }
}

class Course extends CourseBase implements CourseProps {

    creation_date: Date;
    up_hours: number;
    min_students: number;
    max_students: number;
    proposer_teacher_ref: ResponseItem<{
        id: number
    }>;
    teacher_name: string;
    teacher_surname: string;
    certifying_admin_ref: ResponseItem<{
        id: number
    }>;
    admin_name: string;
    admin_surname: string;
    admin_confirmation: string;
    italian_expected_learning_results: string;
    english_expected_learning_results: string;
    italian_criterions: string;
    english_criterions: string;
    italian_activities: string;
    english_activities: string;
    italian_learning_area: string;
    english_learning_area: string;
    italian_growth_area: string;
    english_growth_area: string;
    italian_description: string;
    english_description: string;
    //Da sistemare: Aggiungere opento, teachings e learning_context

    constructor(store: Store<any>, courseObj: CourseProps) {
        super(courseObj);
        this.creation_date = new Date(courseObj.creation_date);
        this.up_hours = courseObj.up_hours;
        this.min_students = courseObj.min_students;
        this.max_students = courseObj.max_students;
        this.proposer_teacher_ref = courseObj.proposer_teacher_ref;
        this.teacher_name = courseObj.teacher_name;
        this.teacher_surname = courseObj.teacher_surname;
        this.certifying_admin_ref = courseObj.certifying_admin_ref;
        this.admin_name = courseObj.admin_name;
        this.admin_surname = courseObj.admin_surname;
        this.admin_confirmation = courseObj.admin_confirmation;
        this.italian_expected_learning_results = courseObj.italian_expected_learning_results;
        this.english_expected_learning_results = courseObj.english_expected_learning_results;
        this.italian_criterions = courseObj.italian_criterions;
        this.english_criterions = courseObj.english_criterions;
        this.italian_activities = courseObj.italian_activities;
        this.english_activities = courseObj.english_activities;
        this.italian_learning_area = courseObj.italian_learning_area;
        this.english_learning_area = courseObj.english_learning_area;
        this.italian_growth_area = courseObj.italian_growth_area;
        this.english_growth_area = courseObj.english_growth_area;
        this.italian_description = courseObj.italian_description;
        this.english_description = courseObj.english_description;
    }

    toCard(store: Store<any>): GeneralCardElements {

        const language: Language = store.state.language;
        const hours_per_credit: number = store.state.hours_per_credit;
        return {
            id: "" + this.id,
            group: "",
            content: [{
                id: this.id + "_description",
                type: "html",
                content: this[`${language}_description`]
            }, {
                id: this.id + "_expected_learning_resuts_title",
                type: "title",
                content: getCurrentElement(store, "expected_learning_results").toUpperCase()
            }, {
                id: this.id + "_expected_learning_resuts",
                type: "html",
                content: this[`${language}_expected_learning_results`]
            }, {
                id: this.id + "_criterions_title",
                type: "title",
                content: getCurrentElement(store, "criterions").toUpperCase()
            }, {
                id: this.id + "_criterions",
                type: "html",
                content: this[`${language}_criterions`]
            }, {
                id: this.id + "_activities_title",
                type: "title",
                content: getCurrentElement(store, "activities").toUpperCase()
            }, {
                id: this.id + "_activities",
                type: "html",
                content: this[`${language}_activities`]
            }, {
                id: this.id + "_technical_information",
                type: "title",
                content: getCurrentElement(store, "technical_information").toUpperCase()
            }, {
                id: this.id + "_learning_area",
                type: "html",
                content: "<b>" + getCurrentElement(store, "learning_area") + "</b>: " + this[`${language}_learning_area`]
            }, {
                id: this.id + "_growth_area",
                type: "html",
                content: "<b>" + getCurrentElement(store, "growth_area") + "</b>: " + this[`${language}_growth_area`]
            }, {
                id: this.id + "_credits",
                type: "html",
                content: "<b>" + getCurrentElement(store, "credits") + "</b>: " + this.credits + "(" + (this.credits * hours_per_credit) + " " + getCurrentElement(store, "hours") + ")"
            }, {
                id: this.id + "_up_hours",
                type: "html",
                content: "<b>" + getCurrentElement(store, "up_hours") + "</b>: " + this.up_hours + " " + getCurrentElement(store, "hours")
            }, {
                id: this.id + "_creation_date",
                type: "html",
                content: "<b>" + getCurrentElement(store, "creation_date") + "</b>: " + this.creation_date.toLocaleDateString("en-GB")
            }, {
                id: this.id + "_students_number",
                type: "html",
                content: "<b>" + getCurrentElement(store, "students_number") + "</b>: " + this.min_students + " - " + this.max_students
            }, {
                id: this.id + "_proposer_teacher",
                type: "html",
                content: "<b>" + getCurrentElement(store, "proposer_teacher") + "</b>: " + this.teacher_name + this.teacher_surname
            }/*,{
                id: this.id + "_certifying_admin",
                type: "html",
                content: "<b>" + getCurrentElement(store,"certifying_admin") + "</b>: " + this.admin_name + this.admin_surname
            }*/] //Da sistemare: limitare a teacher e admin
        }
    }
}

type LearningBlockProps = {
    id: number;
    number: number;
    school_year: number;
    start: string;
    end: string;
    num_groups: number;
}

class LearningBlock implements LearningBlockProps { // Da sistemare: aggiungi numero blocchi

    id: number;
    number: number;
    school_year: number;
    start: string;
    end: string;
    num_groups: number;

    constructor(blockObj: LearningBlockProps) {
        this.id = blockObj.id;
        this.number = blockObj.number;
        this.school_year = blockObj.school_year;
        this.start = blockObj.start;
        this.end = blockObj.end;
        this.num_groups = blockObj.num_groups;
    }

    getStatus(reference = new Date()) { // future [TDB] upcoming [SD] current [ED] completed
        const startDate = new Date(this.start);
        const endDate = new Date(this.end);
        const tenDaysBefore = new Date(startDate);
        tenDaysBefore.setDate(tenDaysBefore.getDate() - 10);

        return reference < tenDaysBefore ? LearningBlockStatus.FUTURE
            : reference >= tenDaysBefore && reference < startDate ? LearningBlockStatus.UPCOMING
                : reference >= startDate && reference <= endDate ? LearningBlockStatus.CURRENT
                    : LearningBlockStatus.COMPLETED;
    }

    /*async getDividedCourseList(block: LearningBlock, learning_areas: LearningArea[], $axios: AxiosInstance, store : Store<any>) {
        const language = store.state.language
        const courses : CourseSummary[] = (await $axios.get("/v1/courses?student_id=" + user_id + "&block_id=" + block.id)).data.data;
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

    async getBlockList($axios: AxiosInstance, store: Store<any>, learning_context?: LearningContextSummary, reference = new Date(), credits?: boolean, courses_list?: boolean): Promise<string> {

        const language: Language = store.state.language;
        const user = User.getLoggedUser() as User;

        const status = this.getStatus(reference);
        const put_credits = credits ?? status == LearningBlockStatus.FUTURE;
        const put_courses_list = courses_list ?? (status == LearningBlockStatus.CURRENT || status == LearningBlockStatus.UPCOMING);
        const actual_learning_context = getActualLearningContext(store, learning_context);
        const courses: {
            [learning_area_id: string]: CourseSummary[]
        } = {};
        const learning_areas = await executeLink($axios, "/v1/learning_areas?all_data=true&block_id=" + this.id + "&credits=" + put_credits,
            response => response.data.data,
            () => []);

        let courses_presence: boolean;
        let block_list = put_courses_list ? "" : "<ul>";

        await executeLink($axios, "/v1/courses?student_id=" + user.id + "&context_id=" + actual_learning_context.id + "&block_id=" + this.id,
            response => (response.data.data as CourseSummaryProps[]).map(x => {
                const course = new CourseSummary(x);
                const learning_area_id = (course.learning_area_ref.data as { id: string }).id;
                if (courses[learning_area_id] == undefined) {
                    courses[learning_area_id] = [];
                }
                courses[learning_area_id].push(course);
            }));

        for (const area of learning_areas) {
            block_list += (put_courses_list ? "<label>" : "<li>") + area[`${store.state.language as Language}_title`] + ": " + (put_credits ? (courses[area.id] != undefined ? courses[area.id].filter(course => course.pending == "true").reduce((pv, cv) => pv + cv.credits, 0) : 0) + "/" + area.credits : "") + (put_courses_list ? "</label>" : "</li>");
            if (put_courses_list) {
                courses_presence = courses[area.id] != undefined && courses[area.id].length > 0;
                block_list += courses_presence ? "<ul>" : "<br />";
                if (courses_presence) {
                    for (const course of courses[area.id]) {
                        if (course.pending == "true") {
                            block_list += "<li>"
                                + course[`${language}_title`]
                                + ((status == LearningBlockStatus.CURRENT || status == LearningBlockStatus.UPCOMING) && course.section != null
                                    ? " - " + getCurrentElement(store, "section") + " " + course.section : "")
                                + "</li>"; //Da sistemare: vedere se sezione è fissa o meno
                        }
                    }
                    block_list += "</ul>";
                }
            }
        }
        block_list += (put_courses_list ? "" : "</ul>");


        return block_list;
    }

    async getInscribedCredits($axios: AxiosInstance, store: Store<any>, learning_context_id: string): Promise<number> {

        const user = User.getLoggedUser() as User;

        return await executeLink($axios, "/v1/courses?student_id=" + user.id + "&block_id=" + this.id + "&context_id=" + learning_context_id,
            response => response.data.data.reduce((a: number, b: CourseSummaryProps) => a + (b.pending == "true" ? b.credits : 0), 0),
            () => 0);
    }

    async toCard($axios: AxiosInstance, store: Store<any>, learning_context?: LearningContextSummary, credits?: boolean, courses_list?: boolean, reference = new Date()): Promise<GeneralCardElements> {

        const status = this.getStatus(reference);
        const put_credits = credits ?? status == LearningBlockStatus.FUTURE;
        const actual_learning_context: LearningContextSummary = getActualLearningContext(store, learning_context);
        const tmp_element: GeneralCardElements = {
            id: "" + this.id,
            group: this.school_year,
            title: getCurrentElement(store, "block") + " " + this.number,
            subtitle: getRagneString(new Date(this.start), new Date(this.end)),
            content: [{
                id: "" + this.id,
                type: "html",
                content: status != LearningBlockStatus.COMPLETED || credits != undefined || courses_list != undefined ?
                    (put_credits ? "<label>" + getCurrentElement(store, "constraints") + ":"
                        + (actual_learning_context.credits != null ? " " + (await this.getInscribedCredits($axios, store, actual_learning_context.id)) + "/" + actual_learning_context.credits : "") + "</label>" : "")
                    + (actual_learning_context.credits == null ? (await this.getBlockList($axios, store, actual_learning_context, reference, credits, courses_list)) : "")
                    : ""
            }],
            url: "learning_blocks/" + this.id,
            method: "get"
        };

        return tmp_element;
    }

    toHighlightCard(store: Store<any>, selected = false, reference = new Date()): HiglightBlockCardElements {

        const status = this.getStatus(reference);
        const tmp_element: HiglightBlockCardElements = {
            id: "" + this.id,
            group: this.school_year,
            title: getCurrentElement(store, "block") + " " + this.number,
            subtitle: getRagneString(new Date(this.start), new Date(this.end)),
            status: status,
            selected: selected
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

type RequestStringIcon = RequestParameters & {
    text: string,
    icon: IconAlternatives
}

type EventStringIcon = EventParameters & {
    text: string,
    icon: IconAlternatives
}

type Role = "" | "student" | "teacher" | "admin";

type CardsList<T = CardElements> = {
    [key: string | number]: T[]
}

type OrderedCardsList<T = CardElements> = {
    order: {
        key: string | number,
        title: string | number
    }[],
    cards: CardsList<T>
}

type ElementType = "string" | "html" | "icon" | "title" | "string_icon";

type LinkType = "request" | "event";

type CustomElement = {
    id: string,
    type: ElementType,
    linkType?: LinkType,
    content: string | IconAlternatives | RequestIcon | EventIcon | RequestString | EventString | RequestStringIcon | EventStringIcon
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

    toCard(store: Store<any>): GeneralCardElements { //Da sistemare: per visualizzazione tabella a telefono
        const language: Language = store.state.language;
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

    toTableRow(store: Store<any>): CustomElement[] {
        const language: Language = store.state.language;
        return [{
            id: this.id + "_description",
            type: "html",
            content: this[`${language}_description`] + (this.final ? " <b>[" + getCurrentElement(store, "final") + "]</b>" : "") //Da sistemare: visualizzazione migliore voto finale
        }, {
            id: this.id + "_pubblication",
            type: "string",
            content: this.publication.toLocaleDateString("en-GB")
        }, {
            id: this.id + "_value",
            type: "string",
            content: "" + this.grade
        }]
    }
}

type GradesParameters = {
    course_id: number,
    block_id: number,
    student_id: number,
    teacher_id?: number
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

    toCard(store: Store<any>, group: string, learning_block: string): GeneralCardElements { //Da sistemare: per visualizzazione tabella a telefono
        const language: Language = store.state.language;
        return {
            id: "" + this.id,
            group: group,
            content: [{
                id: this.id + "_title",
                type: "title",
                content: this[`${language}_title`]
            }, {
                id: this.id + "_sections",
                type: "string",
                content: getCurrentElement(store, "sections") + ": " + Array.from(this.sections).join(", ")
            }, {
                id: this.id + "_my_associated_teachings",
                type: "string",
                content: getCurrentElement(store, "my_associated_teachings") + ": " + Array.from(this.my_teaching_refs).join(", ")
            }],
            url: "project_courses/" + this.id + "/" + learning_block,
            method: "get"
        }
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

    toCard(store: Store<any>, path: string): GeneralCardElements {
        store.state //dummy use
        return {
            id: "" + this.id,
            group: "",
            content: [{
                id: this.id + "_name_surname",
                type: "string",
                content: this.name + " " + this.surname
            }],
            url: path,
            method: "get"
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

    toCard(store: Store<any>): GeneralCardElements { // Da sistemare: per visualizzazione tabella a telefono
        store.state //dummy use
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

    toTableRow(store: Store<any>, course_id: string, block_id: string, teacher_id: number, final_grade?: Grade): CustomElement[] {
        const row_to_return: CustomElement[] = [{ //Da sistemare: rendere cliccabile
            id: this.id + "_name_surname",
            type: "string",
            content: this.name + " " + this.surname
        }];
        const tmp_row: CustomElement[] = [{
            id: this.id + "_class",
            type: "string",
            content: this.ordinary_class.toString()
        }, {
            id: this.id + "_gardes", //Da sistemare: Mettere il controllo con future_course al passaggio a curriculum_v2
            type: "icon",
            linkType: "event",
            content: {
                event: "grades",
                data: {
                    title: this.name + " " + this.surname,
                    parameters: {
                        course_id: course_id,
                        block_id: block_id,
                        student_id: this.id,
                        teacher_id: teacher_id
                    }
                },
                icon: getIcon(store, "document_text")
            }
        }, {
            id: this.id + "_final_grade",
            type: "string",
            content: final_grade != undefined ? "" + final_grade.grade : "-"
        }];

        if (this.learning_context_id != undefined) {
            row_to_return.push({
                id: this.id + "_learning_context",
                type: "string",
                content: this.learning_context_id
            })
        }

        return row_to_return.concat(tmp_row);
    }
}

class StudentInformation extends StudentSummary {

    username: string;
    gender: Gender;
    birth_date: Date;
    address: string;
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

    toCard(store: Store<any>): GeneralCardElements {
        return {
            id: "" + this.username,
            title: this.username,
            group: "",
            content: [{
                id: this.id + "_name",
                type: "string",
                content: getCurrentElement(store, "name") + ": " + this.name
            }, {
                id: this.id + "_surname",
                type: "string",
                content: getCurrentElement(store, "surname") + ": " + this.surname
            }, {
                id: this.id + "_gender",
                type: "string",
                content: getCurrentElement(store, "gender") + ": " + getGender(store, this.gender)
            }, {
                id: this.id + "_birth_date",
                type: "string",
                content: getCurrentElement(store, "birth_date") + ": " + toDateString(this.birth_date)
            }, {
                id: this.id + "_address",
                type: "string",
                content: getCurrentElement(store, "address") + ": " + this.address
            }, {
                id: this.id + "_email",
                type: "string",
                content: getCurrentElement(store, "email") + ": " + this.email
            }, {
                id: this.id + "_class",
                type: "string",
                content: getCurrentElement(store, "class") + ": " + this.ordinary_class.toString()
            }]
        }
    }
}

type LearningContextSummary = {
    id: string
    credits?: number | null
}

type LearningContext = LearningContextSummary & IdTitleDescription<string>;

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

    toCard(store: Store<any>): GeneralCardElements {
        const language: Language = store.state.language;
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
                content: getCurrentElement(store, "publishment") + ": " + toDateString(this.publishment)
            }]
        }
    }
}

type AnnouncementParameters = {
    course_id: number,
    block_id: number,
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

type RemainingCredits<T> = {
    [key: string]: TmpList<T> | T
};

type TmpList<T> = {
    [key: string]: T
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

type FailLoginResponse = LoginResponse & {
    user: boolean, // Da sistemare: potrebbe essere un problema di sicurezza
    password: boolean,
}

type UserProps = {
    id: number,
    username: string,
    token: string,
    user: UserType
}

class User implements UserProps {

    id: number;
    username: string;
    token: string;
    user: UserType;

    constructor(props: UserProps) {
        this.id = props.id;
        this.username = props.username;
        this.token = props.token;
        this.user = props.user;
    }

    static getProperties() {
        return ["id", "username", "token", "user"];
    }

    static getLoggedUser() {

        const session = window.sessionStorage;

        if (session.getItem("id") != undefined) {
            return new User({
                id: parseInt(session.getItem("id") as string),
                username: session.getItem("username") as string,
                token: session.getItem("token") as string,
                user: session.getItem("user") as UserType
            });
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
    project_class_confirmation_date: string,
    project_class_to_be_modified: boolean | null,
    course_confirmation_date: string,
    course_to_be_modified: boolean | null
} & {
        [key in keyof string as `${Language}_title`]: string
    }

class CourseModel {

    id: number;
    italian_title: string;
    english_title: string;
    creation_school_year: number;
    project_class_confirmation_date: Date;
    project_class_to_be_modified: boolean | null;
    course_confirmation_date: Date;
    course_to_be_modified: boolean | null;

    constructor(props: CourseModelProps) {
        this.id = (props.course_ref.data as { id: number }).id;
        this.italian_title = props.italian_title;
        this.english_title = props.english_title;
        this.creation_school_year = props.creation_school_year;
        this.project_class_confirmation_date = new Date(props.project_class_confirmation_date);
        this.project_class_to_be_modified = props.project_class_to_be_modified;
        this.course_confirmation_date = new Date(props.course_confirmation_date);
        this.course_to_be_modified = props.course_to_be_modified;
    }

    toString(store: Store<any>) {
        const language: Language = store.state.language;
        return this[`${language}_title`] + " - " + this.creation_school_year;
    }
}

type PagesType = "editor";

type Pages = "course_id" | "title" | "characteristics" | "students_distribution" | "description" | "expected_learning_results" | "criterions" | "activities" | "access_object" | "teacher_list";

type PropositionTitles = {
    [key in keyof string as `${Language}_title`]: string
};

type PropositionCharacteristics = {
    up_hours: number,
    credits: number,
    area_id: string,
    growth_id: number,
    block_id: number,
    class_group: number
};

type PropositionStudentsDistribution = { // Da sistemare: trovaqre nome comune
    num_section: number,
    min_students: number,
    max_students: number,
    teaching_list: string[]
}

type PropositionDescriptions = {
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

class ModelProposition {

    [key: string]: any;

    private _course_id: number;
    private _title: PropositionTitles;
    private _characteristics: PropositionCharacteristics;
    private _students_distribution: PropositionStudentsDistribution;
    private _description: PropositionDescriptions;
    private _expected_learning_results: PropositionExpectedLearningResults;
    private _criterions: PropositionCriterions;
    private _activities: PropositionActivities;
    private _access_object: PropositionAccessObject;
    private _teacher_list: PropositionTeacher[];
    private remaining: Pages[];

    constructor() {
        this._course_id = 0;
        this._title = {
            italian_title: "",
            english_title: ""
        };
        this._characteristics = {
            up_hours: 0,
            credits: 0,
            area_id: "",
            growth_id: -1,
            block_id: -1,
            class_group: -1
        };
        this._students_distribution = {
            num_section: 0,
            min_students: 0,
            max_students: 0,
            teaching_list: []
        };
        this._description = {
            italian_descr: "",
            english_descr: ""
        };
        this._expected_learning_results = {
            italian_exp_l: "",
            english_exp_l: ""
        };
        this._criterions = {
            italian_cri: "",
            english_cri: ""
        };
        this._activities = {
            italian_act: "",
            english_act: ""
        };
        this._access_object = {};
        this._teacher_list = [];

        this.remaining = ["course_id", "title", "characteristics", "description", "expected_learning_results", "criterions", "activities", "access_object", "teacher_list"];
    }

    public get course_id() {
        return this._course_id;
    }
    public set course_id(value: number) {
        this._course_id = value;
        this.remaining = this.remaining.filter(a => a != "course_id");
    }

    public get title() {
        return this._title;
    }
    public set title(value: PropositionTitles) {
        this._title = value;
        this.remaining = this.remaining.filter(a => a != "title");
    }

    public get characteristics() {
        return this._characteristics;
    }
    public set characteristics(value: PropositionCharacteristics) {
        this._characteristics = value;
        this.remaining = this.remaining.filter(a => a != "characteristics");
    }

    public get students_distribution() {
        return this._students_distribution;
    }
    public set students_distribution(value: PropositionStudentsDistribution) {
        this._students_distribution = value;
        this.remaining = this.remaining.filter(a => a != "students_distribution");
    }

    public get description() {
        return this._description;
    }
    public set description(value: PropositionDescriptions) {
        this._description = value;
        this.remaining = this.remaining.filter(a => a != "description");
    }

    public get expected_learning_results() {
        return this._expected_learning_results;
    }
    public set expected_learning_results(value: PropositionExpectedLearningResults) {
        this._expected_learning_results = value;
        this.remaining = this.remaining.filter(a => a != "expected_learning_results");
    }

    public get criterions() {
        return this._criterions;
    }
    public set criterions(value: PropositionCriterions) {
        this._criterions = value;
        this.remaining = this.remaining.filter(a => a != "criterions");
    }

    public get activities() {
        return this._activities;
    }
    public set activities(value: PropositionActivities) {
        this._activities = value;
        this.remaining = this.remaining.filter(a => a != "activities");
    }

    public get access_object() {
        return this._access_object;
    }
    public set access_object(value: PropositionAccessObject) {
        this._access_object = value;
        this.remaining = this.remaining.filter(a => a != "access_object");
    }

    public get teacher_list() {
        return this._teacher_list;
    }
    public set teacher_list(list: PropositionTeacher[]) {
        this._teacher_list = list.map(a => {
            return {
                teacher_id: a.teacher_id,
                main: /*!!*/a.main ? true : false,
                sections: a.sections
            }
        });
        this.remaining = this.remaining.filter(a => a != "teacher_list");
    }

    toProposition() {
        const proposition: {
            [key: string]: any
        } = {};
        const keys = Object.keys(this).filter(a => a != "id" && a != "remaining");

        for (const page of keys) {
            for (const key of page) {
                proposition[key] = this[page][key];
            }
        }

        return proposition;
    }

    isComplete() {
        return this.remaining.length == 0;
    }

    getRemaining() {
        return this.remaining;
    }

    getPages(type?: PagesType): Pages[] {
        switch (type) {
            case undefined:
                return ["title", "characteristics", "students_distribution", "description", "expected_learning_results", "criterions", "activities", "access_object", "teacher_list"];
            case "editor":
                return ["description", "expected_learning_results", "criterions", "activities"];
        }
    }
}

type IdTitleDescription<T> = {
    id: T,
} & {
        [key in keyof string as `${Language}_title`]: string
    } & {
        [key in keyof string as `${Language}_description`]?: string // Da sistemare: vedere descrizioni che possono essere null
    }

type GrowthArea = IdTitleDescription<number>;

type TeachingProps = IdTitleDescription<string>;

class Teaching implements TeachingProps {
    id: string;
    italian_title: string;
    english_title: string;
    italian_description?: string;
    english_description?: string;

    constructor(props: TeachingProps) {
        this.id = props.id;
        this.italian_title = props.italian_title;
        this.english_title = props.english_title;
        this.italian_description = props.italian_description;
        this.english_description = props.english_description;
    }

    toCard(store: Store<any>): GeneralCardElements {
        const language: Language = store.state.language;
        return {
            id: this.id,
            group: "",
            side_button: {
                id: this.id + "_remove",
                type: "icon",
                linkType: "event",
                content: {
                    event: "remove",
                    data: {
                        id: this.id,
                    },
                    icon: getIcon(store, "close"),
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

type StudyAddress = IdTitleDescription<string> & {
    max_classes: number
};

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

    toCard(store: Store<any>, learning_context_id: string): GeneralCardElements {
        const language: Language = store.state.language;

        return {
            id: this.study_address.id + "_" + this.study_year,
            group: learning_context_id,
            side_button: {
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
                    icon: getIcon(store, "close"),
                },
            },
            content: [
                {
                    id: "class",
                    type: "string",
                    content: this.study_year + " " + this.study_address[`${language}_title`],
                },
                {
                    id: "presidium",
                    type: "string",
                    content: getCurrentElement(store, "presidium") + ": " + this.presidium,
                },
                {
                    id: "main_study_year",
                    type: "string",
                    content: getCurrentElement(store, "main_study_year") + ": " + this.main_study_year,
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

class Teacher {
    id: number;
    cf: string;
    username: string;
    name: string;
    surname: string;
    gender: Gender;
    birth_date: Date;
    address: string;
    email: string;

    constructor(teacher: TeacherProps) {
        this.id = teacher.id;
        this.cf = teacher.cf;
        this.username = teacher.username;
        this.name = teacher.name;
        this.surname = teacher.surname;
        this.gender = teacher.gender == "M" || teacher.gender == "F" ? teacher.gender : "O";
        this.birth_date = new Date(teacher.birth_date);
        this.address = teacher.address;
        this.email = teacher.email;
    }
}

class TeacherProposition {
    teacher: Teacher;
    main: boolean;
    sections: string[];

    constructor(teacher: Teacher, main: boolean, sections: boolean[]) {
        this.teacher = teacher;
        this.main = main;
        this.sections = [];
        for (const key in sections) {
            if (sections[key]) {
                this.sections.push(numberToSection(parseInt(key)));
            }
        }
    }

    toCard(store: Store<any>): GeneralCardElements {
        return {
            id: "" + this.teacher.id,
            group: "",
            side_button: {
                id: this.teacher.id + "_remove",
                type: "icon",
                linkType: "event",
                content: {
                    event: "remove",
                    data: {
                        id: this.teacher.id,
                    },
                    icon: getIcon(store, "close"),
                },
            },
            content: [
                {
                    id: "name",
                    type: "string_icon",
                    linkType: "event",
                    content: {
                        event: "info",
                        data: {
                            teacher_id: this.teacher.id,
                        },
                        icon: getIcon(store, "information_circle"),
                        text: this.teacher.name + " " + this.teacher.surname + (this.main ? " [" + getCurrentElement(store, "main_teacher") + "]" : "")
                    },
                },
                {
                    id: "sections",
                    type: "string",
                    content: getCurrentElement(store, "sections") + ": " + this.sections.join(", "),
                },
            ],
        }
    }

    toTeacherObj(): PropositionTeacher {
        return {
            teacher_id: this.teacher.id,
            main: this.main,
            sections: this.sections
        }
    }
}

export { Language, Menu, MenuItem, MenuTitle, BaseElement, ElementsList, OrdinaryClassProps, OrdinaryClassSummaryProps, OrdinaryClassSummary, LearningBlockProps, LearningBlock, Enrollment, MinimumCourseProps, MinimizedCourse, CourseSummaryProps, CourseProps, CardElements, GeneralCardElements, CourseCardElements, HiglightCardElements, HiglightBlockCardElements, LearningBlockStatus, LearningArea, CourseBase, CourseSummary, CurriculumCourse, Course, IconAlternatives, IconsList, RequestIcon, EventIcon, RequestString, EventString, RequestStringIcon, EventStringIcon, CardsList, Role, OrderedCardsList, CustomElement, GradeProps, Grade, GradesParameters, ProjectClassTeachingsResponse, CourseSectionsTeachings, StudentSummaryProps, StudentProps, StudentInformationProps, StudentSummary, Student, StudentInformation, LearningContextSummary, LearningContext, AnnouncementSummaryProps, Announcement, AnnouncementSummary, AnnouncementParameters, Gender, GenderKeys, RemainingCredits, TmpList, Progression, LoginInformation, UserType, LoginResponse, SuccessLoginResponse, FailLoginResponse, UserProps, User, CourseModelProps, CourseModel, PropositionAccessObject, PropositionActivities, PropositionCharacteristics, PropositionCriterions, PropositionDescriptions, PropositionExpectedLearningResults, PropositionStudentsDistribution, PropositionTitles, PropositionTeacher, ModelProposition, GrowthArea, Pages, TeachingProps, Teaching, StudyAddress, AccessProposition, TeacherProps, Teacher, TeacherProposition }