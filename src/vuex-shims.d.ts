import { ComponentCustomProperties } from "vue";
import { Store } from "vuex";
import { ElementsList, IconAlternatives, IconsList, Language, LearningContextSummary, Menu } from "./types";
import { Method } from "axios";

declare module '@vue/runtime-core' {
  //Declare your own store states
  interface State {
    menu: Menu,
    menuIndex: number,
    icons: IconsList,
    language: Language,
    elements: ElementsList
    user: {
      id: number,
      username: string,
      token: string,
      user: string
    },
    request: {
      url: string,
      method: Method,
      body?: Object
    },
    event: {
      name: string,
      data: {
        [key: string]: any
      }
    },
    hours_per_credit: number,
    grades_scale: {
      min: number,
      max: number
    },
    excluded_learning_contexts_id: number[],
    main_learning_context: LearningContextSummary
  }

  interface ComponentCustomProperties {
    $store: Store<State>
  }
}