<template>
  <q-card class="my-card full-height" flat bordered>
    <q-tabs
      v-model="activeTab"
      dense
      class="text-grey"
      active-color="primary"
      indicator-color="primary"
      align="justify"
      narrow-indicator
    >
      <q-tab name="priority" label="Priority" />

      <q-tab v-for="tab in nonPriorityTaskLists" :key="tab.id" :name="tab.id" :label="tab.name" />
      <q-btn
        v-if="efotStore.taskLists.length < 6"
        flat
        round
        dense
        icon="sym_o_add"
        @click="efotStore.addTaskList()"
        class="q-ml-md"
        aria-label="Add Tab"
      />
    </q-tabs>

    <q-separator />

    <q-card-section class="q-pa-none flex-grow">
      <div class="row items-center q-mb-md q-px-md q-mt-sm flex" v-if="activeTab !== 'priority'">
        <q-input
          v-model="selectedListName"
          dense
          filled
          label="List Name"
          class="col-11"
          @blur="efotStore.saveTaskLists"
        />

        <q-btn
          flat
          size="lg"
          icon="sym_o_delete"
          color="negative"
          @click="removeTab(activeTab)"
          aria-label="Remove Tab"
          class="col-1"
        />
      </div>

      <q-list dense class="full-height-available">
        <q-item v-for="task in selectedTasks" :key="task.id" clickable>
          <q-item-section side>
            <q-checkbox
              :model-value="checkboxStatus(task)"
              @update:model-value="(val) => updateTaskStatus(task, val)"
              toggle-indeterminate
              :color="checkboxColor(task)"
            />
          </q-item-section>

          <q-item-section>
            <q-item-label :class="{ 'text-strike': task.status === 'completed' }">
              <q-input
                v-model="task.label"
                dense
                outlined
                @blur="updateTask(task)"
                :debounce="300"
              />
            </q-item-label>

            <q-item-label caption>
              {{ taskStatusLabel(task) }}
            </q-item-label>
            <q-item-label v-if="task.reminderDate" caption>
              Reminder: {{ formatDate(task.reminderDate) }} {{ task.reminderTime }}
            </q-item-label>
          </q-item-section>

          <q-item-section side class="list-btns">
            <q-btn
              flat
              round
              dense
              icon="sym_o_edit"
              color="primary"
              @click="goToEditTask(task)"
              aria-label="Edit Task"
            />
            <q-btn
              v-if="task.priority"
              icon="sym_o_star"
              color="yellow"
              flat
              round
              dense
              @click.stop="togglePriority(task)"
            />
            <q-btn
              v-else
              icon="sym_o_star_outline"
              color="grey"
              flat
              round
              dense
              @click.stop="togglePriority(task)"
            />
            <q-btn
              flat
              round
              dense
              icon="sym_o_delete"
              color="negative"
              @click="removeTask(task)"
              aria-label="Remove Task"
            />
          </q-item-section>
        </q-item>
      </q-list>
      <q-btn class="float-right q-ma-md" color="primary" icon="sym_o_add" @click="goToCreateTask">
        Add Task
      </q-btn>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { date } from 'quasar'
import { useRouter } from 'vue-router'
import { useEfotStore } from 'src/stores/efot-store'
import { storeToRefs } from 'pinia'

const router = useRouter()
const efotStore = useEfotStore()
const { taskLists } = storeToRefs(efotStore)
const activeTab = ref('priority')
const priorityListId = ref(null)

onMounted(() => {
  efotStore.initializeStore()

  let priorityList = efotStore.taskLists.find((list) => list.name === 'Priority')
  if (!priorityList) {
    efotStore.addTaskList('Priority')
    priorityList = efotStore.taskLists.find((list) => list.name === 'Priority')
  }
  priorityListId.value = priorityList.id
})

const nonPriorityTaskLists = computed(() => {
  return efotStore.taskLists.filter((list) => list.id !== priorityListId.value)
})

const selectedTasks = computed(() => {
  if (activeTab.value === 'priority') {
    return efotStore.taskLists.flatMap((taskList) => taskList.tasks.filter((task) => task.priority))
  } else {
    const selectedList = efotStore.getTaskListById(activeTab.value)
    return selectedList ? selectedList.tasks : []
  }
})

const selectedListName = computed({
  get() {
    const selectedList = efotStore.getTaskListById(activeTab.value)
    return selectedList ? selectedList.name : ''
  },
  set(newName) {
    if (activeTab.value && activeTab.value !== 'priority') {
      efotStore.updateTaskListName(activeTab.value, newName)
    }
  },
})

const removeTab = (listId) => {
  efotStore.removeTaskList(listId)
  activeTab.value = 'priority'
}

const removeTask = (task) => {
  efotStore.removeTask(task.listId, task.id)
}

const goToCreateTask = () => {
  router.push({ name: 'createTask' })
}

// Add this method to navigate to the edit task view
const goToEditTask = (task) => {
  router.push({ name: 'editTask', params: { listId: task.listId, taskId: task.id } })
}

const formatDate = (dateToFormat) => {
  if (!dateToFormat) return ''
  return date.formatDate(dateToFormat, 'MM/DD/YYYY')
}

const togglePriority = (task) => {
  const updatedTask = { ...task, priority: !task.priority }

  if (updatedTask.priority) {
    updatedTask.originalListId = task.listId
    efotStore.addTask(priorityListId.value, updatedTask)
    efotStore.removeTask(task.listId, task.id)
  } else {
    updatedTask.listId = task.originalListId
    efotStore.addTask(updatedTask.listId, updatedTask)
    efotStore.removeTask(priorityListId.value, task.id)
  }
}

const updateTask = (task) => {
  efotStore.updateTask(task.listId, task.id, task)
}

// --- Checkbox and Status Logic ---

const checkboxStatus = (task) => {
  if (task.status === 'completed') {
    return true
  } else if (task.status === 'in progress') {
    return null //  Use null for indeterminate
  } else {
    return false
  }
}

const checkboxColor = (task) => {
  if (task.status === 'completed') return 'green-5'
  if (task.status === 'in progress') return 'orange-5'
  return undefined //default
}

const updateTaskStatus = (task, value) => {
  let newStatus

  // Determine the next status based on the current status and toggle direction.
  if (task.status === 'not started') {
    newStatus = 'in progress'
  } else if (task.status === 'in progress') {
    newStatus = 'completed'
  } else {
    newStatus = 'not started' // Cycle back to not started
  }

  efotStore.updateTask(task.listId, task.id, {
    ...task,
    status: newStatus,
    done: newStatus === 'completed',
  })
}

const taskStatusLabel = (task) => {
  const statusMap = {
    'not started': 'Not Started',
    'in progress': 'In Progress',
    completed: 'Completed',
  }

  return statusMap[task.status] || 'Unknown'
}
</script>

<style scoped>
.text-strike {
  text-decoration: line-through;
}
.full-height-available {
  height: calc(100% - 48px - 62px); /*consider header and button height*/
  overflow: auto; /* Enable scrolling if content overflows */
}
.list-btns {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
}
</style>
