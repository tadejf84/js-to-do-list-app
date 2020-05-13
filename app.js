// DOM caching
const form = document.querySelector('#todo-form');
const date = document.querySelector('#date');
const title = document.querySelector('#title');
const desc = document.querySelector('#desc');
const person = document.querySelector('#person');
const list = document.querySelector('#todo-list');
const messageHolder = document.querySelector('#message-holder');
const archiveList = document.getElementById('archive-list');

/*
* Task constructor class
*/
class Task {
	constructor(date, title, desc, person, id) {
		this.date = date;
		this.title = title;
		this.desc = desc;
		this.person = person;
		this.id = id;
	}
}

/*
* Task UI class
*/
class TaskUI {
	// display archive and active tasks on init
	static displayListsOnInit() {
		const tasks = Store.getTasks();
		const archive = Store.getTasksFromArchive();
		tasks.forEach((task) => TaskUI.addTask(task, list));
		archive.forEach((task) => TaskUI.addTask(task, archiveList));
	}

	// add task to list
	static addTask(task, container) {
		const row = document.createElement('tr');

		// append to active tasks
		if (container.classList.contains('active-tasks')) {
			row.innerHTML = ` 
            <td class="taskID">${task.id}</td>
            <td>${task.date}</td>
            <td>${task.person}</td>
            <td>${task.title}</td>
            <td>${task.desc}</td>
            <td><button class="btn btn-archive"></button><button class="btn btn-delete red darken-1"></button></td>`;
		} else {
			// append to archived tasks
			row.innerHTML = ` 
            <td class="taskID">${task.id}</td>
            <td>${task.date}</td>
            <td>${task.person}</td>
            <td>${task.title}</td>
            <td>${task.desc}</td>
            <td><button class="btn btn-delete-archive red darken-1"></button></td>`;
		}
		container.appendChild(row);
	}

	// clear fields values
	static clearFields() {
		date.value = '';
		title.value = '';
		desc.value = '';
		person.value = '';
	}

	// show alert messages
	static showAlert(message, className) {
		const p = document.createElement('p');
		p.className = `alert-msg ${className}`;
		p.appendChild(document.createTextNode(message));
		messageHolder.appendChild(p);

		// hide alert
		setTimeout(() => {
			document.querySelector('.alert-msg').remove();
		}, 3000);
	}

	// delete task from list
	static deleteTask(el, btn) {
		if (el.classList.contains(btn)) {
			el.parentElement.parentElement.remove();
		}
	}
}

/*
* data storage class
*/
class Store {
	// get active tasks from storage
	static getTasks() {
		let tasks;
		if (!localStorage.getItem('tasks')) {
			tasks = [];
		} else {
			tasks = JSON.parse(localStorage.getItem('tasks'));
		}
		return tasks;
	}

	// get archived tasks from storage
	static getTasksFromArchive() {
		let tasks;
		if (!localStorage.getItem('archive')) {
			tasks = [];
		} else {
			tasks = JSON.parse(localStorage.getItem('archive'));
		}
		return tasks;
	}

	// add tasks to storage
	static addTasks(task) {
		let tasks = Store.getTasks();
		tasks.push(task);
		localStorage.setItem('tasks', JSON.stringify(tasks));
	}

	// remove task from storage
	static removeTask(id) {
		let tasks = Store.getTasks();
		tasks.forEach((task, index) => {
			if (task.id == id) {
				tasks.splice(index, 1);
			}
		});
		localStorage.setItem('tasks', JSON.stringify(tasks));
	}

	// remove tasks from archive storage
	static removeTaskFromArchive(id) {
		let archived = Store.getTasksFromArchive();
		archived.forEach((task, index) => {
			if (task.id == id) {
				archived.splice(index, 1);
			}
		});
		localStorage.setItem('archive', JSON.stringify(archived));
	}

	// move task to archive storage
	static moveTaskToArchive(id) {
		let tasks = Store.getTasks();
		let archived = Store.getTasksFromArchive();
		tasks.forEach((task) => {
			if (task.id == id) {
				archived.push(task);
				localStorage.setItem('archive', JSON.stringify(archived));
				TaskUI.addTask(task, archiveList);
			}
		});
	}

	// set id of the last task in storage
	static setLastID(id) {
		localStorage.setItem('taskID', JSON.stringify(id));
	}

	// get last ID
	static getLastID() {
		return JSON.parse(localStorage.getItem('taskID'));
	}
}

/*
* load event - fetch all data for to-do list and archive
*/
document.addEventListener('DOMContentLoaded', TaskUI.displayListsOnInit);

/*
* click event - add task to to-do list
*/
// fetch task ID
let getID = Store.getLastID();
let currentTaskID;
if (getID !== null) {
	currentTaskID = getID + 1;
} else {
	currentTaskID = 0;
}
form.addEventListener('submit', (e) => {
	e.preventDefault();

	// get values from inputs
	const dateVal = document.querySelector('#date').value;
	const titleVal = document.querySelector('#title').value;
	const descVal = document.querySelector('#desc').value;
	const personVal = document.querySelector('#person').value;

	// input validation
	if (!dateVal || !titleVal || !descVal || !personVal) {
		TaskUI.showAlert('Please fill all fields!', 'error');
	} else {
		// new task instance
		const task = new Task(dateVal, titleVal, descVal, personVal, currentTaskID);

		// add to UI
		TaskUI.addTask(task, list);

		// add task to storage
		Store.addTasks(task);

		// clear fields
		TaskUI.clearFields();

		// show success message
		TaskUI.showAlert('Task added successfully!', 'success');

		// increase task ID
		Store.setLastID(currentTaskID);
		currentTaskID++;
	}
});

/*
* click event - remove a task from to-do list or move it to archive
*/
list.addEventListener('click', (e) => {
	const parent = e.target.parentElement;

	if (e.target.classList.contains('btn-delete')) {
		// delete task from UI
		TaskUI.deleteTask(e.target, 'btn-delete');

		// delete task from storage
		const taskID =
			parent.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling
				.previousElementSibling.textContent;
		Store.removeTask(taskID);

		// show success message
		TaskUI.showAlert('Task removed successfully!', 'success');
	} else if (e.target.classList.contains('btn-archive')) {
		// delete task from UI
		TaskUI.deleteTask(e.target, 'btn-archive');
		const taskID =
			parent.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling
				.previousElementSibling.textContent;

		// move task to archive storage
		Store.moveTaskToArchive(taskID);

		// delete task from active tasks storage
		Store.removeTask(taskID);

		// show success message
		TaskUI.showAlert('Task completed!', 'success');
	}
});

/*
* click event - remove task from archive
*/
archiveList.addEventListener('click', (e) => {
	const parent = e.target.parentElement;

	// delete task from archive UI
	TaskUI.deleteTask(e.target, 'btn-delete-archive');

	// delete task from storage
	const taskID =
		parent.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling
			.previousElementSibling.textContent;
	Store.removeTaskFromArchive(taskID);

	// show success message
	TaskUI.showAlert('Task removed successfully!', 'success');
});
