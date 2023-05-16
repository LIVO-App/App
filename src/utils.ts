import { AxiosInstance } from "axios";
import { GeneralCardElements, CardElements, CourseCardElements } from "./types";

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

async function executeLink($axios : AxiosInstance | undefined, url : string | undefined,success = () => new Event("reload"), fail = (err : string) => new Event(err)) /*: Promise<Event>*/ {
    /*return $axios != undefined && url != undefined ? $axios.get(url)
        .then(success)
        .catch(fail) : new Promise(() => new Event("Axios or url not defined"));*/
    return new Promise(() => new Event("reload"));
}

export { getCompleteSchoolYear, getCurrentSchoolYear, getRagneString, isGeneral, isCourse, executeLink }