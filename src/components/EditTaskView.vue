<template>
  <q-card class="my-card">
    <q-card-section>
      <div class="text-h6">Edit Task</div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <q-input v-model="task.label" label="Task Name" outlined dense autofocus />

      <q-select
        v-model="task.listId"
        :options="listOptions"
        label="Select List"
        outlined
        dense
        emit-value
        map-options
        :disable="listOptions.length === 0"
      />

      <q-input
        v-model="task.reminderDate"
        label="Reminder Date (Optional)"
        outlined
        dense
        mask="date"
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="task.reminderDate" mask="YYYY-MM-DD" />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <q-input
        v-model="task.reminderTime"
        label="Reminder Time (Optional)"
        outlined
        dense
        mask="time"
      >
        <template v-slot:append>
          <q-icon name="access_time" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-time v-model="task.reminderTime" mask="HH:mm" format24h />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <q-select
        v-model="task.status"
        :options="statusOptions"
        label="Status"
        outlined
        dense
        emit-value
        map-options
      />

      <q-toggle v-model="task.priority" label="High Priority" />
    </q-card-section>

    <q-separator />

    <q-card-actions align="right">
      <q-btn label="Cancel" color="primary" flat @click="cancel" />
      <q-btn
        label="Save Changes"
        color="primary"
        :disable="!task.label || !task.listId"
        @click="saveTask"
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
const route = useRoute()
const efotStore = useEfotStore()
const { taskLists } = storeToRefs(efotStore)

const task = ref({
  label: '',
  done: false,
  reminderDate: null,
  reminderTime: null,
  priority: false,
  listId: null,
  status: 'not started', // Initialize status
})

const statusOptions = [
  { label: 'Not Started', value: 'not started' },
  { label: 'In Progress', value: 'in progress' },
  { label: 'Completed', value: 'completed' },
]

onMounted(() => {
  // Get the task ID from the route parameters
  const taskId = route.params.taskId
  const listId = route.params.listId

  // Fetch the task from the store
  const existingTask = efotStore.getTaskById(listId, taskId)

  if (existingTask) {
    // Populate the task ref with the existing task data
    task.value = { ...existingTask } // Use spread operator to create a copy
  } else {
    // Handle the case where the task is not found (e.g., redirect to an error page)
    router.push({ name: 'tasks' }) // Redirect to the main tasks view
  }
})

const listOptions = computed(() => {
  return taskLists.value.map((tab) => ({
    label: tab.name,
    value: tab.id,
  }))
})

const saveTask = () => {
  if (task.value.label.trim() !== '' && task.value.listId) {
    efotStore.updateTask(task.value.listId, task.value.id, task.value)
    router.push({ name: 'tasks' })
  }
}

const cancel = () => {
  router.push({ name: 'tasks' })
}
</script>
