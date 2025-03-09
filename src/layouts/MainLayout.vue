<template>
  <q-layout view="lHh Lpr lFf">
    <q-header dark style="background-color: #1d1d1d">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          :icon="leftDrawerOpen ? 'sym_o_menu_open' : 'sym_o_menu'"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title> Extremely Focused Organizational Tool </q-toolbar-title>

        <div>EFOT v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      @mouseenter="miniState = false"
      @mouseleave="miniState = true"
      :mini="miniState"
      v-model="leftDrawerOpen"
      show-if-above
      class="left-drawer"
    >
      <q-list>
        <q-item-label header> EFOT </q-item-label>

        <EssentialLink v-for="(linkItem, index) in linksList" :key="index" v-bind="linkItem" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'
import { useRoute } from 'vue-router' // Import useRoute

const linksList = [
  {
    title: 'Calendar',
    //caption: 'quasar.dev',
    icon: 'sym_o_calendar_month',
    link: { name: 'calendar' },
  },
  {
    title: 'Tasks',
    //caption: 'github.com/quasarframework',
    icon: 'sym_o_checklist',
    link: { name: 'tasks' },
  },
]

const leftDrawerOpen = ref(false)
const miniState = ref(true)
const route = useRoute() // Get the current route

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
<style>
.q-drawer__content .left-drawer {
  border-left: 1px solid #ccc !important;
}
</style>
