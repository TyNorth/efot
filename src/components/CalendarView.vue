<template>
  <div class="calendar-view full-width full-height">
    <q-card flat bordered class="full-height">
      <q-card-section class="bg-primary text-white">
        <div class="row items-center justify-between">
          <div class="col">
            <div class="text-h6">{{ monthName }} {{ year }}</div>
          </div>
          <div class="col-auto">
            <q-btn
              flat
              round
              dense
              icon="sym_o_chevron_left"
              @click="prevMonth"
              :disable="isPreviousMonthDisabled"
              aria-label="Previous Month"
            />
            <q-btn
              flat
              round
              dense
              icon="sym_o_chevron_right"
              @click="nextMonth"
              :disable="isNextMonthDisabled"
              aria-label="Next Month"
            />
            <q-btn
              flat
              round
              dense
              icon="sym_o_add"
              @click="goToCreateEvent"
              aria-label="Add Event"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-pa-none full-height">
        <div class="row q-col-gutter-xs full-width">
          <div v-for="day in weekDays" :key="day" class="col text-center text-weight-bold">
            {{ day }}
          </div>
        </div>

        <div class="full-width full-height-available">
          <div
            v-for="(week, weekIndex) in calendarWeeks"
            :key="weekIndex"
            class="row q-col-gutter-xs"
          >
            <div
              v-for="(day, dayIndex) in week"
              :key="dayIndex"
              class="col relative-position calendar-day"
              @click="handleDayClick(day, $event)"
            >
              <q-btn
                :class="{
                  'full-width': true,
                  'text-grey-6': !isDateInCurrentMonth(day),
                  'bg-primary text-white': isToday(day) && isDateInCurrentMonth(day),
                  'bg-accent text-white': isSelected(day),
                  'q-px-sm': true,
                }"
                flat
                rounded
                dense
                :label="day ? day.getDate() : ''"
                :disable="!day"
              >
              </q-btn>

              <q-menu v-if="day && eventsForDay(day).length > 1" auto-close context-menu>
                <q-list>
                  <q-item
                    clickable
                    v-for="event in eventsForDay(day)"
                    :key="event.id"
                    @click="goToEditEvent(event)"
                  >
                    <q-item-section avatar>
                      <q-icon :color="getEventColor(event)" name="sym_o_event" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ event.title }}</q-item-label>
                      <q-item-label caption>{{ event.startTime }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>

              <div v-if="day" class="absolute-bottom-left q-pb-px q-pl-px flex column">
                <div
                  v-for="event in eventsForDay(day)"
                  :key="event.id"
                  class="event-label q-mb-[2px]"
                  :style="{ backgroundColor: getEventColor(event) }"
                  @click.stop="goToEditEvent(event)"
                >
                  {{ getEventLabel(event) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { date } from 'quasar'
import { useEfotStore } from 'src/stores/efot-store'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const currentDate = ref(new Date())
const year = ref(currentDate.value.getFullYear())
const month = ref(currentDate.value.getMonth())
const selectedDate = ref(null)
const efotStore = useEfotStore()
const { calendarEvents } = storeToRefs(efotStore)
const router = useRouter()

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

onMounted(() => {
  efotStore.initializeStore()
})

const monthName = computed(() => {
  return date.formatDate(new Date(year.value, month.value, 1), 'MMMM')
})

const calendarWeeks = computed(() => {
  const firstDayOfMonth = new Date(year.value, month.value, 1)
  const lastDayOfMonth = new Date(year.value, month.value + 1, 0)
  const startDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const weeks = []
  let currentWeek = []
  let dayCounter = 1

  for (let i = 0; i < startDayOfWeek; i++) {
    currentWeek.push(null)
  }

  while (dayCounter <= daysInMonth) {
    currentWeek.push(new Date(year.value, month.value, dayCounter))
    dayCounter++

    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }

  while (currentWeek.length < 7 && currentWeek.length > 0) {
    currentWeek.push(null)
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }

  return weeks
})

const isPreviousMonthDisabled = computed(() => {
  return false
})

const isNextMonthDisabled = computed(() => {
  return false
})

const prevMonth = () => {
  if (month.value === 0) {
    month.value = 11
    year.value--
  } else {
    month.value--
  }
  selectedDate.value = null
}

const nextMonth = () => {
  if (month.value === 11) {
    month.value = 0
    year.value++
  } else {
    month.value++
  }
  selectedDate.value = null
}

const isToday = (dateToCheck) => {
  if (!dateToCheck) return false
  return date.isSameDate(dateToCheck, new Date(), 'day')
}

const isDateInCurrentMonth = (dateToCheck) => {
  if (!dateToCheck) return false
  return dateToCheck.getMonth() === month.value
}

const isSelected = (dateToCheck) => {
  if (!dateToCheck || !selectedDate.value) return false
  return date.isSameDate(dateToCheck, selectedDate.value, 'day')
}

const handleDayClick = (day, event) => {
  if (day) {
    // Check if the click target has the 'event-label' class
    if (event.target.classList.contains('event-label')) {
      // If it's an event label, do nothing here (click is handled by the label itself)
    } else if (event.target.closest('.q-menu')) {
      // Click on the q-menu, also do nothing.
    } else {
      // Otherwise, it's a click on an empty space, go to create event
      goToCreateEvent(day)
    }
  }
}

const eventsForDay = (day) => {
  if (!day) return []
  return calendarEvents.value
    .filter((event) => {
      const eventStartDate = new Date(event.startDate)

      if (event.allDay) {
        return date.isSameDate(eventStartDate, day, 'day')
      }
      const eventEndDate = event.endDate ? new Date(event.endDate) : eventStartDate
      return date.isBetweenDates(day, eventStartDate, eventEndDate, {
        inclusiveFrom: true,
        inclusiveTo: true,
      })
    })
    .sort((a, b) => {
      const timeA = a.startTime || ''
      const timeB = b.startTime || ''
      return timeA.localeCompare(timeB)
    })
}

const getEventColor = (event) => {
  return 'green'
}

const goToCreateEvent = (day = null) => {
  const formattedDate = day ? date.formatDate(day, 'YYYY-MM-DD') : null
  router.push({ name: 'createEvent', params: { date: formattedDate } })
}

const goToEditEvent = (event) => {
  router.push({ name: 'editEvent', params: { eventId: event.id } })
}

const getEventLabel = (event) => {
  return event.allDay ? event.title : `${event.title} @ ${event.startTime}`
}
</script>

<style scoped>
.calendar-view {
  padding-bottom: 0;
}

.q-btn {
  height: 0;
  padding-bottom: 100%;
}

.full-width {
  width: 100%;
}

.full-height {
  height: 100%;
}

.full-height-available {
  display: flex;
  flex-direction: column;
  height: calc(100% - 28px); /*Consider day name row*/
}

.full-height-available > div {
  flex: 1 1 0; /* Equal height rows */
}

.event-label {
  font-size: 0.6rem;
  line-height: 1;
  border-radius: 2px;
  padding: 0 2px;
  color: white;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: auto;
  margin-bottom: 2px;
}

.calendar-day {
  position: relative;
}

.absolute-bottom-left {
  position: absolute;
  bottom: 0px;
  left: 4px;
}
</style>
