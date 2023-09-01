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
        edit_user(state: any, user: UserProps | undefined) {
            state.user = user;
        },
        setLoggedUser(state: any, logged: boolean) {
            state.logged_user = logged;
        }
    },
    actions: {
        login({ commit }, user) {
            commit("edit_user", user);
        },
        logout({ commit }) {
            commit("edit_user", undefined);
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
                "student": [ // Da sistemare: spostare traduzioni, mettere riferimenti a title e fare rework del menu
                    {
                        title: {
                            italian: "Sessioni di apprendimento",
                            english: "Learning sessions"
                        },
                        url: '/learning_sessions',
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
                    { // Da sistemare: spostare in profilo quando verrà creato
                        title: {
                            italian: "Logout",
                            english: "Logout"
                        },
                        url: '/logout',
                        iconRef: "logout"
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
                        url: '/course_proposition',
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
                    { // Da sistemare: non deve apparire
                        title: {
                            italian: "Proposte corsi",
                            english: "Courses propositions"
                        },
                        url: '/propositions_history',
                        iconRef: "archive"
                    },
                    { // Da sistemare: spostare in profilo quando verrà creato
                        title: {
                            italian: "Logout",
                            english: "Logout"
                        },
                        url: '/logout',
                        iconRef: "logout"
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
                "admin": [
                    {
                        title: {
                            italian: "Corsi progetto",
                            english: "Project courses"
                        },
                        url: '/learning_sessions_management',
                        iconRef: "brief_case"
                    },
                    {
                        title: {
                            italian: "Proposte corsi",
                            english: "Courses propositions"
                        },
                        url: '/propositions_history',
                        iconRef: "archive"
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
                            italian: "Cittadinanza attiva",
                            english: "Citizenship report"
                        },
                        url: '/citizenship_report',
                        iconRef: "clipboard"
                    },
                    {
                        title: {
                            italian: "Gestione sessioni di apprendimento",
                            english: "Learning sessions management"
                        },
                        url: '/learning_sessions_management',
                        iconRef: "calendar"
                    },
                    {
                        title: {
                            italian: "Gestione vincoli",
                            english: "Constraints management"
                        },
                        url: '/constraints_management',
                        iconRef: "link"
                    },
                    { // Da sistemare: non deve apparire
                        title: {
                            italian: "Proposta corso",
                            english: "Course propose"
                        },
                        url: '/course_proposition',
                        iconRef: "add_circle"
                    },
                    { // Da sistemare: non deve apparire
                        title: {
                            italian: "Corsi progetto",
                            english: "Project courses"
                        },
                        url: '/project_courses',
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
                    { // Da sistemare: spostare in profilo quando verrà creato
                        title: {
                            italian: "Logout",
                            english: "Logout"
                        },
                        url: '/logout',
                        iconRef: "logout"
                    },
                    {
                        title: {
                            italian: "Info",
                            english: "Info"
                        },
                        url: '/info',
                        iconRef: "information_circle"
                    }
                ]
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
                    no_teachings: "Nessun insegnamento",
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
                    side_element_selection_message: "Seleziona elemento nella lista a fianco per quelli associati",
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
                    no_teachings: "No teachings",
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
                    side_element_selection_message: "Select an element in the side list to see the associated ones",
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