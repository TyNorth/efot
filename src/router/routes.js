import CreateNewEventView from 'src/components/CreateNewEventView.vue'
import CreateNewTaskView from 'src/components/CreateNewTaskView.vue'
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('src/pages/CalendarApp.vue'), name: 'calendar' },
      { path: 'tasks', component: () => import('pages/TasksApp.vue'), name: 'tasks' },
      {
        path: 'reminders',
        component: () => import('pages/RemindersApp.vue'),
        name: 'reminders',
      },
      { path: 'tasks/create', component: CreateNewTaskView, name: 'createTask' },
      {
        path: 'edit-task/:listId/:taskId',
        name: 'editTask',
        component: () => import('pages/EditTaskPage.vue'),
      }, // Add this line
      {
        path: 'create-event/:date?',
        name: 'createEvent',
        component: CreateNewEventView,
      },
      {
        path: 'edit-event/:eventId',
        name: 'editEvent',
        component: () => import('pages/EditEventPage.vue'),
      },
      {
        // Add this route
        path: '/event-details/:eventId',
        name: 'eventDetails',
        component: () => import('pages/EventDetailsPage.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
