<template>
  <q-card flat class="full-height">
    <q-card-section class="bg-primary text-white">
      <div class="text-h6">Reminders</div>
      <div class="row items-center q-gutter-sm">
        <q-input dense outlined v-model="selectedDateFormatted" readonly type="date">
          <template v-slot:append>
            <q-icon name="sym_o_event" class="cursor-pointer">
              <q-popup-proxy transition-show="scale" transition-hide="scale">
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

    <q-card-section class="q-pa-none flex-grow">
      <q-list dense class="full-height-scrollable">
        <q-item
          v-for="reminder in combinedReminders"
          :key="reminder.id + reminder.type"
          clickable
          @click="goToReminder(reminder)"
        >
          <q-item-section avatar>
            <q-icon
              :name="reminder.type === 'event' ? 'sym_o_event' : 'sym_o_checklist'"
              :color="reminder.type === 'event' ? 'blue' : reminder.priority ? 'red' : 'green'"
            />
          </q-item-section>

          <q-item-section>
            <q-item-label>
              {{ reminder.title }}
              <span
                v-if="reminder.type === 'task' && getListName(reminder.listId)"
                class="text-grey"
              >
                ({{ getListName(reminder.listId) }})
              </span>
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
    <q-card-section v-if="combinedReminders.length === 0" class="flex flex-center">
      <p class="text-center">No reminders for {{ formattedSelectedDate }}</p>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEfotStore } from 'src/stores/efot-store'
import { storeToRefs } from 'pinia'
import { date } from 'quasar'
import { useRouter } from 'vue-router'

const efotStore = useEfotStore()
const { tasksWithReminders, eventsWithReminders, getTaskListById } = storeToRefs(efotStore) // Get reactive getters
const selectedDate = ref(date.startOfDate(new Date(), 'day')) // Use Date object internally
const router = useRouter()

const selectedDateFormatted = computed(() => {
  return date.formatDate(selectedDate.value, 'YYYY-MM-DD')
})

const formattedSelectedDate = computed(() => {
  return date.formatDate(selectedDate.value, 'dddd, MMMM D, YYYY')
})

onMounted(() => {
  efotStore.initializeStore()
})

// Getter for list name, for reactivity
const getListName = (listId) => {
  const list = efotStore.getTaskListById(listId) // Use the getter
  return list ? list.name : 'Unknown List'
}

const combinedReminders = computed(() => {
  const reminders = []
  const selectedDateObj = date.startOfDate(selectedDate.value, 'day')

  // Add calendar events
  eventsWithReminders.value.forEach((event) => {
    const eventStartDate = date.startOfDate(new Date(event.startDate), 'day')
    const eventEndDate = event.endDate
      ? date.startOfDate(new Date(event.endDate), 'day')
      : eventStartDate
    if (
      date.isBetweenDates(selectedDateObj, eventStartDate, eventEndDate, {
        inclusiveFrom: true,
        inclusiveTo: true,
      })
    ) {
      reminders.push({
        id: event.id,
        type: 'event',
        title: event.title,
        description: event.description,
        time: event.allDay ? 'All Day' : event.startTime,
        dateTime: event.allDay ? eventStartDate : new Date(event.startDate + 'T' + event.startTime), // For sorting
      })
    }
  })

  // Add tasks with reminders
  tasksWithReminders.value.forEach((task) => {
    const reminderDate = task.reminderDate
      ? date.startOfDate(new Date(task.reminderDate), 'day')
      : null
    if (reminderDate && date.isSameDate(reminderDate, selectedDateObj, 'day')) {
      const taskDateTime = new Date(task.reminderDate + 'T' + (task.reminderTime || '00:00'))
      reminders.push({
        id: task.id,
        type: 'task',
        title: task.label,
        listName: task.listId, // Store listId directly
        time: task.reminderTime || 'All Day', // Default to All Day
        priority: task.priority,
        dateTime: taskDateTime, // For sorting.
        listId: task.listId,
      })
    }
  })

  // Sort by: 1. Priority (tasks only), 2. Date/Time
  reminders.sort((a, b) => {
    // Prioritize tasks by 'priority' flag
    if (a.type === 'task' && b.type === 'task') {
      if (a.priority && !b.priority) return -1
      if (!a.priority && b.priority) return 1
    }
    // Then sort all items by date and time
    return a.dateTime - b.dateTime // Use Date objects for comparison
  })

  return reminders
})

const dateChanged = (newDate) => {
  selectedDate.value = date.startOfDate(new Date(newDate), 'day') //CRUCIAL change
}

const goToToday = () => {
  selectedDate.value = date.startOfDate(new Date(), 'day') //CRUCIAL change
}

const prevDay = () => {
  selectedDate.value = date.startOfDate(
    date.subtractFromDate(selectedDate.value, { days: 1 }),
    'day',
  ) //CRUCIAL change
}
const nextDay = () => {
  selectedDate.value = date.startOfDate(date.addToDate(selectedDate.value, { days: 1 }), 'day') //CRUCIAL change
}

const removeTaskReminder = (reminder) => {
  efotStore.updateTask(reminder.listId, reminder.id, { reminderDate: null, reminderTime: null })
}

const removeEventReminder = (reminder) => {
  efotStore.updateCalendarEvent(reminder.id, { isReminder: false })
}

const goToReminder = (reminder) => {
  if (reminder.type === 'event') {
    router.push({ name: 'editEvent', params: { eventId: reminder.id } })
  }
  //TODO: else go to task
}
</script>
<style scoped>
.full-height {
  height: 100%;
}
.full-height-scrollable {
  height: 100%;
  overflow: auto;
}
</style>
