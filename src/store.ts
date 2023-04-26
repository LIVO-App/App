import { createStore } from "vuex";

import {
    addCircleOutline,
    addCircleSharp,
    briefcaseOutline,
    briefcaseSharp,
    clipboardOutline,
    clipboardSharp,
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
                    iosIcon: easelOutline,
                    mdIcon: easelSharp,
                },
                {
                    title: {
                        italian: "Curriculum",
                        english: "Curriculum"
                    },
                    url: '/curriculum',
                    iosIcon: schoolOutline,
                    mdIcon: schoolSharp,
                },
                {
                    title: {
                        italian: "ObenBadge",
                        english: "OpenBadges"
                    },
                    url: '/openbadges',
                    iosIcon: ribbonOutline,
                    mdIcon: ribbonSharp,
                },
                {
                    title: {
                        italian: "Cittadinanza attiva",
                        english: "Citizenship report"
                    },
                    url: '/citizenship_report',
                    iosIcon: clipboardOutline,
                    mdIcon: clipboardSharp,
                },
                {
                    title: {
                        italian: "Impostazioni",
                        english: "Settings"
                    },
                    url: '/settings',
                    iosIcon: settingsOutline,
                    mdIcon: settingsSharp,
                },
                {
                    title: {
                        italian: "Info",
                        english: "Info"
                    },
                    url: '/info',
                    iosIcon: informationCircleOutline,
                    mdIcon: informationCircleSharp,
                }
            ],
            "teacher": [
                {
                    title: {
                        italian: "Corsi progetto",
                        english: "Project courses"
                    },
                    url: '/project_courses',
                    iosIcon: briefcaseOutline,
                    mdIcon: briefcaseSharp,
                },
                {
                    title: {
                        italian: "Proposta corso",
                        english: "Course propose"
                    },
                    url: '/course_propose',
                    iosIcon: addCircleOutline,
                    mdIcon: addCircleSharp,
                },
                {
                    title: {
                        italian: "Impostazioni",
                        english: "Settings"
                    },
                    url: '/settings',
                    iosIcon: settingsOutline,
                    mdIcon: settingsSharp,
                },
                {
                    title: {
                        italian: "Info",
                        english: "Info"
                    },
                    url: '/info',
                    iosIcon: informationCircleOutline,
                    mdIcon: informationCircleSharp,
                }
            ],
            "admin": []
            },
            menuIndex: 0,
            language: "italian",
            user: {
                id: 1,
                username: "Student1",
                user: "student",
            }
        }
    }
});