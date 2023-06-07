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
                    grades: "Valutazioni",
                    final_grade: "Valutazione finale",
                    description: "Descrizione",
                    date: "Data",
                    evaluation: "Valutazione",
                    arithmetic_mean: "Media aritmetica",
                    final: "Finale",
                    no_grades: "Nessun voto registrato",
                    expected_learning_results: "Risultati apprendimento attesi",
                    criterions: "Criteri",
                    activities: "Attività",
                    technical_information: "Informazioni tecniche",
                    growth_area: "Area di crescita personale",
                    creation_date: "Data di creazione",
                    hours: "Ore",
                    up_hours: "Ore UP",
                    students_number: "Numero di studenti",
                    proposer_teacher: "Insegnante proponente",
                    certifying_admin: "Amministratore certificante",
                    course_information_not_found: "Informazioni del corso non trovate"
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
                    grades: "Grades",
                    final_grade: "Final grade",
                    description: "Description",
                    date: "Date",
                    evaluation: "Evaluation",
                    arithmetic_mean: "Arithmetic mean",
                    final: "Final",
                    no_grades: "No grades recorded",
                    expected_learning_results: "Expected learning results",
                    criterions: "Criterions",
                    activities: "Activities",
                    technical_information: "Technical information",
                    growth_area: "Personal growth area",
                    creation_date: "Creation date",
                    hours: "Hours",
                    up_hours: "UP hours",
                    students_number: "Students number",
                    proposer_teacher: "Proposer teacher",
                    certifying_admin: "Certifying admin",
                    course_information_not_found: "Course information not found"
                }
            },
            user: {
                id: 1,
                username: "Student1",
                user: "student",
            },
            request: {},
            event: {},
            hours_per_credit: 6
        }
    }
});