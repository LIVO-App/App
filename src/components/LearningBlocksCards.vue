<template>
    <ion-grid><!-- v-if="learning_blocks.loaded">-->
        <ion-row>
            <ion-col size="12" size-md="6">
                <list-card :title="elements.current[store.state.language]" :cards="learning_blocks.current" />
                <list-card :title="elements.future[store.state.language]" :cards="learning_blocks.future" />
            </ion-col>
            <ion-col size="12" size-md="6">
                <list-card :title="elements.upcoming[store.state.language]" :cards="learning_blocks.upcoming" />
                <list-card :title="elements.completed[store.state.language]" :cards="learning_blocks.completed" />
            </ion-col>
        </ion-row>
    </ion-grid>
</template>

<script setup lang="ts">
import { Language, BaseElement, CardElements, CourseSummary, LearningArea, LearningBlockStatus, OrdinaryClass, LearningBlock } from '@/types';
import { IonGrid, IonRow, IonCol } from "@ionic/vue"
import { inject, reactive } from 'vue';
import { useStore,Store } from 'vuex';
import type {AxiosInstance} from 'axios';
import { getCurrentSchoolYear, getLearningBlockStatus } from '@/utils'

async function getDividedCourseList($axios: AxiosInstance, language: Language, user_id: string, block: LearningBlock, learning_areas: LearningArea[]) {
  const courses : CourseSummary[] = (await $axios.get("/v1/courses?student_id=" + user_id + "&block_id=" + block.id)).data.data;
  let tmp_learning_area_id : string,
      tmp_learning_area : LearningArea | undefined,
      i : number,
      course_list = "";
  while (courses.length > 0) {
    tmp_learning_area_id = (courses[0].learning_area_ref.data as {id: string}).id;
    tmp_learning_area = learning_areas.find(area => area.id == tmp_learning_area_id);
    course_list += "<label>" + (tmp_learning_area != undefined ? tmp_learning_area[`${language}_title`] : "") + ":</label><br /><ul>";
    i = 0;
    while (i < courses.length) {
      if ((courses[i].learning_area_ref.data as {id: string}).id == tmp_learning_area_id) {
        course_list += "<li>" + courses[i][`${language}_title`] + "</li>";
        courses.splice(i,1);
      } else {
        i++;
      }
    }
  }

  return course_list;
}

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
const dateOptions = {
  year: "numeric",
  month: "2-digits",
  day: "2-digits"
}
const learning_blocks : {
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
} = reactive({  
    "current": {},
    "future": {},
    "upcoming": {},
    "completed": {}
});

const promises : Promise<any>[] = [];
const today = new Date();
let startDate : Date, endDate : Date, tenDaysBefore : Date,
  learningBlockStatus : LearningBlockStatus,
  learning_areas : LearningArea[],
  ordinary_classes : OrdinaryClass[],
  current_class : OrdinaryClass | undefined,
  current_school_year : number,
  tmp_element : CardElements,
  courses : CourseSummary[];
if ($axios != undefined) {
  ordinary_classes = await $axios.get("/v1/ordinary_classes?student_id=" + store.state.user.id)
    .then(response => response.data.data);/* = [{
    study_year_id: 1,
    study_address_id: "BIO",
    school_year: 2021
  },{
    study_year_id: 2,
    study_address_id: "BIO",
    school_year: 2022
  }];
  ordinary_classes.sort((a,b) => a.school_year < b.school_year ? 1 : a.school_year > b.school_year ? -1 : 0);*/
  current_class = ordinary_classes.shift();
  current_school_year = current_class != undefined ? current_class.school_year : getCurrentSchoolYear();
  if (current_class != undefined) {
    learning_areas = await $axios.get("/v1/learning_areas?all_data=true").then(response => response.data.data);
    for (const oc of ordinary_classes) {
      promises.push($axios.get("/v1/learning_blocks?school_year=" + oc.school_year).then(async (response) => {
        learning_blocks.completed[oc.school_year] = [];
        for (const block of response.data.data) {
          tmp_element = {
            id: block.id,
            group: oc.school_year,
            title: "Blocco " + block.number,
            subtitle: (new Date(block.start)).toLocaleDateString("en-GB") + " - " + (new Date(block.end)).toLocaleDateString("en-GB"),
            content: "",
            url: "learning_blocks/" + block.id
          };
          learning_blocks.completed[oc.school_year].push(tmp_element);
        }
      }).catch(() => console.error("Learning blocks not retrieved")));
    }
    promises.push($axios.get("/v1/learning_blocks?school_year=" + current_school_year).then(async (response) => {
      for (const block of response.data.data) {
        startDate = new Date(block.start);
        endDate = new Date(block.end);
        tenDaysBefore = new Date(startDate);
        tenDaysBefore.setDate(tenDaysBefore.getDate() - 10);
        learningBlockStatus = getLearningBlockStatus(block,today);

        switch (learningBlockStatus) {
          case LearningBlockStatus.FUTURE:
            tmp_element = {
              id: block.id,
              group: current_school_year,
              title: "Blocco " + block.number,
              subtitle: startDate.toLocaleDateString("en-GB") + " - " + endDate.toLocaleDateString("en-GB"),
              content: "<label>Vincoli crediti:</label><ul>",
              url: "learning_blocks/" + block.id
            };
            learning_areas = await $axios.get("/v1/learning_areas?all_data=true&credits=true&block_id=" + block.id)
              .then(response => response.data.data)
              .catch(() => []);
              
            for (const area of learning_areas) {
              courses = await $axios.get("/v1/courses?student_id=" + store.state.user.id + "&block_id=" + block.id + "&area_id=\"" + area.id + "\"")
                .then(response => response.data.data)
                .catch(() => []);
              tmp_element.content += "<li>" + area[`${store.state.language as Language}_title`] + ": " + courses.reduce((pv, cv) => pv + cv.credits, 0) + "/" + area.credits + "</li>";
            }
            tmp_element.content += "</ul>";
            if (learning_blocks.future[''] == null){
              learning_blocks.future[''] = [tmp_element];
            } else {
              learning_blocks.future[''].push(tmp_element);
            }
            break;
          case LearningBlockStatus.UPCOMING:
            tmp_element = {
              id: block.id,
              group: current_school_year,
              title: "Blocco " + block.number,
              subtitle: startDate.toLocaleDateString("en-GB") + " - " + endDate.toLocaleDateString("en-GB"),
              content: "",
              url: "learning_blocks/" + block.id
            };
            tmp_element.content = await getDividedCourseList($axios,store.state.language as Language,store.state.user.id,block,learning_areas);
            learning_blocks.upcoming[''] = [tmp_element];
            break;
          case LearningBlockStatus.CURRENT:
            tmp_element = {
              id: block.id,
              group: current_school_year,
              title: "Blocco " + block.number,
              subtitle: startDate.toLocaleDateString("en-GB") + " - " + endDate.toLocaleDateString("en-GB"),
              content: "",
              url: "learning_blocks/" + block.id
            };
            tmp_element.content = await getDividedCourseList($axios,store.state.language as Language,store.state.user.id,block,learning_areas);
            learning_blocks.current[''] = [tmp_element];
            break;
          case LearningBlockStatus.COMPLETED:
            tmp_element = {
              id: block.id,
              group: current_school_year,
              title: "Blocco " + block.number,
              subtitle: startDate.toLocaleDateString("en-GB") + " - " + endDate.toLocaleDateString("en-GB"),
              content: "",
              url: "learning_blocks/" + block.id
            };
            if (learning_blocks.completed[block.school_year] == undefined) {
              learning_blocks.completed[block.school_year] = [tmp_element];
            } else {
              learning_blocks.completed[block.school_year].push(tmp_element);
            }
            break;
        }
      }
    }).catch(err => console.error(err)));
    await Promise.all(promises)/*.then(() => {
      learning_blocks.loaded = true;
    });*/
  } else {
    console.error("Connection failed");
  }
}
</script>

<style>

</style>