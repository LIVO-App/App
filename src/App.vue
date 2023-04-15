<template>
  <ion-app>
    <ion-split-pane content-id="main-content">
      <ion-menu content-id="main-content" type="overlay">
        <ion-content>
          <ion-list id="menu-list">
            <ion-list-header class="ion-padding-bottom">
              <ion-img :src="image" alt="LIVO Campus Logo" style="height: 90px;"></ion-img>
            </ion-list-header>

            <ion-menu-toggle auto-hide="false" v-for="(p, i) in menu[role]" :key="i">
              <ion-item @click="selectedIndex = i" router-direction="root" :router-link="p.url" lines="none" detail="false" class="hydrated" :class="{ selected: selectedIndex === i }">
                <ion-icon aria-hidden="true" slot="start" :ios="p.iosIcon" :md="p.mdIcon"></ion-icon>
                <ion-label>{{ p.title[language] }}</ion-label>
              </ion-item>
            </ion-menu-toggle>
          </ion-list>
        </ion-content>
      </ion-menu>
      <ion-router-outlet id="main-content"></ion-router-outlet>
    </ion-split-pane>
  </ion-app>
</template>

<script setup lang="ts">
import {
  IonApp,
  IonContent,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonRouterOutlet,
  IonSplitPane,
} from '@ionic/vue';
import { ref, computed } from 'vue';
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

//Types
type MenuTitle = {
  [key: string]: string
}
type MenuItem = {
  title: MenuTitle,
  url: string,
  iosIcon: any,
  mdIcon: any
};
type Menu = {
  [key: string]: MenuItem[]
};

//Data
const image = computed(() => require("./assets/Logo_LIVO_Campus_POS_RGB.png"))
const selectedIndex = ref(0);
const language = "italian";
const role = "student";
const menu: Menu = {
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
};

//Set menu index
const path = window.location.pathname;
if (path !== undefined) {
  selectedIndex.value = menu[role].findIndex((page) => page.url === path);
}
</script>

<style scoped>
ion-menu ion-content {
  --background: var(--ion-item-background, var(--ion-background-color, #fff));
}

ion-menu.md ion-content {
  --padding-start: 8px;
  --padding-end: 8px;
  --padding-top: 20px;
  --padding-bottom: 20px;
}

ion-menu.md ion-list {
  padding: 20px 0;
}

ion-menu.md ion-note {
  margin-bottom: 30px;
}

ion-menu.md ion-list-header,
ion-menu.md ion-note {
  padding-left: 10px;
}

ion-menu.md ion-list#menu-list {
  border-bottom: 1px solid var(--ion-color-step-150, #d7d8da);
}

ion-menu.md ion-list#menu-list ion-list-header {
  font-size: 22px;
  font-weight: 600;

  min-height: 20px;
}

ion-menu.md ion-item {
  --padding-start: 10px;
  --padding-end: 10px;
  border-radius: 4px;
}

ion-menu.md ion-item.selected {
  --background: rgba(var(--ion-color-primary-rgb), 0.14);
}

ion-menu.md ion-item.selected ion-icon {
  color: var(--ion-color-primary);
}

ion-menu.md ion-item ion-icon {
  color: #616e7e;
}

ion-menu.md ion-item ion-label {
  font-weight: 500;
}

ion-menu.ios ion-content {
  --padding-bottom: 20px;
}

ion-menu.ios ion-list {
  padding: 20px 0 0 0;
}

ion-menu.ios ion-note {
  line-height: 24px;
  margin-bottom: 20px;
}

ion-menu.ios ion-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --min-height: 50px;
}

ion-menu.ios ion-item.selected ion-icon {
  color: var(--ion-color-primary);
}

ion-menu.ios ion-item ion-icon {
  font-size: 24px;
  color: #73849a;
}

ion-menu.ios ion-list-header,
ion-menu.ios ion-note {
  padding-left: 16px;
  padding-right: 16px;
}

ion-menu.ios ion-note {
  margin-bottom: 8px;
}

ion-note {
  display: inline-block;
  font-size: 16px;

  color: var(--ion-color-medium-shade);
}

ion-item.selected {
  --color: var(--ion-color-primary);
}
</style>
