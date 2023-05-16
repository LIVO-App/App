import { ComponentCustomProperties } from "vue";
import { Store } from "vuex";
import { ElementsList, IconAlternatives, IconsList, Language, Menu } from "./types";

declare module '@vue/runtime-core' {
  //Declare your own store states
  interface State {
    menu: Menu,
    menuIndex: number,
    icons: IconsList,
    language: Language,
    elements: ElementsList
    role: string
  }

  interface ComponentCustomProperties {
    $store: Store<State>
  }
}