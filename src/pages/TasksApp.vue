<template>
  <q-page class="flex-grow q-ma-xl">
    <tasks-view />
  </q-page>
</template>

<script setup>
import TasksView from 'src/components/TasksView.vue'
</script>
<style>
::-webkit-scrollbar {
  display: none;
}

div.q-page-container {
  background-color: #1d1d1d;
}
</style>
