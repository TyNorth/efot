// src/stores/efot-store.js
import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'
import { v4 as uuidv4 } from 'uuid'

/**
 * @typedef {import('src/models/Task').Task} Task
 * @typedef {import('src/models/TaskList').TaskList} TaskList
 * @typedef {import('src/models/CalendarEvent').CalendarEvent} CalendarEvent
 */

export const useEfotStore = defineStore('efot', {
  state: () => ({
    /** @type {TaskList[]} */
    taskLists: [],
    /** @type {CalendarEvent[]} */
    calendarEvents: [],
  }),
  getters: {
    tasksWithReminders() {
      /** @type {Task[]} */
      const allTasks = []
      this.taskLists.forEach((list) => allTasks.push(...list.tasks))
      return allTasks.filter((task) => task.reminderDate && task.reminderTime)
    },
    eventsWithReminders() {
      return this.calendarEvents.filter((event) => event.isReminder)
    },
    getTaskListById: (state) => (id) => {
      return state.taskLists.find((list) => list.id === id)
    },
    getTaskById: (state) => (listId, taskId) => {
      const taskList = state.taskLists.find((list) => list.id === listId)
      return taskList ? taskList.tasks.find((task) => task.id === taskId) : undefined
    },
    getEventById: (state) => (id) => {
      return state.calendarEvents.find((event) => event.id === id)
    },
  },
  actions: {
    initializeStore() {
      console.log('efotStore: initializeStore called')
      const savedTaskLists = LocalStorage.getItem('todoTabs')
      const savedEvents = LocalStorage.getItem('calendarEvents')

      if (savedTaskLists) {
        this.taskLists = JSON.parse(savedTaskLists)
        console.log('efotStore: initializeStore - Loaded taskLists:', this.taskLists)
      } else {
        this.addTaskList('List 1')
        console.log('efotStore: initializeStore - Created default list')
      }
      if (savedEvents) {
        this.calendarEvents = JSON.parse(savedEvents)
        console.log('efotStore: initializeStore - Loaded calendarEvents:', this.calendarEvents)
      }
    },

    addTaskList(name) {
      const newTaskList = {
        id: uuidv4(),
        name: name || `List ${this.taskLists.length + 1}`,
        tasks: [],
      }
      this.taskLists.push(newTaskList)
      console.log('efotStore: addTaskList - Added task list:', newTaskList)
      this.saveTaskLists()
    },
    removeTaskList(listId) {
      this.taskLists = this.taskLists.filter((list) => list.id !== listId)
      console.log('efotStore: removeTaskList - Removed task list:', listId)
      this.saveTaskLists()
    },
    updateTaskListName(listId, newName) {
      const taskList = this.getTaskListById(listId)
      if (taskList) {
        taskList.name = newName
        console.log('efotStore: updateTaskListName - Updated name for list', listId)
        this.saveTaskLists()
      } else {
        console.warn('efotStore: updateTaskListName - list not found', listId)
      }
    },

    addTask(listId, taskData) {
      console.log('efotStore: addTask - listId:', listId, 'taskData:', taskData)
      const taskList = this.taskLists.find((list) => list.id === listId)
      if (taskList) {
        const newTask = {
          id: uuidv4(),
          label: taskData.label,
          done: taskData.done || false, // Keep for compatibility, but will be overridden by status
          reminderDate: taskData.reminderDate || null,
          reminderTime: taskData.reminderTime || null,
          priority: taskData.priority || false,
          listId: listId,
          calendarEventIds: taskData.calendarEventIds || [],
          status: taskData.status || 'not started', // NEW: Add status, default to 'not started'
        }
        taskList.tasks.push(newTask)
        console.log('efotStore: addTask - Added task:', newTask, 'to list:', taskList)
        this.saveTaskLists()
      } else {
        console.warn('efotStore: addTask - Task list not found for listId:', listId)
      }
    },
    removeTask(listId, taskId) {
      const taskList = this.taskLists.find((list) => list.id === listId)
      if (taskList) {
        taskList.tasks = taskList.tasks.filter((task) => task.id !== taskId)
        console.log('efotStore: removeTask - Removed task:', taskId, 'from list:', listId)
        this.saveTaskLists()
      } else {
        console.warn('efotStore: addTask - Task list not found for listId:', listId)
      }
    },
    updateTask(listId, taskId, updatedTaskData) {
      const taskList = this.getTaskListById(listId)
      if (taskList) {
        const taskIndex = taskList.tasks.findIndex((t) => t.id === taskId)
        if (taskIndex > -1) {
          // Merge the updated data, giving priority to the new status
          const updatedTask = {
            ...taskList.tasks[taskIndex], // Existing task data
            ...updatedTaskData, // Overwrite with updated data
            done: updatedTaskData.status === 'completed', // Update 'done' based on status
          }

          taskList.tasks[taskIndex] = updatedTask
          console.log('efotStore: updateTask - Updated task:', taskId, 'in list:', listId)
          this.saveTaskLists()
        } else {
          console.warn('efotStore: updateTask - task not found', taskId)
        }
      } else {
        console.warn('efotStore: updateTask - list not found', listId)
      }
    },

    addCalendarEvent(eventData) {
      const newEvent = {
        id: uuidv4(),
        title: eventData.title,
        description: eventData.description || '',
        startDate: eventData.startDate,
        startTime: eventData.startTime,
        endDate: eventData.endDate || null,
        endTime: eventData.endTime || null,
        allDay: eventData.allDay || false,
        taskId: eventData.taskId || null,
        isReminder: eventData.isReminder || false,
      }
      this.calendarEvents.push(newEvent)
      console.log('efotStore: addCalendarEvent - Added event:', newEvent)
      this.saveCalendarEvents()
    },
    removeCalendarEvent(eventId) {
      this.calendarEvents = this.calendarEvents.filter((event) => event.id !== eventId)
      console.log('efotStore: removeCalendarEvent - Removed event:', eventId)
      this.saveCalendarEvents()
    },
    updateCalendarEvent(eventId, updatedEventData) {
      const event = this.getEventById(eventId)
      if (event) {
        Object.assign(event, updatedEventData)
        console.log('efotStore: updateCalendarEvent - Updated event:', eventId)
        this.saveCalendarEvents()
      } else {
        console.warn('efotStore: updateCalendarEvent - event not found', eventId)
      }
    },

    saveTaskLists() {
      console.log('efotStore: saveTaskLists - Saving taskLists:', this.taskLists)
      LocalStorage.set('todoTabs', JSON.stringify(this.taskLists))
    },
    saveCalendarEvents() {
      console.log('efotStore: saveCalendarEvents - Saving calendarEvents:', this.calendarEvents)
      LocalStorage.set('calendarEvents', JSON.stringify(this.calendarEvents))
    },
  },
})
