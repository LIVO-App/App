<template>
  <ion-page>
    <outer-header :title="store.state.menu[store.state.user.user][store.state.menuIndex].title[store.state.language]" />

    <ion-content :fullscreen="true">
      <inner-header :title="store.state.menu[store.state.user.user][store.state.menuIndex].title[store.state.language]" />

      <ion-grid v-if="learning_blocks.loaded">
        <ion-row>
          <ion-col size="12" size-md="6">
            <list-card :title="elements.current[store.state.language]" :cards="learning_blocks.data.current" />
            <list-card :title="elements.future[store.state.language]" :cards="learning_blocks.data.future" />
          </ion-col>
          <ion-col size="12" size-md="6">
            <list-card :title="elements.upcoming[store.state.language]" :cards="learning_blocks.data.upcoming" />
            <list-card :title="elements.completed[store.state.language]" :cards="learning_blocks.data.completed" />
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { BaseElement, CardElements, OrdinaryClass } from '@/types';
import { IonContent, IonPage, IonCol, IonGrid, IonRow } from '@ionic/vue';
import { inject,nextTick, reactive } from 'vue';
import { useStore } from 'vuex';
import type {AxiosInstance} from 'axios';

const $axios : AxiosInstance | undefined = inject("$axios");
const store = useStore();

const elements : {
  [key: string]: BaseElement
} = {
  current: {
    "italian": "Corrente",
    "english": "Current"
  },
  future: {
    "italian": "Futuri",
    "english": "Future"
  },
  upcoming: {
    "italian": "Imminente",
    "english": "Upcoming"
  },
  completed: {
    "italian": "Completati",
    "english": "Completed"
  }
}
const learning_blocks : {
  loaded: boolean,
  data: {
    current: {
      [key: string]: CardElements[]
    },
    future: {
      [key: string]: CardElements[]
    },
    upcoming: {
      [key: string]: CardElements[]
    },
    completed: {
      [key: number]: CardElements[]
    }
  }
} = reactive({
  loaded: false,
  data: {
    "current": {},
    "future": {},
    "upcoming": {},
    "completed": {}
  }
});
const ordinary_classes : OrdinaryClass[] = [{
  study_year_id: 1,
  study_address_id: "BIO",
  school_year: 2021
},{
  study_year_id: 2,
  study_address_id: "BIO",
  school_year: 2022
}];
ordinary_classes.sort((a,b) => a.school_year < b.school_year ? 1 : a.school_year > b.school_year ? -1 : 0);
const current_class = ordinary_classes.shift();
const promises : Promise<any>[] = [];
const today = new Date();
let startDate : Date, endDate : Date, tenDaysBefore : Date, tmpElement : CardElements;
if (current_class != undefined) {
  if ($axios != undefined) {
    for (const oc of ordinary_classes) {
      promises.push($axios.get("/v1/learning_blocks?school_year=" + oc.school_year).then((response) => {
        learning_blocks.data.completed[oc.school_year] = [];
        for (const block of response.data.data) {
          tmpElement = {
            id: block.id,
            group: oc.school_year,
            title: "Blocco " + block.number,
            subtitle: (new Date(block.start)).toDateString() + " - " + (new Date(block.end)).toDateString(),
            content: "",
            url: ""
          };
          learning_blocks.data.completed[oc.school_year].push(tmpElement)
        }
      }).catch(() => console.error("Learning blocks not retrieved")));
    }
    promises.push($axios.get("/v1/learning_blocks?school_year=" + current_class.school_year).then((response) => {
      for (const learning_block of response.data.data) {
        startDate = new Date(learning_block.start);
        endDate = new Date(learning_block.end);
        tenDaysBefore = new Date(startDate);
        tenDaysBefore.setDate(tenDaysBefore.getDate() - 10);
        
        if (today < tenDaysBefore) { // future [TDB] upcoming [SD] current [ED] completed
          tmpElement = {
            id: learning_block.id,
            group: current_class.school_year,
            title: "Blocco " + learning_block.number,
            subtitle: startDate.toDateString() + " - " + endDate.toDateString(),
            content: "",
            url: ""
          };
          if (learning_blocks.data.future[''] == null){
            learning_blocks.data.future[''] = [tmpElement];
          } else {
            learning_blocks.data.future[''].push(tmpElement);
          }
        } else if (today >= tenDaysBefore && today < startDate) {
          tmpElement = {
            id: learning_block.id,
            group: current_class.school_year,
            title: "Blocco " + learning_block.number,
            subtitle: startDate.toDateString() + " - " + endDate.toDateString(),
            content: "",
            url: ""
          };
          learning_blocks.data.upcoming[''] = [tmpElement];
        } else if (today >= startDate && today <= endDate) {
          tmpElement = {
            id: learning_block.id,
            group: current_class.school_year,
            title: "Blocco " + learning_block.number,
            subtitle: startDate.toDateString() + " - " + endDate.toDateString(),
            content: "",
            url: ""
          };
          learning_blocks.data.current[''] = [tmpElement];
        } else if (today > endDate) {
          tmpElement = {
            id: learning_block.id,
            group: current_class.school_year,
            title: "Blocco " + learning_block.number,
            subtitle: startDate.toDateString() + " - " + endDate.toDateString(),
            content: "",
            url: ""
          };
          if (learning_blocks.data.completed[learning_block.school_year] == undefined) {
            learning_blocks.data.completed[learning_block.school_year] = [tmpElement];
          } else {
            learning_blocks.data.completed[learning_block.school_year].push(tmpElement);
          }
        }
      }
    }).catch(err => console.error(err)));
    Promise.all(promises).then(() => {
      learning_blocks.loaded = true;
    });
  } else {
    console.error("Connection failed");
  }
}
</script>

<style scoped>
.scroll-items {
  justify-content: flex-start;
  flex-wrap: nowrap;
  overflow-x: scroll !important;
  overflow-y: hidden;
  max-height: 50%;
}
.scroll-items ion-col {
    display: flex;
    flex-wrap: nowrap;
}
</style>
