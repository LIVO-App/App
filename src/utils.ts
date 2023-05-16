import { AxiosInstance, Method } from "axios";
import { GeneralCardElements, CardElements, CourseCardElements } from "./types";
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

async function executeLink(store : Store<any>, $axios : AxiosInstance | undefined, success = (response : any) => response, fail = (err : string) => err, url? : string | undefined, method? : Method) {
    const toExecute = url ?? store.state.request.url;
    const howExecute = method ?? store.state.request.method;
    console.log(toExecute,howExecute);
    let request;
    if ($axios != undefined && toExecute != undefined) {
        switch (howExecute) {
            case "get":
                request = $axios.get(toExecute);
                break;
            case "post":
                request = $axios.post(toExecute);
                break;
            case "put":
                request = $axios.put(toExecute);
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
        return new Promise(() => "Axios or url not defined");
    }
}

export { getCompleteSchoolYear, getCurrentSchoolYear, getRagneString, isGeneral, isCourse, executeLink }