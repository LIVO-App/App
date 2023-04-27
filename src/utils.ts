import { CourseSummary, Language, LearningArea, LearningBlock, LearningBlockStatus } from "./types";

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

export { getLearningBlockStatus, getCompleteSchoolYear, getCurrentSchoolYear }