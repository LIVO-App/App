import { createApp } from 'vue'
import App from './App.vue'
import router from './router';

import { IonicVue } from '@ionic/vue';

import OuterHeader from "./components/OuterHeader.vue";
import InnerHeader from "./components/InnerHeader.vue";
import ListCard from "./components/ListCard.vue";
import ItemCard from "./components/itemCard.vue";

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
  /*.use(axios, {
      baseUrl: 'https://cataas.com/',
  })*/
  .provide("$axios",$axios)
  .component("OuterHeader",OuterHeader)
  .component("InnerHeader",InnerHeader)
  .component("ListCard",ListCard)
  .component("ItemCard",ItemCard);
  
router.isReady().then(() => {
  app.mount('#app');
});