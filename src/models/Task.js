// src/models/Task.js
/**
 * Represents a task.
 * @typedef {Object} Task
 * @property {string} id - Unique identifier for the task.
 * @property {string} label - The task's description.
 * @property {boolean} done - Indicates if the task is completed.  (We'll keep this for compatibility, but 'completed' status will be the main way)
 * @property {string | null} reminderDate - Date for the reminder (ISO 8601 format).
 * @property {string | null} reminderTime - Time for the reminder (ISO 8601 format).
 * @property {boolean} priority - Indicates if the task is high priority.
 * @property {string} listId - ID of the list this task belongs to.
 * @property {string[]} [calendarEventIds] - Optional array of associated calendar event IDs.
 * @property {string} status - Status of the task ('not started', 'in progress', 'completed').  NEW
 */

// Example usage (not part of the model, just for illustration)
/** @type {Task} */
/*
const myTask = {
  id: 'task-456',
  label: 'Prepare presentation slides',
  done: false,
  reminderDate: '2024-03-14',
  reminderTime: '16:00',
  priority: true,
  listId: 'list-001',
  calendarEventIds: ['event-123'],
  status: 'in progress', // Example status
};
*/
