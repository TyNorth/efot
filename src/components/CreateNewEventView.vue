<template>
  <q-card class="my-card">
    <q-card-section>
      <div class="text-h6">Create New Event</div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <q-input v-model="event.title" label="Event Title" outlined dense autofocus />

      <q-input v-model="event.description" label="Description (Optional)" outlined dense />

      <q-input v-model="event.startDate" label="Start Date" outlined dense mask="date">
        <template v-slot:append>
          <q-icon name="sym_o_event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="event.startDate" mask="YYYY-MM-DD" />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <q-input v-model="event.startTime" label="Start Time" outlined dense mask="time">
        <template v-slot:append>
          <q-icon name="sym_o_access_time" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-time v-model="event.startTime" mask="HH:mm" format24h />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <q-input v-model="event.endDate" label="End Date (Optional)" outlined dense mask="date">
        <template v-slot:append>
          <q-icon name="sym_o_event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="event.endDate" mask="YYYY-MM-DD" />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <q-input v-model="event.endTime" label="End Time (Optional)" outlined dense mask="time">
        <template v-slot:append>
          <q-icon name="sym_o_access_time" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-time v-model="event.endTime" mask="HH:mm" format24h />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
      <q-select
        v-model="event.taskId"
        :options="taskOptions"
        label="Associate with Task (Optional)"
        outlined
        dense
        emit-value
        map-options
        clearable
      />

      <q-toggle v-model="event.allDay" label="All Day Event" />
      <q-toggle v-model="event.isReminder" label="Show on Reminders" />
    </q-card-section>

    <q-separator />

    <q-card-actions align="right">
      <q-btn label="Cancel" color="primary" flat @click="cancel" />
      <q-btn
        label="Create Event"
        color="primary"
        :disable="!event.title || !event.startDate || !event.startTime"
        @click="createEvent"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useEfotStore } from 'src/stores/efot-store'
import { storeToRefs } from 'pinia'

const router = useRouter()
const efotStore = useEfotStore()
const { taskLists } = storeToRefs(efotStore)
const route = useRoute()

const event = ref({
  title: '',
  description: '',
  startDate: '',
  startTime: '08:00', // Default start time
  endDate: '',
  endTime: null,
  allDay: false,
  taskId: null, // Initialize taskId
  isReminder: false, // Initialize isReminder
})

const taskOptions = computed(() => {
  const allTasks = []
  efotStore.taskLists.forEach((list) => allTasks.push(...list.tasks))
  return allTasks.map((task) => ({
    label: task.label,
    value: task.id,
  }))
})

onMounted(() => {
  // Get date from route params, if available
  if (route.params.date) {
    event.value.startDate = route.params.date
    event.value.endDate = route.params.date
  }
})

const createEvent = () => {
  if (event.value.title && event.value.startDate && event.value.startTime) {
    efotStore.addCalendarEvent(event.value)
    router.push({ name: 'calendar' }) // Navigate back to calendar
  }
}

const cancel = () => {
  router.push({ name: 'calendar' }) // Navigate back to calendar
}
</script>
