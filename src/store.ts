import { createStore } from "vuex";

import {
    addCircleOutline,
    addCircleSharp,
    addOutline,
    addSharp,
    arrowBackOutline,
    arrowBackSharp,
    briefcaseOutline,
    briefcaseSharp,
    clipboardOutline,
    clipboardSharp,
    closeOutline,
    closeSharp,
    documentTextOutline,
    documentTextSharp,
    easelOutline,
    easelSharp,
    informationCircleOutline,
    informationCircleSharp,
    ribbonOutline,
    ribbonSharp,
    schoolOutline,
    schoolSharp,
    settingsOutline,
    settingsSharp,
} from 'ionicons/icons';

export const store = createStore({
    state() {
        return {
            menu: {
            "student": [
                {
                    title: {
                        italian: "Blocchi di apprendimento",
                        english: "Learning blocks"
                    },
                    url: '/learning_blocks',
                    iconRef: "easel"
                },
                {
                    title: {
                        italian: "Curriculum",
                        english: "Curriculum"
                    },
                    url: '/curriculum',
                    iconRef: "school"
                },
                {
                    title: {
                        italian: "ObenBadge",
                        english: "OpenBadges"
                    },
                    url: '/openbadges',
                    iconRef: "ribbon"
                },
                {
                    title: {
                        italian: "Cittadinanza attiva",
                        english: "Citizenship report"
                    },
                    url: '/citizenship_report',
                    iconRef: "clipboard"
                },
                {
                    title: {
                        italian: "Impostazioni",
                        english: "Settings"
                    },
                    url: '/settings',
                    iconRef: "settings"
                },
                {
                    title: {
                        italian: "Info",
                        english: "Info"
                    },
                    url: '/info',
                    iconRef: "information_circle"
                }
            ],
            "teacher": [
                {
                    title: {
                        italian: "Corsi progetto",
                        english: "Project courses"
                    },
                    url: '/project_courses',
                    iconRef: "brief_case"
                },
                {
                    title: {
                        italian: "Proposta corso",
                        english: "Course propose"
                    },
                    url: '/course_propose',
                    iconRef: "add_circle"
                },
                {
                    title: {
                        italian: "Impostazioni",
                        english: "Settings"
                    },
                    url: '/settings',
                    iconRef: "settings"
                },
                {
                    title: {
                        italian: "Info",
                        english: "Info"
                    },
                    url: '/info',
                    iconRef: "information_circle"
                }
            ],
            "admin": []
            },
            menuIndex: 0,
            icons: {
                easel: {
                    ios: easelOutline,
                    md: easelSharp,
                },
                school: {
                    ios: schoolOutline,
                    md: schoolSharp,
                },
                ribbon: {
                    ios: ribbonOutline,
                    md: ribbonSharp,
                },
                clipboard: {
                    ios: clipboardOutline,
                    md: clipboardSharp,
                },
                settings: {
                    ios: settingsOutline,
                    md: settingsSharp,
                },
                information_circle: {
                    ios: informationCircleOutline,
                    md: informationCircleSharp,
                },
                brief_case: {
                    ios: briefcaseOutline,
                    md: briefcaseSharp,
                },
                add_circle: {
                    ios: addCircleOutline,
                    md: addCircleSharp,
                },
                arrow_back: {
                    ios: arrowBackOutline,
                    md: arrowBackSharp
                },
                add: {
                    ios: addOutline,
                    md: addSharp
                },
                close: {
                    ios: closeOutline,
                    md: closeSharp
                },
                document_text: {
                    ios: documentTextOutline,
                    md: documentTextSharp
                }
            },
            language: "italian",
            elements: {
                "italian": {
                    constraints: "Vincoli crediti",
                    block: "Blocco",
                    current: "Corrente",
                    future: "Futuri",
                    upcoming: "Imminente",
                    completed: "Completati",
                    noBlocks: "Nessun blocco di apprendimento",
                    course: "Corso",
                    courses: "Corsi",
                    learning_area: "Area di apprendimento",
                    noCourses: "Nessun corso",
                    credits: "Crediti",
                    pending: "In attesa",
                    enrolled: "Iscritto",
                    not_enrolled: "Non iscritto",
                    select: "Seleziona",
                    open_enrollment: "Iscrizioni aperte",
                    planned: "Pianificati",
                    error: "Errore",
                    maximumCreditsError: "Crediti massimi raggiunti",
                    ok: "Ok",
                    school_year: "Anno scolastico",
                    school_year_choice: "Scegli un anno scolastico",
                    section: "Sezione",
                    intermediate_grades: "Valutazioni intermedie",
                    final_grade: "Valutazione finale"
                },
                "english": {
                    constraints: "Credits constraints",
                    block: "Block",
                    current: "Current",
                    future: "Future",
                    upcoming: "Upcoming",
                    completed: "Completed",
                    noBlocks: "No learning blocks",
                    course: "Course",
                    courses: "Courses",
                    learning_area: "Learning area",
                    noCourses: "No courses",
                    credits: "Credits",
                    pending: "Pending",
                    enrolled: "Enrolled",
                    not_enrolled: "Not enrolled",
                    select: "Select",
                    open_enrollment: "Open enrollment",
                    planned: "Planned",
                    error: "Error",
                    maximumCreditsError: "Maximum credits reached",
                    ok: "Ok",
                    school_year: "School year",
                    school_year_choice: "Choose a school year",
                    section: "Section",
                    intermediate_grades: "Intermediate grades",
                    final_grade: "Final grade"
                }
            },
            user: {
                id: 1,
                username: "Student1",
                user: "student",
            },
            request: {},
            event: ""
        }
    }
});