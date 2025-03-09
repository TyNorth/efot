<template>
  <div class="calendar-view full-width">
    <q-card flat>
      <q-card-section class="bg-primary text-white">
        <div class="row items-center justify-between">
          <div class="col">
            <div class="text-h6">{{ monthName }} {{ year }}</div>
          </div>
          <div class="col-auto">
            <q-btn
              flat
              round
              icon="sym_o_chevron_left"
              @click="prevMonth"
              :disable="isPreviousMonthDisabled"
              aria-label="Previous Month"
              class="flex"
            />
            <q-btn
              flat
              round
              icon="sym_o_chevron_right"
              @click="nextMonth"
              :disable="isNextMonthDisabled"
              aria-label="Next Month"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-pa-none">
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
            <div v-for="(day, dayIndex) in week" :key="dayIndex" class="col">
              <q-btn
                :class="{
                  'full-width': true,
                  'text-grey-6': !isDateInCurrentMonth(day),
                  'bg-primary text-white': isToday(day) && isDateInCurrentMonth(day),
                  'bg-accent text-white': isSelected(day),
                  'q-px-sm': true, // Keep consistent padding
                }"
                style="height: 30px !important"
                flat
                rounded
                dense
                :label="day ? day.getDate() : ''"
                :disable="!day"
                @click="handleDateClick(day)"
              >
              </q-btn>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { date } from 'quasar'

const currentDate = ref(new Date())
const year = ref(currentDate.value.getFullYear())
const month = ref(currentDate.value.getMonth()) // 0-indexed (January is 0)
const selectedDate = ref(null) // Keep track of the selected date

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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

const handleDateClick = (selected) => {
  if (selected) {
    selectedDate.value = selected
    emit('date-selected', selected)
  }
}

const emit = defineEmits(['date-selected'])
</script>

<style scoped>
.calendar-view {
  /* No longer needed: width and max-width are removed */
  /* margin: auto; is removed because we want it to fill the container*/
  padding-bottom: 0; /* Remove any extra padding */
}

/* Ensure buttons maintain aspect ratio and fill space */
.q-btn {
  height: 0; /*Set height to 0 and use padding-bottom*/
  padding-bottom: 100%; /*  Square aspect ratio */
}

/* Helper classes for full width and height */
.full-width {
  width: 100%;
}

.full-height-available {
  /* subtract week days row height (adjust as needed) */
  display: flex; /* Use flexbox for inner layout */
  flex-direction: column; /* Stack rows vertically */
}

/* Ensure rows within the calendar grid also fill height */
.full-height-available > div {
  /* Target direct children (the rows) */
  flex: auto; /* Each row takes equal height*/
}
</style>
