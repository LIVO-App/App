import { createApp } from 'vue'
import App from './App.vue'
import router from './router';

import { IonicVue } from '@ionic/vue';

import OuterHeader from "./components/OuterHeader.vue";
import InnerHeader from "./components/InnerHeader.vue";
import LearningBlocksCards from "./components/LearningBlocksCards.vue";
import ListCard from "./components/ListCard.vue";
import ItemCard from "./components/itemCard.vue";
import LoadingComponent from "./components/LoadingComponent.vue";
import BlockDescription from "./components/BlockDescription.vue";
import CoursesSelectionList from "./components/CoursesSelectionList.vue";
import CustomSelect from "./components/CustomSelect.vue";
import CourseCard from "./components/CourseCard.vue";
import CurriculumList from "./components/CurriculumList.vue";
import IonicElement from "./components/IonicElement.vue";
import IonicTable from "./components/IonicTable.vue";
import GradesManager from "./components/GradesManager.vue";
import CourseDescription from "./components/CourseDescription.vue";
import LearningBlocksSelection from "./components/LearningBlocksSelection.vue";
import TeacherBlockCard from "./components/TeacherBlockCard.vue";
import ProjectClass from "./components/ProjectClass.vue";
import AnnouncementsComponent from "./components/AnnouncementsComponent.vue";
import AnnouncementViewer from "./components/AnnouncementViewer.vue";
import AnnouncementsPublisher from "./components/AnnouncementsPublisher.vue";

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme variables */
import './theme/variables.css';

import axios from 'axios'
//import axios from './plugins/axios'
import { store } from "./store"; 
//import VueSession from 'vue-session'

//axios.ts replacement
const options : {
  baseUrl?: string
  token?: string
} = {
  baseUrl: "http://localhost:5000/api",
};

const $axios = axios.create({
  baseURL: options.baseUrl,
  headers: {
      Authorization: options.token ? `Bearer ${options.token}` : '',
  }
})

const app = createApp(App)
  .use(store)
  .use(IonicVue)
  .use(router)
  //.use(VueSession)
  /*.use(axios, {
      baseUrl: 'https://cataas.com/',
  })*/
  .provide("$axios",$axios)
  .component("OuterHeader",OuterHeader)
  .component("InnerHeader",InnerHeader)
  .component("LearningBlocksCards",LearningBlocksCards)
  .component("ListCard",ListCard)
  .component("ItemCard",ItemCard)
  .component("LoadingComponent",LoadingComponent)
  .component("BlockDescription",BlockDescription)
  .component("CoursesSelectionList",CoursesSelectionList)
  .component("CustomSelect",CustomSelect)
  .component("CourseCard",CourseCard)
  .component("CurriculumList",CurriculumList)
  .component("IonicElement",IonicElement)
  .component("IonicTable",IonicTable)
  .component("GradesManager",GradesManager)
  .component("CourseDescription",CourseDescription)
  .component("LearningBlocksSelection",LearningBlocksSelection)
  .component("TeacherBlockCard",TeacherBlockCard)
  .component("ProjectClass",ProjectClass)
  .component("AnnouncementsComponent",AnnouncementsComponent)
  .component("AnnouncementViewer",AnnouncementViewer)
  .component("AnnouncementsPublisher",AnnouncementsPublisher);
  
router.isReady().then(() => {
  app.mount('#app');
});