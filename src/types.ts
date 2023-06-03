import { AxiosInstance, Method } from "axios";
import { Store } from "vuex";
import { executeLink, getCurrentElement, getRagneString } from "./utils";

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
    [key: string]: string //Mettere [key in keyof string as Language]
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
    isPending() : boolean {
        return this._enrollment !== "true" && this._enrollment !== "false";
    }
    getChangingMethod() : Method {
        return this.enrollment ? "delete" : "post";
    }
}

type CardElements = {
    id: string,
    group: any,
    url?: string
}

type GeneralCardElements = CardElements & {
    title?: string,
    subtitle?: string,
    content: CustomElement[]
}

type CourseCardElements = CardElements & {
    credits: number,
    content: string,
    enrollment: Enrollment
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

type CourseBaseProps = {
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

type CourseSummaryProps = CourseBaseProps & {
    section?: string,
    pending: string
}

type CurriculumCourseProps = CourseBaseProps & {
    section: string,
    final_grade: Grade | null,
}

type Course = CourseBaseProps & {
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

class CourseBase implements CourseBaseProps {
    id : number;
    credits : number;
    learning_area_ref : ResponseItem<{
        id: string
    }>;
    italian_title : string;
    english_title : string;
    italian_displayed_name : string | null;
    english_displayed_name : string | null;

    constructor(courseObj : CourseBaseProps) {
        this.id = courseObj.id;
        this.credits = courseObj.credits;
        this.learning_area_ref = courseObj.learning_area_ref;
        this.italian_title = courseObj.italian_title;
        this.english_title = courseObj.english_title;
        this.italian_displayed_name = courseObj.italian_displayed_name;
        this.english_displayed_name = courseObj.english_displayed_name;
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

    toCard(store : Store<any>, learning_block : LearningBlock, path? : string, open_enrollment = false, reference = new Date()) : CourseCardElements {
        const language : Language = store.state.language;
        const status = learning_block.getStatus(reference);
        return {
            id: "" + this.id,
            group: "",
            credits: this.credits,
            content: this[`${language}_title`],
            enrollment: new Enrollment(this.pending,learning_block,reference,open_enrollment),
            url: path
        }
    }
}

class CurriculumCourse extends CourseBase implements CurriculumCourseProps {
    
    section: string;
    final_grade: Grade | null;

    constructor(courseObj : CurriculumCourseProps) {
        super(courseObj);
        this.section = courseObj.section;
        this.final_grade = courseObj.final_grade;
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

    toCard(store : Store<any>, path? : string) : GeneralCardElements {
        const language : Language = store.state.language;
        return {
            id: "" + this.id,
            group: "",
            content: [{
                id: this.id + "_title",
                type: "html",
                content: this[`${language}_title`]
            }],
            url: path
        }
    }

    toTableRow(store : Store<any>, block_id : number) : CustomElement[] {
        const language : Language = store.state.language;
        const icons : IconsList = store.state.icons;
        return [
            {
                id: this.id + "_title",
                type: "html",
                content: this[`${language}_title`]
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
                id: this.id + "_intermediate_gardes",
                type: "icon",
                content: {
                    url: "/v1/students/:id/grades?course_id=" + this.id + "&block_id=" + block_id,
                    method: "post",
                    icon: icons["document_text"]
                }
            },{
                id: this.id + "_final_grade",
                type: "string",
                content: this.final_grade != null ? "" + this.final_grade : "-"
            }
        ];

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

    async getBlockList($axios : AxiosInstance, store : Store<any>, reference = new Date(), credits? : boolean, courses_list? : boolean) : Promise<string> {
    
        const language : Language = store.state.language;
        const status = this.getStatus(reference);
        const put_credits = credits ?? status == LearningBlockStatus.FUTURE;
        const put_courses_list = courses_list ?? (status == LearningBlockStatus.CURRENT || status == LearningBlockStatus.UPCOMING);

        let courses : CourseSummary[];
        let block_list = put_courses_list ? "" : "<ul>";
    
        const learning_areas = await executeLink($axios,"/v1/learning_areas?all_data=true&block_id=" + this.id + "&credits=" + put_credits,
            response => response.data.data,
            () => [])
        
        for (const area of learning_areas) {
            courses = await executeLink($axios,"/v1/courses?student_id=" + store.state.user.id + "&block_id=" + this.id + "&area_id=" + area.id,
                response => (response.data.data as CourseSummaryProps[]).map(x => new CourseSummary(x)),
                () => [])
            block_list += (put_courses_list ? "<label>" : "<li>") + area[`${store.state.language as Language}_title`] + ": " + (put_credits ? courses.filter(course => course.pending == "true").reduce((pv, cv) => pv + cv.credits, 0) + "/" + area.credits : "") + (put_courses_list ? "</label>" : "</li>");
            if (put_courses_list) {
                block_list += courses.length > 0 ? "<ul>" : "<br />";
                for (const course of courses) {
                    if (course.pending == "true") {
                        block_list += "<li>" + course[`${language}_title`] + (status == LearningBlockStatus.CURRENT || status == LearningBlockStatus.UPCOMING ? " - " + getCurrentElement(store,"section") + " " + course.section : "") + "</li>"; //Aggiungere sezione
                    }
                }
                block_list += courses.length > 0 ? "</ul>" : "";
            }
        }
        block_list += (put_courses_list ? "" : "</ul>");
    
        return block_list;
    }

    async toCard($axios : AxiosInstance, store : Store<any>, credits? : boolean, courses_list? : boolean, reference = new Date()) : Promise<GeneralCardElements> {
        
        const status = this.getStatus(reference);
        const put_credits = credits ?? status == LearningBlockStatus.FUTURE;
        const tmp_element : GeneralCardElements = {
            id: "" + this.id,
            group: this.school_year,
            title: getCurrentElement(store,"block") + " " + this.number,
            subtitle: getRagneString(new Date(this.start),new Date(this.end)),
            content: [{
                id: "b" + this.id,
                type: "html",
                content: status == LearningBlockStatus.COMPLETED ? "" : 
                    (put_credits ? "<label>" + getCurrentElement(store,"constraints") + ":</label>" : "") + (await this.getBlockList($axios, store, reference,credits,courses_list))
            }],
            url: "learning_blocks/" + this.id
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

type SimpleUrlIcon = {
    url: string,
    method: Method,
    icon: IconAlternatives
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

type ElementType = "string" | "html" | "icon";

type CustomElement = {
    id: string,
    type: ElementType,
    content: string | SimpleUrlIcon
}

type Grade = {
    value: number,
    description: string,
    final: boolean
}

export { Language, Menu, MenuItem, MenuTitle, BaseElement, ElementsList, OrdinaryClass, LearningBlockProps, LearningBlock, Enrollment, CourseSummaryProps, Course, CardElements, GeneralCardElements, CourseCardElements, LearningBlockStatus, LearningArea, CourseBase, CourseSummary, CurriculumCourse, IconAlternatives, IconsList, SimpleUrlIcon, CardsList, Role, OrderedCardsList, CustomElement }