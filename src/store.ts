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
    logOutOutline,
    logOutSharp,
    arrowForwardOutline,
    arrowForwardSharp,
    fileTrayFullOutline,
    calendarOutline,
    calendarSharp,
    linkOutline,
    linkSharp,
    fileTrayFullSharp,
    checkmarkOutline,
    checkmarkSharp,
    pencilOutline,
    pencilSharp,
    eyeOutline,
    eyeSharp
} from 'ionicons/icons';
import { UserProps } from "./types";

export const store = createStore({
    mutations: {
        editUser(state: any, user: UserProps | undefined) {
            state.user = user;
        },
        setLoggedUser(state: any, logged: boolean) {
            state.logged_user = logged;
        }
    },
    actions: {
        login({ commit }, user) {
            commit("editUser", user);
        },
        logout({ commit }) {
            commit("editUser", undefined);
        },
        signalLogin({ commit }) {
            commit("setLoggedUser", true);
        },
        signalLogout({ commit }) {
            commit("setLoggedUser", false);
        }
    },
    state() {
        return {
            menu: {
                items: {
                    "learning_sessions": {
                        url_names: {
                            "student": ["learning_sessions", "learning_session"],
                        },
                        icon_ref: "easel"
                    },
                    "curriculum": {
                        url_names: {
                            "student": ["curriculum"],
                        },
                        icon_ref: "school"
                    },
                    "openbadges": {
                        url_names: {
                            "student": ["openbadges"],
                            "admin": ["openbadges"],
                        },
                        icon_ref: "ribbon"
                    },
                    "citizenship_report": {
                        url_names: {
                            "student": ["citizenship_report"],
                            "admin": ["citizenship_report"],
                        },
                        icon_ref: "clipboard"
                    },
                    "announcements": {
                        url_names: {
                            "student": ["announcements", "announcement"],
                        },
                        icon_ref: "mail"
                    },
                    "project_courses": {
                        url_names: {
                            "teacher": ["project_courses", "project_course", "announcement", "student"],
                            "admin": ["project_courses_hub", "project_course", "student"]
                        },
                        icon_ref: "brief_case"
                    },
                    "ordinary_classes": {
                        url_names: {
                            "teacher": ["ordinary_classes", "student"],
                            "admin": ["ordinary_classes", "student"]
                        },
                        icon_ref: "people"
                    },
                    "course_proposal": {
                        url_names: {
                            "teacher": ["course_proposal", "propositions_history"],
                        },
                        icon_ref: "add_circle"
                    },
                    "course_proposals": {
                        url_names: {
                            "admin": ["propositions_history", "course_proposal"],
                        },
                        icon_ref: "archive"
                    },
                    "learning_sessions_management": {
                        url_names: {
                            "admin": ["learning_sessions_management"], // Da sistemare: non è detto che userò questa pagina, dato che non c'è una seconda lista
                        },
                        icon_ref: "calendar"
                    },
                    "constraints_management": {
                        url_names: {
                            "admin": ["constraints_management"]
                        },
                        icon_ref: "link"
                    },
                    "settings": {
                        url_names: {
                            "student": ["settings"],
                            "teacher": ["settings"],
                            "admin": ["settings"]
                        },
                        icon_ref: "settings"
                    },
                    "logout": { // Da sistemare: spostare in profilo quando verrà creato
                        url_names: {
                            "student": ["logout"],
                            "teacher": ["logout"],
                            "admin": ["logout"]
                        },
                        icon_ref: "logout"
                    },
                    "info": {
                        url_names: {
                            "student": ["info"],
                            "teacher": ["info"],
                            "admin": ["info"]
                        },
                        icon_ref: "information_circle"
                    }
                },
                order: {
                    "student": [
                        "learning_sessions",
                        "announcements",
                        "curriculum",
                        "openbadges",
                        "citizenship_report",
                        "settings",
                        "logout",
                        "info"
                    ],
                    "teacher": [
                        "project_courses",
                        "course_proposal",
                        "ordinary_classes",
                        "settings",
                        "logout",
                        "info"
                    ],
                    "admin": [
                        "project_courses",
                        "ordinary_classes",
                        "course_proposals",
                        "learning_sessions_management",
                        "constraints_management",
                        "citizenship_report",
                        "openbadges",
                        "settings",
                        "logout",
                        "info"
                    ]
                },
                default_item: {
                    student: "learning_sessions",
                    teacher: "project_courses",
                    admin: "project_courses_hub"
                },
                index: 0,
            },
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
                arrow_forward: {
                    ios: arrowForwardOutline,
                    md: arrowForwardSharp
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
                },
                logout: {
                    ios: logOutOutline,
                    md: logOutSharp
                },
                archive: {
                    ios: fileTrayFullOutline,
                    md: fileTrayFullSharp
                },
                calendar: {
                    ios: calendarOutline,
                    md: calendarSharp
                },
                link: {
                    ios: linkOutline,
                    md: linkSharp
                },
                checkmark: {
                    ios: checkmarkOutline,
                    md: checkmarkSharp
                },
                pencil: {
                    ios: pencilOutline,
                    md: pencilSharp
                },
                eye: {
                    ios: eyeOutline,
                    md: eyeSharp
                }
            },
            languages: ["italian", "english"],
            language: "italian",
            elements: {
                "italian": {
                    constraints: "Vincoli crediti",
                    session: "Sessione",
                    current: "Corrente",
                    future: "Futuri",
                    upcoming: "Imminente",
                    completed: "Completati",
                    no_sessions: "Nessuna sessione di apprendimento",
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
                    growth_areas: "Aree di crescita personale",
                    creation_date: "Data di creazione",
                    hours: "Ore",
                    up_hours: "Ore UP",
                    students_number: "Numero di studenti",
                    proposer_teacher: "Insegnante proponente",
                    certifying_admin: "Amministratore certificante",
                    course_information_not_found: "Informazioni del corso non trovate",
                    learning_sessions: "Sessioni di apprendimento",
                    teacher_learning_session_selection_message: "Seleziona una sessione di apprendimento per vedere i corsi in cui insegni o che ha un tuo insegnameto associato",
                    student_learning_session_selection_message: "Seleziona una sessione di apprendimento per vedere i corsi a cui sei iscritto",
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
                    area_credits: "Crediti per area",
                    auth: "Autenticazione",
                    username: "Username",
                    password: "Password",
                    admin: "Amministratore",
                    login: "Login",
                    wrong_username_or_password: "Username o password sbagliati",
                    server_error: "Errore del server",
                    no_username: "Username non inserito",
                    no_password: "Password non inserita",
                    reference_model: "Modello di riferimento",
                    possible_models: "Possibili modelli",
                    characteristics: "Caratteristiche",
                    conduct: "Svolgimento",
                    teaching_list: "Insegnamenti",
                    access_object: "Accesso",
                    teacher_list: "Insegnanti",
                    italian: "Italiano",
                    english: "Inglese",
                    propose: "Proponi",
                    min_students: "Studenti minimi",
                    max_students: "Studenti massimi",
                    area_choice: "Scegli un'area di apprendimento",
                    growth_choice: "Scegli un'area di crescita personale",
                    learning_sessions_choice: "Scegli una sessione di apprendimento",
                    learning_session_needed: "Sessione di apprendimento necessario",
                    group_choice: "Scegli un gruppo",
                    grant_access: "Concedi l'accesso",
                    add_teacher: "Aggiungi insegnante",
                    teaching_choices: "Scegli un insegnamento",
                    growth_area_choices: "Scegli un'area di crescita personale",
                    study_year: "Anno di studio",
                    study_address: "Indirizzo di studio",
                    study_year_choice: "Scegli un anno di studio",
                    study_address_choice: "Scegli un indirizzo di studio",
                    presidium: "Presidio",
                    main_study_year: "Anno di studi principale",
                    students_per_section: "Studenti per sezione",
                    students_distribution: "Distribuzione studenti",
                    num_section: "Numero di sezioni (1: A, 2: A e B, ...)",
                    teaching: "Insegnamento",
                    add: "Aggiungi",
                    study_address_needed: "Indirizzo di studio necessario",
                    teachings: "Insegnamenti",
                    no_teachings: "Nessun insegnamento",
                    no_growth_areas: "Nessuna area di crescita personale",
                    learning_context_needed: "Indirizzo di studio necessario",
                    no_access_proposition: "Nessuna proposta di accesso per le classi ordinarie",
                    teacher_choice: "Scegli un insegnante",
                    main_teacher: "Coordinatore di classe",
                    num_section_needed: "Numero delle sezioni necessario",
                    no_teacher_proposition: "Nessuna insegnante proposto",
                    school_years: "Anni scolastici",
                    no_school_years: "Nessun anno scolastico",
                    project_class_confirmation_date: "Data conferma classe progetto",
                    course_confirmation_date: "Data conferma modello di corso",
                    edit: "Modifica",
                    no_elements: "Nessun elemento",
                    curriculum: "Curriculum",
                    openbadges: "OpenBadge",
                    citizenship_report: "Cittadinanza attiva",
                    announcements: "Annunci",
                    settings: "Impostazioni",
                    logout: "Logout",
                    project_courses: "Corsi progetto",
                    ordinary_classes: "Classi ordinarie",
                    course_proposal: "Proposta corso",
                    course_proposals: "Proposte di corsi",
                    learning_sessions_management: "Gestione sessioni di apprendimento",
                    constraints_management: "Gestione vincoli",
                    info: "Info",
                    specific_information: "Informazioni specifiche",
                },
                "english": {
                    constraints: "Credits constraints",
                    session: "Session",
                    current: "Current",
                    future: "Future",
                    upcoming: "Upcoming",
                    completed: "Completed",
                    no_sessions: "No learning sessions",
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
                    growth_areas: "Personal growth areas",
                    creation_date: "Creation date",
                    hours: "Hours",
                    up_hours: "UP hours",
                    students_number: "Students number",
                    proposer_teacher: "Proposer teacher",
                    certifying_admin: "Certifying admin",
                    course_information_not_found: "Course information not found",
                    learning_sessions: "Learning sessions",
                    teacher_learning_session_selection_message: "Select a learning session to see the courses you teach or that has a teaching of yours associated",
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
                    area_credits: "Area credits",
                    auth: "Authentication",
                    username: "Username",
                    password: "Password",
                    admin: "Admin",
                    login: "Login",
                    wrong_username_or_password: "Wrong username or password",
                    server_error: "Server error",
                    no_username: "Username missing",
                    no_password: "Password missing",
                    reference_model: "Reference model",
                    possible_models: "Possible models",
                    characteristics: "Characteristics",
                    conduct: "Conduct",
                    teaching_list: "Teachings",
                    access_object: "Access",
                    teacher_list: "Teachers",
                    italian: "Italian",
                    english: "English",
                    propose: "Propose",
                    min_students: "Minimum students",
                    max_students: "Maximum students",
                    area_choice: "Choose a learning area",
                    growth_choice: "Choose a personal growth area",
                    learning_sessions_choice: "Choose a learning session",
                    learning_session_needed: "Learning session needed",
                    group_choice: "Choose a group",
                    grant_access: "Grant access",
                    add_teacher: "Add teacher",
                    teaching_choices: "Choose a teaching",
                    growth_area_choices: "Choose a personal growth area",
                    study_year: "Study year",
                    study_address: "Study address",
                    study_year_choice: "Choose a study year",
                    study_address_choice: "Choose a study address",
                    presidium: "Presidium",
                    main_study_year: "Main study year",
                    students_per_section: "Students per section",
                    students_distribution: "Students distribution",
                    num_section: "Numero di sezioni (1: A, 2: A and B, ...)",
                    teaching: "Insegnamento",
                    add: "Add",
                    study_address_needed: "Study address needed",
                    teachings: "Teachings",
                    no_teachings: "No teachings",
                    no_growth_areas: "No personal growth areas",
                    learning_context_needed: "Learning context needed",
                    no_access_proposition: "No access proposition for ordinary classes",
                    teacher_choice: "Teacher choice",
                    main_teacher: "Main teacher",
                    num_section_needed: "Number of section needed",
                    no_teacher_proposition: "No teacher proposed",
                    school_years: "School years",
                    no_school_years: "No school years",
                    project_class_confirmation_date: "Project class confirmation date",
                    edit: "Edit",
                    no_elements: "No elements",
                    curriculum: "Curriculum",
                    openbadges: "OpenBadges",
                    citizenship_report: "Citizenship report",
                    announcements: "Announcements",
                    settings: "Settings",
                    logout: "Logout",
                    project_courses: "Project courses",
                    ordinary_classes: "Ordinary classes",
                    course_proposal: "Course proposal",
                    course_proposals: "Course proposals",
                    learning_sessions_management: "Learning sessions management",
                    constraints_management: "Constraints management",
                    info: "Info",
                    specific_information: "Specific information",
                }
            },
            logged_user: false,
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