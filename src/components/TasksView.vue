<template>
  <q-card class="my-card" flat>
    <q-tabs
      v-model="activeTab"
      dense
      class="text-grey"
      active-color="primary"
      indicator-color="primary"
      align="justify"
      narrow-indicator
    >
      <q-tab
        v-for="(tab, index) in tabs"
        :key="index"
        :name="`tab-${index}`"
        :label="tab.name"
        @click="
          () => {
            selectedListIndex = index
          }
        "
      />
      <q-btn
        v-if="tabs.length < 5"
        flat
        round
        dense
        icon="sym_o_add"
        @click="addTab"
        class="q-ml-md"
        aria-label="Add Tab"
      />
    </q-tabs>

    <q-separator />

    <q-card-section v-if="tabs.length > 0">
      <div class="row items-center q-mb-md">
        <div class="col">
          <q-input
            v-model="tabs[selectedListIndex].name"
            dense
            outlined
            label="List Name"
            @blur="saveTabs"
          />
        </div>
        <div class="col-auto">
          <q-btn
            flat
            round
            dense
            icon="sym_o_delete"
            color="negative"
            @click="removeTab(selectedListIndex)"
            aria-label="Remove Tab"
          />
        </div>
      </div>

      <q-list dense class="full-height-available">
        <q-item
          v-for="(task, taskIndex) in tabs[selectedListIndex].tasks"
          :key="taskIndex"
          clickable
        >
          <q-item-section side>
            <q-checkbox v-model="task.done" @update:model-value="saveTabs" />
          </q-item-section>

          <q-item-section>
            <q-item-label :class="{ 'text-strike': task.done }">
              <q-input v-model="task.label" dense outlined @blur="saveTabs" :debounce="300" />
            </q-item-label>

            <q-item-label caption>
              {{ task.done ? 'Completed' : 'Pending' }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-btn
              flat
              round
              dense
              icon="sym_o_delete"
              color="negative"
              @click="removeTask(selectedListIndex, taskIndex)"
              aria-label="Remove Task"
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-input
              dense
              outlined
              v-model="newTaskLabel"
              label="Add Task"
              @keyup.enter="addTask"
            />
          </q-item-section>
          <q-item-section side>
            <q-btn
              round
              dense
              icon="sym_o_add"
              color="primary"
              @click="addTask"
              aria-label="Add Task"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
    <q-card-section v-else>
      <p class="text-center">No lists created yet. Click the "+" button to add a list.</p>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { LocalStorage } from 'quasar'

const activeTab = ref('tab-0')
const tabs = ref([])
const selectedListIndex = ref(0)
const newTaskLabel = ref('')

// Load tabs from LocalStorage on component mount
onMounted(() => {
  const savedTabs = LocalStorage.getItem('todoTabs')
  if (savedTabs) {
    tabs.value = savedTabs
    if (tabs.value.length > 0) {
      activeTab.value = 'tab-0' //set active tab to the first if exist
    }
  } else {
    addTab() // Add initial tab
  }
})

const addTab = () => {
  if (tabs.value.length < 5) {
    const newTabName = `List ${tabs.value.length + 1}`
    tabs.value.push({ name: newTabName, tasks: [] })
    activeTab.value = `tab-${tabs.value.length - 1}`
    selectedListIndex.value = tabs.value.length - 1
    saveTabs()
  }
}

const removeTab = (index) => {
  tabs.value.splice(index, 1)
  if (tabs.value.length > 0) {
    const newIndex = Math.max(0, index - 1) //avoid -1 index
    activeTab.value = `tab-${newIndex}`
    selectedListIndex.value = newIndex
  }
  saveTabs()
}

const addTask = () => {
  if (newTaskLabel.value.trim() !== '' && tabs.value.length > 0) {
    tabs.value[selectedListIndex].value.tasks.push({ label: newTaskLabel.value, done: false })
    newTaskLabel.value = '' // Clear the input
    saveTabs()
  } else if (newTaskLabel.value.trim() !== '') {
    //no tabs created, create one and add the task
    addTab()
    tabs.value[selectedListIndex].value.tasks.push({ label: newTaskLabel.value, done: false })
    newTaskLabel.value = ''
    saveTabs()
  }
}

const removeTask = (listIndex, taskIndex) => {
  tabs.value[listIndex].tasks.splice(taskIndex, 1)
  saveTabs()
}

// Save tabs to LocalStorage whenever they change
const saveTabs = () => {
  LocalStorage.set('todoTabs', tabs.value)
}
</script>

<style scoped>
.text-strike {
  text-decoration: line-through;
}
.full-height-available {
  height: calc(100vh - 48px); /*consider header height*/
  overflow: auto; /* Enable scrolling if content overflows */
}
</style>
