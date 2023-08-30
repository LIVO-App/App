import { AxiosInstance, Method } from "axios";
import { GeneralCardElements, CardElements, CourseCardElements, Language, ElementsList, IconsList, HiglightSessionCardElements, LearningSessionStatus, RequestIcon, Enrollment, LearningContext, LearningContextSummary, HiglightCardElements, Gender, GenderKeys, LinkParameters, EventParameters, RequestParameters } from "./types";
import { Store } from "vuex";

// Da sistemare: togliere store come parametro e usare import { store } from ./store

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

function isGeneral(card: CardElements): card is GeneralCardElements {
    return "side_element" in card || !("credits" in card); //Da sistemare: vedere se creare un parametro per fare la condizione positiva
}

function isCourse(card: CardElements): card is CourseCardElements {
    return "credits" in card;
}

function isHiglithCard(card: CardElements): card is HiglightCardElements {
    return "selected" in card;
}

function isHiglithSession(card: CardElements): card is HiglightSessionCardElements {
    return "status" in card;
}

async function executeLink($axios: AxiosInstance | undefined, url?: string | undefined, success = (response: any) => response, fail: (err: string) => any = (err: string) => err, method?: Method, body?: { [key: string]: any }, store?: Store<any>) {

    const toExecute = url ?? store?.state.request.url;
    const howExecute = method ?? store?.state.request.method ?? "get";

    let request;

    if ($axios != undefined && toExecute != undefined) {
        switch (howExecute) {
            case "get":
                request = $axios.get(toExecute);
                break;
            case "post":
                request = $axios.post(toExecute, body);
                break;
            case "put":
                request = $axios.put(toExecute, body);
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
        return new Promise((resolve, reject) => {
            console.error("No axios instance or url defined");
            reject(fail("No axios instance or url defined"));
        });
    }
}

function getEnrollmentIcon(store: Store<any>, enrollment: Enrollment, path: string, method?: Method): RequestIcon {
    return {
        url: path,
        method: enrollment.editable ?
            (method ?? enrollment.getChangingMethod())
            : (method ?? "get"),
        icon: enrollment.enrollment === false ? getIcon(store, "add") : getIcon(store, "close")
    }
}

function getCurrentElement(store: Store<any>, key: string) {

    const language: Language = store.state.language;
    const elements: ElementsList = store.state.elements;

    return elements[language][key];
}

function getIcon(store: Store<any>, key: string) {

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

function castStatus(store: Store<any>, status: string): LearningSessionStatus | null {

    let cast: LearningSessionStatus | null = null;

    switch (status) {
        case getCurrentElement(store, "current"):
            cast = LearningSessionStatus.CURRENT;
            break;
        case getCurrentElement(store, "upcoming"):
            cast = LearningSessionStatus.UPCOMING;
            break;
        case getCurrentElement(store, "completed"):
            cast = LearningSessionStatus.COMPLETED;
            break;
        case getCurrentElement(store, "future"):
            cast = LearningSessionStatus.FUTURE;
            break;
    }

    return cast;
}

function getActualLearningContext(store: Store<any>, learning_context: LearningContextSummary | undefined): LearningContextSummary {
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

function getGender(store: Store<any>, key: Gender) {
    return getCurrentElement(store, GenderKeys[key]);
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

export { getCompleteSchoolYear, getCurrentSchoolYear, getRagneString, isGeneral, isCourse, isHiglithCard, isHiglithSession, executeLink, getEnrollmentIcon, getCurrentElement, getIcon, hashCode, castStatus, getActualLearningContext, toSummary, toDateString, getGender, numberToSection, isEvent, isRequest }