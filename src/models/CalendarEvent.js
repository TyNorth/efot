// src/models/CalendarEvent.js

/**
 * Represents a calendar event.
 * @typedef {Object} CalendarEvent
 * @property {string} id - Unique identifier for the event.
 * @property {string} title - Title of the event.
 * @property {string} description - Description of the event (optional).
 * @property {string} startDate - Start date of the event (ISO 8601 format, e.g., '2023-10-27').
 * @property {string} startTime - Start time of the event (ISO 8601 format, e.g., '14:30').
 * @property {string} endDate - End date of the event (optional, for multi-day events).
 * @property {string} endTime - End time of the event (optional).
 * @property {boolean} allDay - Indicates if the event is an all-day event.
 * @property {string} [taskId] - Optional ID of the associated task (if any).
 * @property {boolean} [isReminder] - Flag to indicate if this event should be shown in reminders.  Defaults to false.
 */

//Example Usage (not part of the model file)
/** @type {CalendarEvent} */
/*
const myEvent = {
    id: 'event-123',
    title: 'Meeting with John',
    description: 'Discuss project progress',
    startDate: '2024-03-15',
    startTime: '10:00',
    endDate: '2024-03-15',
    endTime: '11:30',
    allDay: false,
    taskId: 'task-456', // This event is linked to a specific task
    isReminder: true, // This ensures it shows in the reminders
};
*/
