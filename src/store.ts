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
    mailOutline,
    mailSharp,
    peopleOutline,
    peopleSharp,
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
            "student": [ // Da sistemare: spostare traduzioni e mettere riferimenti a title
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
                        italian: "Annunci",
                        english: "Announcements"
                    },
                    url: '/announcements',
                    iconRef: "mail"
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
                        italian: "Classi ordinarie",
                        english: "Ordinary classes"
                    },
                    url: '/ordinary_classes',
                    iconRef: "people"
                },
                {
                    title: {
                        italian: "Proposta corso",
                        english: "Course propose"
                    },
                    url: '/course_propose',
                    iconRef: "add_circle"
                },
                { // Da sistemare: non deve apparire
                    title: {
                        italian: "Annunci",
                        english: "Announcements"
                    },
                    url: '/announcements',
                    iconRef: "mail"
                },
                { // Da sistemare: non deve apparire
                    title: {
                        italian: "Studenti",
                        english: "Students"
                    },
                    url: '/students',
                    iconRef: "people"
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
                },
                mail: {
                    ios: mailOutline,
                    md: mailSharp
                },
                people: {
                    ios: peopleOutline,
                    md: peopleSharp
                }
            },
            languages: ["italian","english"],
            language: "italian",
            elements: {
                "italian": {
                    constraints: "Vincoli crediti",
                    block: "Blocco",
                    current: "Corrente",
                    future: "Futuri",
                    upcoming: "Imminente",
                    completed: "Completati",
                    no_blocks: "Nessun blocco di apprendimento",
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
                    maximum_credits_error: "Crediti massimi raggiunti",
                    ok: "Ok",
                    school_year: "Anno scolastico",
                    school_year_choice: "Scegli un anno scolastico",
                    section: "Sezione",
                    sections: "Sezioni",
                    grades: "Valutazioni",
                    final_grade: "Valutazione finale",
                    description: "Descrizione",
                    date: "Data",
                    evaluation: "Valutazione",
                    intermediate_arithmetic_mean: "Media aritmetica intermedia",
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
                    course_information_not_found: "Informazioni del corso non trovate",
                    learning_blocks: "Blocchi di apprendimento",
                    teacher_learning_block_selection_message: "Seleziona un blocco di apprendimento per vedere i corsi in cui insegni o che ha un tuo insegnameto associato",
                    student_learning_block_selection_message: "Seleziona un blocco di apprendimento per vedere i corsi a cui sei iscritto",
                    teacher: "Insegnante",
                    associated: "Associati",
                    my_associated_teachings: "Miei insegnamenti associati",
                    no_project_classes: "Nessuna classe progetto",
                    section_choice: "Scegli una sezione",
                    no_sections: "Nessuna sezione disponibile",
                    student: "Studente",
                    class: "Classe",
                    grade_insertion: "Inserimento valutazione",
                    insert_grade: "Inserisci valutazione",
                    grade: "Valutazione",
                    empty_descriptions: "Descrizione vuota",
                    grade_value_error: "Valore del voto errato",
                    learning_context: "Contesto di apprendimento",
                    learning_context_choice: "Scegli un contesto di apprendimento",
                    no_messages: "Nessun messaggio",
                    publishment: "Pubblicazione",
                    title: "Titolo",
                    message: "Messaggio",
                    publish: "Pubblica",
                    announcement_publishment: "Pubblicazione annuncio",
                    to: "A",
                    empty_titles_or_messages: "Titoli e/o messagi vuoti",
                    no_selected_sections: "Nessuna sezione selezionata",
                    message_not_sent_sections: "Messaggio non inviato alle sezioni",
                    no_courses: "Nessun corso disponibile",
                    group: "Gruppo",
                    maximum_courses_error: "Corsi per gruppo massimi raggiunti",
                    classes: "Classi",
                    no_classes: "Nessuna classe disponibile",
                    students: "Studenti",
                    no_students: "Nessuno studente disponibile",
                    ordinary_class_selection_message: "Seleziona una classe per vedere gli studenti associati",
                    name: "Nome",
                    surname: "Cognome",
                    gender: "Genere",
                    birth_date: "Data di nascita",
                    address: "Indirizzo",
                    email: "E-mail",
                    male: "Maschio",
                    female: "Femmina",
                    other: "Altro",
                    progression: "Progressi",
                    context_credits: "Crediti nel contesto",
                    area_credits: "Crediti per area"
                },
                "english": {
                    constraints: "Credits constraints",
                    block: "Block",
                    current: "Current",
                    future: "Future",
                    upcoming: "Upcoming",
                    completed: "Completed",
                    no_blocks: "No learning blocks",
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
                    maximum_credits_error: "Maximum credits reached",
                    ok: "Ok",
                    school_year: "School year",
                    school_year_choice: "Choose a school year",
                    section: "Section",
                    sections: "Sections",
                    grades: "Grades",
                    final_grade: "Final grade",
                    description: "Description",
                    date: "Date",
                    evaluation: "Evaluation",
                    intermediate_arithmetic_mean: "Intermediate arithmetic mean",
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
                    course_information_not_found: "Course information not found",
                    learning_blocks: "Learning blocks",
                    teacher_learning_block_selection_message: "Select a learning block to see the courses you teach or that has a teaching of yours associated",
                    teacher: "Teacher",
                    associated: "Associated",
                    my_associated_teachings: "My associated teachings",
                    no_project_classes: "No project classes",
                    section_choice: "Choose a section",
                    no_sections: "No sections available",
                    student: "Student",
                    class: "Class",
                    grade_insertion: "Grade insertion",
                    insert_grade: "Insert grade",
                    grade: "Grade",
                    empty_descriptions: "Empty description",
                    grade_value_error: "Incorrect grade value",
                    learning_context: "Learning context",
                    learning_context_choice: "Choose a learning context",
                    no_messages: "No messages",
                    publishment: "Publishment",
                    title: "Title",
                    message: "Message",
                    publish: "Publish",
                    announcement_publishment: "Announcement publishment",
                    to: "To",
                    empty_titles_or_messages: "Empty titles and/or messages",
                    no_selected_sections: "No selected sections",
                    message_not_sent_sections: "Message not sent to sections",
                    no_courses: "No courses available",
                    group: "Group",
                    maximum_courses_error: "Maximum courses per group reached",
                    classes: "Classes",
                    no_classes: "No classes available",
                    students: "Students",
                    no_students: "No students available",
                    ordinary_class_selection_message: "Select a class to see the associated students",
                    name: "Name",
                    surname: "Surname",
                    gender: "Gender",
                    birth_date: "Birth date",
                    address: "Address",
                    email: "E-mail",
                    male: "Maschio",
                    female: "Femmina",
                    other: "Altro",
                    progression: "Progression",
                    context_credits: "Context credits",
                    area_credits: "Area credits"
                }
            },
            /*
            user: {
                id: 1,
                username: "Student1",
                token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOjEsInVzZXJuYW1lIjoiU3R1ZGVudDEiLCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTY5MDU1MjY1MiwiZXhwIjoxNjkwNjM5MDUyfQ.h5TN0M40v8jnNzVOP8JeQfpH3vMsii8RD1JXgdJq18Y",
                user: "student",
            },//*/
            /*
            user: {
                id: 1,
                username: "Teacher1",
                token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOjIsInVzZXJuYW1lIjoiU3R1ZGVudDIiLCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTY4ODM2OTkwOCwiZXhwIjoxNjg4NDU2MzA4fQ.XYjUjhxj_HjkPy-V7ntbGf2Hww8Y8kiS_mes-fC7D7U",
                user: "teacher",
            },//*/
            //*
            user: {
                id: 2,
                username: "Teacher2",
                token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOjIsInVzZXJuYW1lIjoiVGVhY2hlcjIiLCJyb2xlIjoidGVhY2hlciIsImlhdCI6MTY5MDU1NDg2NiwiZXhwIjoxNjkwNjQxMjY2fQ.8OB2mx0ERnOkChC5Jn0IwptWUSXOPC-v8OiFb1cULys",
                user: "teacher",
            },//*/
            request: {},
            event: {},
            hours_per_credit: 6,
            grades_scale: {
                min: 1,
                max: 11
            },
            excluded_learning_contexts_id: ["ECA"], //Da sistemare: mettere referenza a contesto di apprendimento
            main_learning_context: {
                id: "SPE",
                credits: null
            }, //Da sistemare: mettere referenza a contesto di apprendimento
            courses_per_group: 1
        }
    }
});