import { AxiosInstance } from "axios";
import { BaseElement, CardElements, CourseSummary, Language, LearningArea, LearningBlock, LearningBlockStatus } from "./types";
import { Store } from "vuex";

function getLearningBlockStatus(learning_block: LearningBlock, reference : Date) { // future [TDB] upcoming [SD] current [ED] completed
    const startDate = new Date(learning_block.start);
    const endDate = new Date(learning_block.end);
    const tenDaysBefore = new Date(startDate);
    tenDaysBefore.setDate(tenDaysBefore.getDate() - 10);

    return reference < tenDaysBefore ? LearningBlockStatus.FUTURE
    : reference >= tenDaysBefore && reference < startDate ? LearningBlockStatus.UPCOMING
    : reference >= startDate && reference <= endDate ? LearningBlockStatus.CURRENT
    : LearningBlockStatus.COMPLETED;
}

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

async function getCompleteBlockDescription(block : LearningBlock, constraints : BaseElement, $axios : AxiosInstance, store : Store<any>) { //constraints da togliere dopo aggiornamento dizionario

    let courses : CourseSummary[];
    const tmp_element : CardElements = {
        id: "" + block.id,
        group: block.school_year,
        title: "Blocco " + block.number,
        subtitle: getRagneString(new Date(block.start),new Date(block.end)),
        content: "<label>" + constraints[store.state.language] + ":</label><ul>",
        url: "learning_blocks/" + block.id
    };
    const learning_areas = await $axios.get("/v1/learning_areas?all_data=true&credits=true&block_id=" + block.id)
        .then(response => response.data.data)
        .catch(() => []);
        
    for (const area of learning_areas) {
        courses = await $axios.get("/v1/courses?student_id=" + store.state.user.id + "&block_id=" + block.id + "&area_id=\"" + area.id + "\"")
        .then(response => response.data.data)
        .catch(() => []);
        tmp_element.content += "<li>" + area[`${store.state.language as Language}_title`] + ": " + courses.filter(course => course.pending == "true").reduce((pv, cv) => pv + cv.credits, 0) + "/" + area.credits + "</li>";
    }
    tmp_element.content += "</ul>";
    
    return tmp_element;
}

export { getLearningBlockStatus, getCompleteSchoolYear, getCurrentSchoolYear, getRagneString, getCompleteBlockDescription }