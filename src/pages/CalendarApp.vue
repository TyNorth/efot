<template>
  <q-page class="flex q-ma-xs">
    <calendar-view />
  </q-page>
</template>

<script setup>
import CalendarView from 'src/components/CalendarView.vue'
</script>
<style>
::-webkit-scrollbar {
  display: none;
}
div.q-page-container {
  background-color: #1d1d1d;
}
</style>
