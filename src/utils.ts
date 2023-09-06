import { Method } from "axios";
import { GeneralCardElements, CardElements, CourseCardElements, Language, ElementsList, IconsList, LearningSessionStatus, LearningContext, LearningContextSummary, Gender, GenderKeys, LinkParameters, EventParameters, RequestParameters, ContentType, CustomElement, ElementType, SubElementsColors } from "./types";
import { $axios } from "./plugins/axios";
import { store } from "./store"

function getCompleteSchoolYear(year: number) {
    return year + " - " + (year + 1);
}

function getCurrentSchoolYear() {
    const today = new Date();
    return today.getMonth() < 8 ? today.getFullYear() - 1 : today.getFullYear();
}

function getRagneString(start: Date, end: Date) {
    return toDateString(new Date(start)) + "-" + toDateString(new Date(end));
}

function isGeneral(card: CardElements): card is GeneralCardElements {
    return "side_element" in card || !("credits" in card); //Da sistemare: vedere se creare un parametro per fare la condizione positiva
}

function isCourse(card: CardElements): card is CourseCardElements {
    return "credits" in card;
}

async function executeLink(url?: string | undefined, success = (response: any) => response, fail: (err: string) => any = (err: string) => err, method?: Method, body?: { [key: string]: any }) {

    const toExecute = url ?? store.state.request.url;
    const howExecute = method ?? store.state.request.method ?? "get";
    const options = {
        headers: {
            "x-access-token": sessionStorage.getItem("token") ?? ""
        }
    };

    let request;

    if ($axios != undefined && toExecute != undefined) {
        switch (howExecute) {
            case "get":
                request = $axios.get(toExecute, options);
                break;
            case "post":
                request = $axios.post(toExecute, body, options);
                break;
            case "put":
                request = $axios.put(toExecute, body, options);
                break;
            case "delete":
                request = $axios.delete(toExecute, options);
                break;
            default:
                return new Promise(() => "Method not defined");
        }
        store.state.request = {};
        return request.then(success)
            .catch(fail); // Da sistemare: mettere finally che cancella store.state.request e store.state.event
    } else {
        store.state.request = {};
        return new Promise((resolve, reject) => {
            console.error("No axios instance or url defined");
            reject(fail("No axios instance or url defined"));
        });
    }
}

function getCurrentElement(key: string) {

    const language: Language = store.state.language;
    const elements: ElementsList = store.state.elements;

    return elements[language][key];
}

function getIcon(key: string) {

    const icons: IconsList = store.state.icons;

    return icons[key];
}

function hashCode(str: string) {

    let i, chr;
    let hash = 0;

    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

function castStatus(status: string): LearningSessionStatus | null {

    let cast: LearningSessionStatus | null = null;

    switch (status) {
        case getCurrentElement("current"):
            cast = LearningSessionStatus.CURRENT;
            break;
        case getCurrentElement("upcoming"):
            cast = LearningSessionStatus.UPCOMING;
            break;
        case getCurrentElement("completed"):
            cast = LearningSessionStatus.COMPLETED;
            break;
        case getCurrentElement("future"):
            cast = LearningSessionStatus.FUTURE;
            break;
    }

    return cast;
}

function getActualLearningContext(learning_context: LearningContextSummary | undefined): LearningContextSummary {
    return learning_context ?? store.state.main_learning_context;
}

function toSummary(learning_context: LearningContext | undefined): LearningContextSummary | undefined {
    return learning_context != undefined ? {
        id: learning_context.id,
        credits: learning_context.credits
    } : undefined;
}

function toDateString(date: Date) {
    return date.toLocaleDateString("en-GB");
}

function getGender(key: Gender) {
    return getCurrentElement(GenderKeys[key]);
}

function numberToSection(section: number) {
    return String.fromCharCode(65 + section);
}

function isEvent(link: LinkParameters): link is EventParameters {
    return "event" in link;
}

function isRequest(link: LinkParameters): link is RequestParameters {
    return "url" in link;
}

function getStatusString(status: LearningSessionStatus) {
    return status == LearningSessionStatus.CURRENT
        ? getCurrentElement("current")
        : status == LearningSessionStatus.UPCOMING
            ? getCurrentElement("upcomoing")
            : "";
}

function getStatusColor(status: LearningSessionStatus) {
    return status == LearningSessionStatus.CURRENT
        ? "success"
        : status == LearningSessionStatus.UPCOMING
            ? "medium"
            : ""
}

function getCurrentLanguage(): Language {
    return store.state.language;
}

function getAviableLanguages(): Language[] {
    return store.state.languages;
}

function getCustomMessage(id: string, content: ContentType, type: ElementType = "string", colors?: SubElementsColors): CustomElement {
    return {
        id: id,
        type: type,
        content: content,
        colors: colors
    }
}

function nullOperator(...args: any[]) {
    let count = 0;
    let color;

    while (count < args.length && (color = args[count++]) == undefined);

    return color;
}

function getCssVariable(variable: string) {
    return getComputedStyle(document.documentElement).getPropertyValue(
        variable
    );
}

export { getCompleteSchoolYear, getCurrentSchoolYear, getRagneString, isGeneral, isCourse, executeLink, getCurrentElement, getIcon, hashCode, castStatus, getActualLearningContext, toSummary, toDateString, getGender, numberToSection, isEvent, isRequest, getStatusString, getStatusColor, getCurrentLanguage, getAviableLanguages, getCustomMessage, nullOperator, getCssVariable }