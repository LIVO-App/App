import { AxiosInstance, Method } from "axios";
import { Store } from "vuex";
import { executeLink, getActualLearningContext, getCurrentElement, getEnrollmentIcon, getIcon, getRagneString, hashCode, toDateString } from "./utils";

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

type OrdinaryClass = {
    annual_credits_ref: ResponseItem<{
        study_year: number,
        study_address: string,
        definition_year: number
    }>,
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

type OrdinaryClassSummary = {
    study_year: number,
    address: string,
    section: string
}

class Enrollment {
    private _enrollment: string
    private _editable: boolean
    constructor(pending : string, learning_block : LearningBlock, reference = new Date(), open_enrollment = false) {
        this._enrollment = pending;
        this._editable = learning_block.getStatus(reference) == LearningBlockStatus.FUTURE && open_enrollment;
    }
    get enrollment() : Date | boolean {
        if (this._enrollment === "true") {
            return true;
        } else if (this._enrollment === "false") {
            return false;
        } else {
            return new Date(this._enrollment);
        }
    }
    set enrollment(enrollment : Date | boolean) {
        if (enrollment instanceof Date) {
            this._enrollment = enrollment.toISOString();
        } else {
            this._enrollment = enrollment ? "true" : "false";
        }
    }
    get editable() : boolean {
        return this._editable;
    }
    set editable(editable : boolean) {
        this._editable = editable;
    }
    isPending() : boolean {
        return this._enrollment !== "true" && this._enrollment !== "false";
    }
    getChangingMethod() : Method {
        return this.enrollment ? "delete" : "post";
    }
    toString(store : Store<any>) : string {
        return this.isPending() ? getCurrentElement(store,"pending")
                                : (this.enrollment === true ? getCurrentElement(store,"enrolled")
                                                            : getCurrentElement(store,"not_enrolled"))
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
    content: CustomElement[]
}

type CourseCardElements = CardElements & {
    credits: number,
    content: CustomElement[],
    enrollment: Enrollment
}

type HiglightBlockCardElements = CardElements & {
    title: string,
    subtitle: string,
    status: LearningBlockStatus,
    selected: boolean
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

    constructor(course : MinimumCourseProps) {
        this.id = course.id;
        this.section = course.section;
        this.italian_title = course.italian_title;
        this.english_title = course.english_title;
    }

    toCard(store : Store<any>, path? : string) : GeneralCardElements {
        const language : Language = store.state.language;
        return {
            id: "" + hashCode(this.italian_title),
            group: "",
            content: [{
                id: "title",
                type: "html",
                content: this[`${language}_title`]
            },{
                id: "section",
                type: "string",
                content: getCurrentElement(store,"section") + ": " + this.section
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
    pending: string
}

type CurriculumCourseProps = CourseBaseProps & {
    section: string,
    final_grade: GradeProps | null,
    learning_context_id: string,
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
    id : number;
    credits : number;
    learning_area_ref : ResponseItem<{
        id: string
    }>;
    italian_title : string;
    english_title : string;

    constructor(courseObj : CourseBaseProps) {
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

    constructor(courseObj : CourseSummaryProps) {
        super(courseObj);
        this.section = courseObj.section;
        this.pending = courseObj.pending;
    }

    toCard(store : Store<any>, learning_block : LearningBlock, path? : string, method? : Method, open_enrollment = false, reference = new Date()) : CourseCardElements {
        const language : Language = store.state.language;
        const tmp_enrollment = new Enrollment(this.pending,learning_block,reference,open_enrollment);
        const card : CourseCardElements = {
            id: "" + this.id,
            group: "",
            credits: this.credits,
            content: [{
                id: this.id + "_credits",
                type: "string",
                content: getCurrentElement(store,"credits") + ": " + this.credits
            },{
                id: this.id + "_title",
                type: "string",
                linkType: "event",
                content: {
                    event: "course_details",
                    data: {
                        title: this[`${language}_title`],
                        course_id: this.id,
                    },
                    text: this[`${language}_title`] + (this.section != null ? " - " + getCurrentElement(store,"section") + ": " + this.section : "")
                }
            },{
                id: this.id + "_enrollment",
                type: "string",
                content: tmp_enrollment.toString(store)
            }],
            enrollment: tmp_enrollment
        }
        if (path != undefined) {
            card.content.push({
                id: this.id + "_change_enrollment",
                type: "icon",
                linkType: "request",
                content: getEnrollmentIcon(store,tmp_enrollment,path,method)
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

    constructor(courseObj : CurriculumCourseProps) {
        super(courseObj);
        this.section = courseObj.section;
        this.final_grade = courseObj.final_grade;
        this.learning_context_id = courseObj.learning_context_id;
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

    toCard(store : Store<any>, path? : string, method? : Method) : GeneralCardElements { //Da sistemare: per visualizzazione tabella a telefono
        const language : Language = store.state.language;
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

    toTableRow(store : Store<any>, block_id : number, student_id : number, teacher_id? : number) : CustomElement[] {
        const language : Language = store.state.language;
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
            },{
                id: this.id + "_section",
                type: "string",
                content: this.section
            },{
                id: this.id + "_credits",
                type: "string",
                content: "" + this.credits
            },{
                id: this.id + "_learning_area",
                type: "string",
                content: (this.learning_area_ref.data as {id:string}).id
            },{
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
                    icon: getIcon(store,"document_text")
                }
            },{
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

    constructor(store : Store<any>, courseObj : CourseProps) {
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

    toCard(store : Store<any>) : GeneralCardElements {

        const language : Language = store.state.language;
        const hours_per_credit : number = store.state.hours_per_credit;
        return {
            id: "" + this.id,
            group: "",
            content: [{
                id: this.id + "_description",
                type: "html",
                content: this[`${language}_description`]
            },{
                id: this.id + "_expected_learning_resuts_title",
                type: "title",
                content: getCurrentElement(store,"expected_learning_results").toUpperCase()
            },{
                id: this.id + "_expected_learning_resuts",
                type: "html",
                content: this[`${language}_expected_learning_results`]
            },{
                id: this.id + "_criterions_title",
                type: "title",
                content: getCurrentElement(store,"criterions").toUpperCase()
            },{
                id: this.id + "_criterions",
                type: "html",
                content: this[`${language}_criterions`]
            },{
                id: this.id + "_activities_title",
                type: "title",
                content: getCurrentElement(store,"activities").toUpperCase()
            },{
                id: this.id + "_activities",
                type: "html",
                content: this[`${language}_activities`]
            },{
                id: this.id + "_technical_information",
                type: "title",
                content: getCurrentElement(store,"technical_information").toUpperCase()
            },{
                id: this.id + "_learning_area",
                type: "html",
                content: "<b>" + getCurrentElement(store,"learning_area") + "</b>: " + this[`${language}_learning_area`]
            },{
                id: this.id + "_growth_area",
                type: "html",
                content: "<b>" + getCurrentElement(store,"growth_area") + "</b>: " + this[`${language}_growth_area`]
            },{
                id: this.id + "_credits",
                type: "html",
                content: "<b>" + getCurrentElement(store,"credits") + "</b>: " + this.credits + "(" + (this.credits * hours_per_credit) + " " + getCurrentElement(store,"hours") + ")"
            },{
                id: this.id + "_up_hours",
                type: "html",
                content: "<b>" + getCurrentElement(store,"up_hours") + "</b>: " + this.up_hours + " " + getCurrentElement(store,"hours")
            },{
                id: this.id + "_creation_date",
                type: "html",
                content: "<b>" + getCurrentElement(store,"creation_date") + "</b>: " + this.creation_date.toLocaleDateString("en-GB")
            },{
                id: this.id + "_students_number",
                type: "html",
                content: "<b>" + getCurrentElement(store,"students_number") + "</b>: " + this.min_students + " - " + this.max_students
            },{
                id: this.id + "_proposer_teacher",
                type: "html",
                content: "<b>" + getCurrentElement(store,"proposer_teacher") + "</b>: " + this.teacher_name + this.teacher_surname
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
}

class LearningBlock implements LearningBlockProps {

    id: number;
    number: number;
    school_year: number;
    start: string;
    end: string;

    constructor(blockObj : LearningBlockProps) {
        this.id = blockObj.id;
        this.number = blockObj.number;
        this.school_year = blockObj.school_year;
        this.start = blockObj.start;
        this.end = blockObj.end;
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

    async getBlockList($axios : AxiosInstance, store : Store<any>, learning_context?: LearningContextSummary, reference = new Date(), credits? : boolean, courses_list? : boolean) : Promise<string> {
    
        const language : Language = store.state.language;
        const status = this.getStatus(reference);
        const put_credits = credits ?? status == LearningBlockStatus.FUTURE;
        const put_courses_list = courses_list ?? (status == LearningBlockStatus.CURRENT || status == LearningBlockStatus.UPCOMING);
        const actual_learning_context = getActualLearningContext(store,learning_context);
        const courses: {
            [learning_area_id: string]: CourseSummary[]
        } = {};
        const learning_areas = await executeLink($axios,"/v1/learning_areas?all_data=true&block_id=" + this.id + "&credits=" + put_credits,
            response => response.data.data,
            () => []);

        let courses_presence: boolean;
        let block_list = put_courses_list ? "" : "<ul>";

        await executeLink($axios,"/v1/courses?student_id=" + store.state.user.id + "&context_id=" + actual_learning_context.id + "&block_id=" + this.id,
            response => (response.data.data as CourseSummaryProps[]).map(x => {
                const course = new CourseSummary(x);
                const learning_area_id = (course.learning_area_ref.data as {id:string}).id;
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
                                    ? " - " + getCurrentElement(store,"section") + " " + course.section : "")
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

    async getInscribedCredits($axios : AxiosInstance, store: Store<any>, learning_context_id: string): Promise<number> {
        return await executeLink($axios,"/v1/courses?student_id=" + store.state.user.id + "&block_id=" + this.id + "&context_id=" + learning_context_id,
                response => response.data.data.reduce((a: number, b: CourseSummaryProps) => a + (b.pending == "true" ? b.credits : 0), 0),
                () => 0);
    }

    async toCard($axios : AxiosInstance, store : Store<any>, learning_context? : LearningContextSummary, credits? : boolean, courses_list? : boolean, reference = new Date()) : Promise<GeneralCardElements> {
        
        const status = this.getStatus(reference);
        const put_credits = credits ?? status == LearningBlockStatus.FUTURE;
        const actual_learning_context: LearningContextSummary = getActualLearningContext(store,learning_context);
        const tmp_element : GeneralCardElements = {
            id: "" + this.id,
            group: this.school_year,
            title: getCurrentElement(store,"block") + " " + this.number,
            subtitle: getRagneString(new Date(this.start),new Date(this.end)),
            content: [{
                id: "" + this.id,
                type: "html",
                content: status != LearningBlockStatus.COMPLETED || credits != undefined || courses_list != undefined ?
                    (put_credits ? "<label>" + getCurrentElement(store,"constraints") + ":"
                    + (actual_learning_context.credits != null ? " " + (await this.getInscribedCredits($axios,store,actual_learning_context.id)) + "/" + actual_learning_context.credits : "") + "</label>" : "")
                    + (actual_learning_context.credits == null ? (await this.getBlockList($axios, store, actual_learning_context, reference,credits,courses_list)) : "")
                    : ""
            }],
            url: "learning_blocks/" + this.id,
            method: "get"
        };
        
        return tmp_element;
    }

    toHighlightCard(store : Store<any>, selected = false, reference = new Date()) : HiglightBlockCardElements {
        
        const status = this.getStatus(reference);
        const tmp_element : HiglightBlockCardElements = {
            id: "" + this.id,
            group: this.school_year,
            title: getCurrentElement(store,"block") + " " + this.number,
            subtitle: getRagneString(new Date(this.start),new Date(this.end)),
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
    [key : string]: IconAlternatives
}

type RequestParameters = {
    url: string,
    method: Method,
}

type EventParameters = {
    event: string,
    data?: {
        [key : string]: any
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

type Role = "" | "student" | "teacher" | "admin";

type CardsList<T = CardElements> = {
    [key : string | number]: T[]
}

type OrderedCardsList<T = CardElements> = {
    order: {
        key: string | number,
        title: string | number
    }[],
    cards: CardsList<T>
}

type ElementType = "string" | "html" | "icon" | "title";

type LinkType = "request" | "event";

type CustomElement = {
    id: string,
    type: ElementType,
    linkType?: LinkType,
    content: string | IconAlternatives | RequestIcon | EventIcon | RequestString | EventString
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

    constructor(props : GradeProps) {
        this.publication = new Date(props.publication);
        this.grade = props.grade;
        this.italian_description = props.italian_description;
        this.english_description = props.english_description;
        this.final = props.final;
        
        this.id = hashCode(this.publication.toISOString());
    }

    toCard(store : Store<any>) : GeneralCardElements { //Da sistemare: per visualizzazione tabella a telefono
        const language : Language = store.state.language;
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

    toTableRow(store : Store<any>) : CustomElement[] {
        const language : Language = store.state.language;
        return [{
            id: this.id + "_description",
            type: "html",
            content: this[`${language}_description`] + (this.final ? " <b>[" + getCurrentElement(store,"final") + "]</b>" : "") //Da sistemare: visualizzazione migliore voto finale
        },{
            id: this.id + "_pubblication",
            type: "string",
            content: this.publication.toLocaleDateString("en-GB")
        },{
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

    constructor(props : ProjectClassTeachingsResponse) {
        this.id = props.id;
        this.italian_title = props.italian_title;
        this.english_title = props.english_title;
        this.sections = new Set([props.section]);
        this.my_teaching_refs = new Set([(props.teaching_ref.data as {
            "id": string
        }).id]);
    }
    
    toCard(store : Store<any>, group : string, learning_block : string) : GeneralCardElements { //Da sistemare: per visualizzazione tabella a telefono
        const language : Language = store.state.language;
        return {
            id: "" + this.id,
            group: group,
            content: [{
                id: this.id + "_title",
                type: "title",
                content: this[`${language}_title`]
            },{
                id: this.id + "_sections",
                type: "string",
                content: getCurrentElement(store,"sections") + ": " + Array.from(this.sections).join(", ")
            },{
                id: this.id + "_my_associated_teachings",
                type: "string",
                content: getCurrentElement(store,"my_associated_teachings") + ": " + Array.from(this.my_teaching_refs).join(", ")
            }],
            url: "project_courses/" + this.id + "/" + learning_block,
            method: "get"
        }
    }
}

type StudentProps = {
    id: number,
    name: string,
    surname: string,
    learning_context_ref: ResponseItem<{
        "id": string
    }>,
    ord_class_study_year: number,
    ord_class_address: string,
    ord_class_section: string
}

class Student {
        
        id: number;
        name: string;
        surname: string;
        learning_context_id: string;
        ordinary_class: OrdinaryClassSummary;
    
        constructor(props : StudentProps) {
            this.id = props.id;
            this.name = props.name;
            this.surname = props.surname;
            this.learning_context_id = (props.learning_context_ref.data as {id:string}).id;
            this.ordinary_class = {
                study_year: props.ord_class_study_year,
                address: props.ord_class_address,
                section: props.ord_class_section
            }
        }
        
        toCard(store : Store<any>) : GeneralCardElements { //Da sistemare
            return {
                id: "" + this.id,
                group: "",
                content: [{
                    id: this.id + "_name",
                    type: "string",
                    content: this.name
                },{
                    id: this.id + "_surname",
                    type: "string",
                    content: this.surname
                }]
            }
        }

        toTableRow(store : Store<any>, course_id : string, block_id : string, teacher_id : number, final_grade? : Grade) : CustomElement[] {
            return [{ //Da sistemare: rendere cliccabile
                id: this.id + "_name_surname",
                type: "string",
                content: this.name + " " + this.surname
            },{
                id: this.id + "_learning_context",
                type: "string",
                content: this.learning_context_id
            },{
                id: this.id + "_class",
                type: "string",
                content: this.ordinary_class.study_year + " " + this.ordinary_class.address + " " + this.ordinary_class.section
            },{
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
                    icon: getIcon(store,"document_text")
                }
            },{
                id: this.id + "_final_grade",
                type: "string",
                content: final_grade != undefined ? "" + final_grade.grade : "-"
            }]
        }
}

type LearningContextSummary = {
    id: string
    credits?: number | null
}

type LearningContext = LearningContextSummary & {
    [key in keyof Language as `${Language}_title`]: string
} & {
    [key in keyof Language as `${Language}_description`]: string | null // Da sistemare: vedere descrizioni che possono essere null
}

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

    constructor(props : AnnouncementSummaryProps) {
        this.id = props.id;
        this.publishment = new Date(props.publishment);
        this.italian_title = props.italian_title;
        this.english_title = props.english_title;
    }

    toCard(store : Store<any>) : GeneralCardElements {
        const language : Language = store.state.language;
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
            },{
                id: this.id + "_publishment",
                type: "string",
                content: getCurrentElement(store,"publishment") + ": " + toDateString(this.publishment)
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

export { Language, Menu, MenuItem, MenuTitle, BaseElement, ElementsList, OrdinaryClass, OrdinaryClassSummary, LearningBlockProps, LearningBlock, Enrollment, MinimumCourseProps, MinimizedCourse, CourseSummaryProps, CourseProps, CardElements, GeneralCardElements, CourseCardElements, HiglightBlockCardElements as TeacherBlockCardElements, LearningBlockStatus, LearningArea, CourseBase, CourseSummary, CurriculumCourse, Course, IconAlternatives, IconsList, RequestIcon, EventIcon, RequestString, EventString, CardsList, Role, OrderedCardsList, CustomElement, GradeProps, Grade, GradesParameters, ProjectClassTeachingsResponse, CourseSectionsTeachings, Student, LearningContextSummary, LearningContext, AnnouncementSummaryProps, Announcement, AnnouncementSummary, AnnouncementParameters }