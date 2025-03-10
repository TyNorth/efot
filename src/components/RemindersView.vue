<template>
  <q-card flat>
    <q-card-section class="bg-primary text-white">
      <div class="text-h6">Reminders</div>
      <div class="row items-center q-gutter-sm">
        <q-input dense outlined v-model="selectedDate" readonly>
          <template v-slot:append>
            <q-icon name="sym_o_event" class="cursor-pointer">
              <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                <q-date v-model="selectedDate" mask="YYYY-MM-DD" @update:model-value="dateChanged">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>

        <q-btn-group flat>
          <q-btn @click="goToToday" icon="sym_o_today" label="Today" />
          <q-btn @click="prevDay" icon="sym_o_arrow_back" aria-label="Previous day" />
          <q-btn @click="nextDay" icon="sym_o_arrow_forward" aria-label="Next day" />
        </q-btn-group>
      </div>
    </q-card-section>

    <q-card-section v-if="combinedReminders.length > 0">
      <q-list>
        <q-item v-for="reminder in combinedReminders" :key="reminder.id + reminder.type" clickable>
          <q-item-section avatar>
            <q-icon
              :name="reminder.type === 'event' ? 'sym_o_event' : 'sym_o_checklist'"
              :color="reminder.type === 'event' ? 'blue' : reminder.priority ? 'red' : 'green'"
            />
          </q-item-section>

          <q-item-section>
            <q-item-label>
              {{ reminder.title }}
              <span v-if="reminder.type === 'task' && reminder.listName" class="text-grey">
                ({{ reminder.listName }})</span
              >
            </q-item-label>
            <q-item-label caption>
              {{ reminder.time }}
            </q-item-label>
            <q-item-label v-if="reminder.type === 'event' && reminder.description" caption>
              {{ reminder.description }}
            </q-item-label>
          </q-item-section>

          <q-item-section v-if="reminder.type === 'task'" side>
            <q-btn
              flat
              round
              dense
              icon="sym_o_delete"
              color="negative"
              @click.stop="removeTaskReminder(reminder)"
              aria-label="Remove Task Reminder"
            />
          </q-item-section>
          <q-item-section v-else side>
            <q-btn
              flat
              round
              dense
              icon="sym_o_delete"
              color="negative"
              @click.stop="removeEventReminder(reminder)"
              aria-label="Remove Event Reminder"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
    <q-card-section v-else>
      <p class="text-center">No reminders for {{ formattedSelectedDate }}</p>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEfotStore } from 'src/stores/efot-store'
import { storeToRefs } from 'pinia'
import { date } from 'quasar'

const efotStore = useEfotStore()
const { tasksWithReminders, eventsWithReminders } = storeToRefs(efotStore) // Reactive refs
const selectedDate = ref(date.formatDate(new Date(), 'YYYY-MM-DD')) // YYYY-MM-DD format

const formattedSelectedDate = computed(() => {
  return date.formatDate(selectedDate.value, 'dddd, MMMM D, YYYY')
})
onMounted(() => {
  efotStore.initializeStore() //ensure store is initialized
})

const combinedReminders = computed(() => {
  const reminders = []

  // Add calendar events
  eventsWithReminders.value.forEach((event) => {
    //Check if event is in range
    if (
      date.isBetweenDates(
        selectedDate.value,
        event.startDate,
        event.endDate ? event.endDate : event.startDate,
        { inclusiveFrom: true, inclusiveTo: true },
      )
    ) {
      reminders.push({
        id: event.id,
        type: 'event',
        title: event.title,
        description: event.description,
        time: event.allDay ? 'All Day' : event.startTime,
        date: event.startDate, //needed for sorting
      })
    }
  })

  // Add tasks with reminders
  tasksWithReminders.value.forEach((task) => {
    if (date.isSameDate(task.reminderDate, selectedDate.value, 'day')) {
      const list = efotStore.getTaskListById(task.listId)
      reminders.push({
        id: task.id,
        type: 'task',
        title: task.label,
        listName: list ? list.name : 'Unknown List', // Handle cases where list might be deleted
        time: task.reminderTime,
        priority: task.priority,
        date: task.reminderDate, //needed for sorting
        listId: task.listId, //needed for removing
      })
    }
  })

  // Sort by priority (high priority first) and then by time
  reminders.sort((a, b) => {
    if (a.type === 'task' && b.type === 'task') {
      if (a.priority && !b.priority) return -1
      if (!a.priority && b.priority) return 1
    }
    //sort by time
    return a.time.localeCompare(b.time)
  })

  return reminders
})

const dateChanged = () => {
  //Any logic needed when date changes
}
const goToToday = () => {
  selectedDate.value = date.formatDate(new Date(), 'YYYY-MM-DD')
}

const prevDay = () => {
  selectedDate.value = date.subtractFromDate(selectedDate.value, { days: 1, months: 0, years: 0 })
}
const nextDay = () => {
  selectedDate.value = date.addToDate(selectedDate.value, { days: 1, months: 0, years: 0 })
}

const removeTaskReminder = (reminder) => {
  efotStore.updateTask(reminder.listId, reminder.id, { reminderDate: null, reminderTime: null })
}

const removeEventReminder = (reminder) => {
  efotStore.updateCalendarEvent(reminder.id, { isReminder: false })
}
</script>
