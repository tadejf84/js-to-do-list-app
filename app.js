// DOM caching
const form = document.querySelector('#todo-form');
const date = document.querySelector('#date');
const title = document.querySelector('#title');
const desc = document.querySelector('#desc');
const person = document.querySelector('#person');
const list = document.querySelector('#todo-list');
const messageHolder = document.querySelector('#message-holder');
const archiveMessageHolder = document.querySelector('#archive-message-holder');
const archiveList = document.querySelector('#archive-list');


/**
 * Class Task
 * 
 */
class Task {

    /**
     * @constructor
     * 
     * @param {string} date 
     * @param {string} title 
     * @param {string} desc 
     * @param {string} person 
     * @param {number} id 
     */
    constructor(date, title, desc, person, id) {
        this.date = date;
        this.title = title;
        this.desc = desc;
        this.person = person;
        this.id = id;
        this.dateForOrder = this.convertDateFormat(this.date);
    }

    /**
     * Convert date format
     * 
     * @param {string} date 
     */
    convertDateFormat(date) {
        const dateArr = date.split(".");
        return new Date(dateArr[2], dateArr[1] - 1, dateArr[0]);
    }
}


/**
 * Class TaskUI
 * 
 */
class TaskUI {

    /**
     * Display archive and active tasks on init
     * 
     */
    static displayListsOnInit() {
        const tasks = Store.getTasks();
        const archive = Store.getTasksFromArchive();
        tasks.forEach((task) => TaskUI.addTask(task, list));
        archive.forEach((task) => TaskUI.addTask(task, archiveList));
    }

    /**
     * Add task to list
     * 
     * @param {object} task 
     * @param {object} container 
     */
    static addTask(task, container, taskAfterId = null) {
        const row = document.createElement('tr');
        row.setAttribute('data-id', task.id);
        row.innerHTML = `<td class="taskID">${task.id}</td>
                            <td>${task.date}</td>
                            <td>${task.person}</td>
                            <td>${task.title}</td>
                            <td>${task.desc}</td>
                            <td><button class="btn ${container.classList.contains('active-tasks') ? 'btn-archive' : 'btn-delete-archive red darken-1'}"></button></td>`;
        if(taskAfterId !== null) {
            const taskAfter = document.querySelector(`[data-id="${taskAfterId}"]`);
            container.insertBefore(row, taskAfter);
        } else {
            container.appendChild(row);
        }
    }

    /**
     * Clear field values
     * 
     */
    static clearFields() {
        date.value = '';
        title.value = '';
        desc.value = '';
        person.value = '';
    }

    /**
     * Show alert messages
     * 
     * @param {string} message 
     * @param {string} className 
     */
    static showAlert(message, className, tab = 'tasks') {
        const p = document.createElement('p');
        p.className = `alert-msg ${className}`;
        p.appendChild(document.createTextNode(message));

        if(tab === 'archive') {
            archiveMessageHolder.appendChild(p);
        } else {
            messageHolder.appendChild(p);
        }

        // Hide alert
        setTimeout(() => {
            document.querySelector('.alert-msg').remove();
        }, 3000);
    }

    /**
     * Delete task from archived list
     * 
     * @param {object} el 
     * @param {string} btn 
     */
    static deleteTask(el, btn) {
        if (el.classList.contains(btn)) {
            el.parentElement.parentElement.remove();
        }
    }
}


/**
 * Class Store
 * 
 * Handles data storage - to local storage
 */
class Store {

    /**
     * Get active tasks from storage
     * 
     * @returns {object} tasks
     */
    static getTasks() {
        return JSON.parse(localStorage.getItem('tasks')) ?? [];
    }

    /**
     * Get archived tasks from storage
     * 
     * @returns {object} tasks
     */
    static getTasksFromArchive() {
        return JSON.parse(localStorage.getItem('archive')) ?? [];
    }

    /**
     * Add task to storage
     * 
     * @param {object} task 
     */
    static addTasks(task) {
        let tasks = Store.getTasks();
        tasks.push(task);
        tasks = Store.orderByDate(tasks);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    /**
     * Remove task from storage
     * 
     * @param {string} id 
     */
    static removeTask(id) {
        let tasks = Store.getTasks();
        tasks.forEach((task, index) => {
            if (task.id == id) tasks.splice(index, 1);
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    /**
     * Remove task from archive
     * 
     * @param {string} id 
     */
    static removeTaskFromArchive(id) {
        let archived = Store.getTasksFromArchive();
        archived.forEach((task, index) => {
            if (task.id == id) {
                archived.splice(index, 1);
            }
        });
        localStorage.setItem('archive', JSON.stringify(archived));
    }

    /**
     * Move task to archive
     * 
     * @param {string} id 
     */
    static moveTaskToArchive(id) {
        let tasks = Store.getTasks();
        let archived = Store.getTasksFromArchive();
        tasks.forEach((task) => {
            if (task.id == id) {
                archived.push(task);
                archived = Store.orderByDate(archived);
                localStorage.setItem('archive', JSON.stringify(archived));
                TaskUI.addTask(task, archiveList);
            }
        });
    }

    /**
     * Set id of the last task in storage
     * 
     * @param {string} id 
     */
    static setLastID(id) {
        localStorage.setItem('taskID', JSON.stringify(id));
    }

    /**
     * Get last task id
     * 
     * @returns {string} id
     */
    static getLastID() {
        return JSON.parse(localStorage.getItem('taskID'));
    }

    /**
     * Order array by date
     * 
     * @param {array} tasks 
     * 
     * @returns {array} ordered tasks
     */
    static orderByDate(tasks) {
        tasks.sort(function(a,b){
            return new Date(a.dateForOrder) - new Date(b.dateForOrder);
        });

        return tasks;
    }

    /**
     * Get task after Id
     * To insert new task in correct spot
     * 
     * @param {string} id
     * 
     * @returns {string} task after id
     */
    static getTaskAfterId(id) {
        const tasks = Store.getTasks();
        if(tasks.length === 0) return null;
        const taskAfterIndex = tasks.findIndex(task => task.id === id);
        if((taskAfterIndex + 1) !== tasks.length) {
            const taskAfterId = tasks[taskAfterIndex + 1].id;
            return taskAfterId;
        } else {
            return null;
        }
    }
}

// Show all data on load
document.addEventListener('DOMContentLoaded', TaskUI.displayListsOnInit);

// Add task to list on click
form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get last task ID from storage
    let currentTaskID = (+Store.getLastID() + 1) ?? 0;

    // Get values from form inputs
    const dateVal = document.querySelector('#date').value;
    const titleVal = document.querySelector('#title').value;
    const descVal = document.querySelector('#desc').value;
    const personVal = document.querySelector('#person').value;

    // Input validation
    if (!dateVal || !titleVal || !descVal || !personVal) {
        TaskUI.showAlert('Please fill all fields!', 'error');
    } else {
        // New task instance
        const task = new Task(dateVal, titleVal, descVal, personVal, currentTaskID);

        // Add task to storage
        Store.addTasks(task);
        const taskAfterId = Store.getTaskAfterId(task.id);

        // Add to UI
        TaskUI.addTask(task, list, taskAfterId);

        // Clear fields
        TaskUI.clearFields();

        // Show success message
        TaskUI.showAlert('Task added successfully!', 'success');

        // Increase task ID
        Store.setLastID(currentTaskID);
        currentTaskID++;
    }
});

// Remove a task from to-do list or move it to archive on click
list.addEventListener('click', (e) => {
    const parent = e.target.parentElement;
    const taskID = parent.parentElement.getAttribute('data-id');

    if (e.target.classList.contains('btn-delete')) {

        // Delete task from UI
        TaskUI.deleteTask(e.target, 'btn-delete');

        // Delete task from storage
        Store.removeTask(taskID);

        // Show success message
        TaskUI.showAlert('Task removed!', 'success');

    } else if (e.target.classList.contains('btn-archive')) {

        // Delete task from UI
        TaskUI.deleteTask(e.target, 'btn-archive');

        // Move task to archive storage
        Store.moveTaskToArchive(taskID);

        // Delete task from active tasks storage
        Store.removeTask(taskID);

        // Show success message
        TaskUI.showAlert('Task completed!', 'success');
    }
});

// Remove task from archive on click
archiveList.addEventListener('click', (e) => {
    const parent = e.target.parentElement;
    const taskID = parent.parentElement.getAttribute('data-id');

    // Delete task from archive UI
    TaskUI.deleteTask(e.target, 'btn-delete-archive');

    // Delete task from storage
    Store.removeTaskFromArchive(taskID);

    // Show success message
    TaskUI.showAlert('Task removed!', 'success', 'archive');
});
