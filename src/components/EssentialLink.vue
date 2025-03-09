<template>
  <q-item clickable :to="link" v-if="typeof link === 'string'" :active="isActive">
    <q-item-section v-if="icon" :avatar="!mini">
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section v-if="!mini">
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
  <q-item
    clickable
    :to="{ name: link.name, params: link.params, query: link.query }"
    v-else
    :active="isActive"
  >
    <q-item-section v-if="icon" :avatar="!mini">
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section v-if="!mini">
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup>
import { defineProps, computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    default: '',
  },
  link: {
    type: [String, Object], // Allow string or object
    required: true,
  },
  icon: {
    type: String,
    default: '',
  },
  mini: {
    //new prop to check the mini state
    type: Boolean,
    default: false,
  },
})

const { title, caption, link, icon, mini } = props // Destructure for easier use in template
const route = useRoute()

const isActive = computed(() => {
  if (typeof link === 'string') {
    return false // External links are never active in this context
  }
  // Check if the current route's name matches the link's name
  return route.name === link.name
})
</script>
