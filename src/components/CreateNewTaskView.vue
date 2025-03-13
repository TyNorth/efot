<template>
  <q-card class="my-card">
    <q-card-section>
      <div class="text-h6">Create New Task</div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <q-input v-model="task.label" label="Task Name" outlined dense autofocus />

      <q-select
        v-model="task.listIndex"
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
          <q-icon name="sym_o_event" class="cursor-pointer">
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
          <q-icon name="sym_o_access_time" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-time v-model="task.reminderTime" mask="HH:mm" format24h />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <q-toggle v-model="task.priority" label="High Priority" />
    </q-card-section>

    <q-separator />

    <q-card-actions align="right">
      <q-btn label="Cancel" color="primary" flat @click="cancel" />
      <q-btn
        label="Create Task"
        color="primary"
        :disable="!task.label || task.listIndex === null"
        @click="createTask"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useEfotStore } from 'src/stores/efot-store'
import { storeToRefs } from 'pinia'

const router = useRouter()
const efotStore = useEfotStore()
const { taskLists } = storeToRefs(efotStore)

const task = ref({
  label: '',
  done: false,
  reminderDate: null,
  reminderTime: null,
  priority: false,
  listIndex: null,
})

onMounted(() => {
  console.log('CreateNewTaskView: onMounted - taskLists.value:', taskLists.value)
  if (taskLists.value.length > 0) {
    task.value.listIndex = taskLists.value[0].id
    console.log('CreateNewTaskView: onMounted - Initial listIndex:', task.value.listIndex)
  } else {
    console.log('CreateNewTaskView: onMounted - No lists found.')
  }
})

const listOptions = computed(() => {
  console.log('CreateNewTaskView: listOptions computed - taskLists.value:', taskLists.value)
  const options = taskLists.value.map((tab) => ({
    label: tab.name,
    value: tab.id,
  }))
  console.log('CreateNewTaskView: listOptions computed - options:', options)
  return options
})

const createTask = () => {
  console.log('CreateNewTaskView: createTask - task.value:', task.value)
  if (task.value.label.trim() !== '' && task.value.listIndex !== null) {
    efotStore.addTask(task.value.listIndex, {
      label: task.value.label,
      done: task.value.done,
      reminderDate: task.value.reminderDate,
      reminderTime: task.value.reminderTime,
      priority: task.value.priority,
    })
    router.push({ name: 'tasks' })
  } else {
    console.warn('CreateNewTaskView: createTask - Task label or listIndex is missing.')
  }
}

const cancel = () => {
  router.push({ name: 'tasks' })
}
</script>
