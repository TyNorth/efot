<template>
  <q-card class="my-card">
    <q-card-section>
      <div class="text-h6">Event Details</div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <q-input v-model="localEvent.title" label="Event Title" outlined dense />

      <q-input v-model="localEvent.description" label="Description (Optional)" outlined dense />

      <q-input v-model="localEvent.startDate" label="Start Date" outlined dense mask="date">
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="localEvent.startDate" mask="YYYY-MM-DD" />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <q-input v-model="localEvent.startTime" label="Start Time" outlined dense mask="time">
        <template v-slot:append>
          <q-icon name="access_time" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-time v-model="localEvent.startTime" mask="HH:mm" format24h />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <q-input v-model="localEvent.endDate" label="End Date (Optional)" outlined dense mask="date">
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="localEvent.endDate" mask="YYYY-MM-DD" />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <q-input v-model="localEvent.endTime" label="End Time (Optional)" outlined dense mask="time">
        <template v-slot:append>
          <q-icon name="access_time" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-time v-model="localEvent.endTime" mask="HH:mm" format24h />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <q-select
        v-model="localEvent.taskId"
        :options="taskOptions"
        label="Associate with Task (Optional)"
        outlined
        dense
        emit-value
        map-options
        clearable
      />

      <q-toggle v-model="localEvent.allDay" label="All Day Event" />
      <q-toggle v-model="localEvent.isReminder" label="Show on Reminders" />
    </q-card-section>

    <q-separator />

    <q-card-actions align="right">
      <q-btn label="Cancel" color="primary" flat @click="cancel" />
      <q-btn
        label="Save Changes"
        color="primary"
        :disable="!localEvent.title || !localEvent.startDate || !localEvent.startTime"
        @click="saveEvent"
      />
      <q-btn label="Delete" color="negative" @click="deleteEvent" />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useEfotStore } from 'src/stores/efot-store'
import { storeToRefs } from 'pinia'

const router = useRouter()
const route = useRoute()
const efotStore = useEfotStore()
const { taskLists } = storeToRefs(efotStore)

const localEvent = ref({
  title: '',
  description: '',
  startDate: '',
  startTime: '',
  endDate: null,
  endTime: null,
  allDay: false,
  taskId: null,
  isReminder: false,
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
  const eventId = route.params.eventId
  if (eventId) {
    const existingEvent = efotStore.getEventById(eventId)
    if (existingEvent) {
      localEvent.value = { ...existingEvent } // Deep copy
    } else {
      // Handle event not found (e.g., redirect)
      router.push({ name: 'calendar' })
    }
  } else {
    //It's creating a new event for that day
    localEvent.value.startDate = route.params.date
    localEvent.value.startTime = '08:00' //set a default start time
  }
})

const saveEvent = () => {
  if (localEvent.value.title && localEvent.value.startDate && localEvent.value.startTime) {
    if (localEvent.value.id) {
      //Update
      efotStore.updateCalendarEvent(localEvent.value.id, localEvent.value)
    } else {
      //Create
      efotStore.addCalendarEvent(localEvent.value)
    }
    router.push({ name: 'calendar' })
  }
}
const deleteEvent = () => {
  efotStore.removeCalendarEvent(localEvent.value.id)
  router.push({ name: 'calendar' })
}

const cancel = () => {
  router.push({ name: 'calendar' })
}
</script>
