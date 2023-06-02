import { AxiosInstance, Method } from "axios";
import { GeneralCardElements, CardElements, CourseCardElements, OrderedCardsList, Language, ElementsList } from "./types";
import { Store } from "vuex";

function getCompleteSchoolYear(year: number) {
    return year + " - " + (year + 1);
}

function getCurrentSchoolYear() {
    const today = new Date();
    return today.getMonth() < 8 ? today.getFullYear() - 1 : today.getFullYear();
}

function getRagneString(start: Date, end: Date) {
    return (new Date(start)).toLocaleDateString("en-GB") + " - " + (new Date(end)).toLocaleDateString("en-GB");
}

function isGeneral(card : CardElements) : card is GeneralCardElements {
    return "title" in card;
}

function isCourse(card : CardElements) : card is CourseCardElements {
    return "credits" in card;
}

async function executeLink($axios : AxiosInstance | undefined, url? : string | undefined, success = (response : any) => response, fail : (err: string) => any = (err : string) => err, method? : Method, body?: {[key: string] : any}, store? : Store<any>) {
    
    const toExecute = url ?? store?.state.request.url;
    const howExecute = method ?? store?.state.request.method ?? "get";

    let request;

    if ($axios != undefined && toExecute != undefined) {
        switch (howExecute) {
            case "get":
                request = $axios.get(toExecute);
                break;
            case "post":
                request = $axios.post(toExecute,body);
                break;
            case "put":
                request = $axios.put(toExecute,body);
                break;
            case "delete":
                request = $axios.delete(toExecute);
                break;
            default:
                return new Promise(() => "Method not defined");
        }
        return request.then(success)
            .catch(fail);
    } else {
        return new Promise((resolve,reject) => {
            console.error("No axios instance or url defined");
            reject(fail("No axios instance or url defined"));
        });
    }
}

function updateCourses(courses : OrderedCardsList, learning_block_id : number, value : Date | boolean) {

    const course = courses.cards[""].find(c => c.id == "" + learning_block_id) as CourseCardElements;
    const requestArray = course.url?.split("?") ?? ["",""];
    const pathArray = requestArray[0].split("/");
    pathArray?.pop();

    course.enrollment.enrollment = value;
    course.url = pathArray.join("/") + (value === false ? "/inscribe?" : "/unscribe?") + requestArray[1];
}

function getCurrentElement(store : Store<any>, key : string) {
    
    const language : Language = store.state.language;
    const elements : ElementsList = store.state.elements;

    return elements[language][key];
}

export { getCompleteSchoolYear, getCurrentSchoolYear, getRagneString, isGeneral, isCourse, executeLink, updateCourses, getCurrentElement }