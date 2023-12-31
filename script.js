// Array to store tasks
let tasks = [];
let taskIdCounter = 0;
let activityLogs = [];

/* This function is called when the user clicks the "Add" button or presses the Enter key.
   It retrieves the task input data, creates a new task object, and adds it to the tasks array.
   It also clears the task input fields and saves the data to local storage.*/
function addTask() {

    const taskData = getTaskInputData();

    if (taskData.name.trim() !== '') {

        createNewTask(taskData);
        clearTaskInputFields();

        const taskList = document.getElementById('task_list');
    }

    const log = {
        timestamp: new Date(),
        taskName: taskData.name,
        action: "added",
    };
    activityLogs.push(log);
    // saving the content to local storage
    saveToLocalStorage();
    showList();
}

function getTaskInputData() {
    const taskInput = document.getElementById('task_input');
    const taskName = taskInput.value;
    const priorityInput = document.getElementById('task_priority');
    const categoryInput = document.getElementById('task_category');
    const dueDateInput = document.getElementById('task_due_date');

    const taskInputData = {

        name: taskName,
        priority: priorityInput.value,
        category: categoryInput.value,
        dueDate: dueDateInput.value,
    };

    return taskInputData;
}

function createNewTask(taskData) {
    const newTask = {
        id: taskIdCounter++,
        name: taskData.name,
        status: false,
        priority: taskData.priority,
        category: taskData.category,
        dueDate: taskData.dueDate,
        showSubtasks: false,
        subtasks: [],
    };
    tasks.push(newTask);
}

function clearTaskInputFields() {
    const taskInput = document.getElementById('task_input');
    const categoryInput = document.getElementById('task_category');

    taskInput.value = '';
    categoryInput.value = '';
}


function showList(tasksToShow = tasks) {

    taskList = document.getElementById('task_list');

    taskList.innerHTML = '';

    if (tasksToShow.length === 0) {

        if (tasks.length === 0) {
            taskList.innerHTML = `<li class = "no_task">NO TASKS IN TO-DO-LIST!</li>`;
        }
        else {
            resetButton = createButton('Reset', 'reset_button', () => { showList() });
            taskList.innerHTML = `<li class = "no_task">NO TASKS FOUND!</li>`;
            taskList.appendChild(resetButton);
        }

    } else {
        for (const task of tasksToShow) {

            const taskContainer = createTaskContainer(task);
            taskList.appendChild(taskContainer);
        }
    }
}

function createTaskContainer(task) {
    const taskContainer = document.createElement('div');
    taskContainer.classList.add('task_container');
    taskContainer.classList.add(`task_container_${task.id}`)

    createListItem(taskContainer, task);
    createSubtaskContainer(taskContainer, task)

    return taskContainer;
}

function createListItem(taskContainer, task) {

    const listItem = document.createElement('li');
    listItem.id = `${task.id}`;

    if (task.status) {
        listItem.classList.add('completed');
    }

    listItem.innerHTML = renderTaskContent(task);
    const taskButtons = createButtonsSpan(task);
    listItem.appendChild(taskButtons);

    taskContainer.appendChild(listItem);
}

function renderTaskContent(task) {
    return `
        <input type="checkbox" id="checkbox_${task.id}" onclick="toggleTaskStatus(${task.id})" ${task.status ? "checked" : ""}>
        <span id="task_content_${task.id}" class="task_content" >${task.name}</span>
    `;
}

function createSubtaskContainer(taskContainer, task) {

    const subtaskContainer = document.createElement('div');
    subtaskContainer.classList.add(`subtask_container`);

    const subtasksButton = createButton('Subtasks', 'subtask_button', () => toggleSubtasksVisibility(task.id));
    subtaskContainer.appendChild(subtasksButton);

    // if (task.showSubtasks) {
    //     addSubtaskontent(subtaskContainer, task);
    // }

    taskContainer.appendChild(subtaskContainer);
}



function addSubtaskontent(subtaskContainer, task) {
    const subtaskInputBox = document.createElement('div');
    subtaskInputBox.classList.add('subtask_input_box');

    const subtaskInput = document.createElement('input');
    subtaskInput.classList.add('subtask_input')
    subtaskInput.type = 'text';
    subtaskInput.id = `subtask_input_${task.id}`;
    subtaskInput.placeholder = 'Add subtask';


    const addSubtaskButton = createButton('Add Subtask', 'add_subtask_button', () => addSubtask(task.id, getSubTaskInputContent(task)))


    subtaskInputBox.appendChild(subtaskInput);
    subtaskInputBox.appendChild(addSubtaskButton);

    subtaskContainer.appendChild(subtaskInputBox);
    if (task.subtasks.length > 0) {

        const subTaskListContainer = document.createElement('div');
        subTaskListContainer.classList.add(`subtask_list_container`);

        for (const subtask of task.subtasks) {
            createSubtaskElement(task, subtask, subTaskListContainer);
        }
        subtaskContainer.appendChild(subTaskListContainer);
    }
}

function createSubtaskElement(task, subtask, subTaskListContainer) {
    const subtaskElement = document.createElement('div');
    subtaskElement.classList.add('subtask_element');

    const subtaskCheckbox = document.createElement('input');
    subtaskCheckbox.type = 'checkbox';
    subtaskCheckbox.id = `checkbox_${subtask.id}`;
    subtaskCheckbox.checked = subtask.status;
    subtaskCheckbox.addEventListener('click', () => toggleSubtaskStatus(task.id, subtask.id));

    const subtaskContent = document.createElement('span');
    subtaskContent.id = `subtask_content_${subtask.id}`;
    subtaskContent.textContent = subtask.name;
    subtaskContent.addEventListener('click', () => toggleSubtaskStatus(task.id, subtask.id));

    const editSubtaskButton = createButton('Edit', 'edit_subtask_button', () => editSubtask(task.id, subtask.id, subtaskContent));
    const deleteSubtaskButton = createButton('Delete', 'delete_subtask_button', () => deleteSubtask(task.id, subtask.id));

    const subtaskButtonspan = document.createElement('span');
    subtaskButtonspan.appendChild(editSubtaskButton);
    subtaskButtonspan.appendChild(deleteSubtaskButton);

    subtaskElement.appendChild(subtaskCheckbox);
    subtaskElement.appendChild(subtaskContent);
    subtaskElement.appendChild(subtaskButtonspan);

    subTaskListContainer.appendChild(subtaskElement);
}

function deleteTask(task) {
    const index = tasks.findIndex(item => item.id === task.id);
    if (index !== -1) {
        tasks.splice(index, 1);
        showList();

        const log = {
            timestamp: new Date(),
            taskName: task.name,
            action: "deleted",
        };
        activityLogs.push(log);
        saveToLocalStorage();
    }
}

function editTask(task) {

    if (task) {
        const taskContent = document.querySelector(`#task_content_${task.id}`);
        const taskInput = document.createElement('input');
        taskInput.type = 'text';
        taskInput.value = task.name;

        const saveButton = createButton('Save', 'save_task_button', () => saveTask(task, taskInput));

        taskContent.innerHTML = '';
        taskContent.appendChild(taskInput);
        taskContent.appendChild(saveButton);
        taskInput.focus();

        const log = {
            timestamp: new Date(),
            taskName: task.name,
            action: "edited",
        };
        activityLogs.push(log);
        saveToLocalStorage();
    }


    const listItem = document.getElementById(`${task.id}`);
    const taskText = listItem.querySelector(`#task_content_${task.id}`);

    const editArea = document.createElement('textarea');
    editArea.value = taskText.textContent;

    const saveButton = document.createElement('button');
    saveButton.innerHTML = 'Save';
    saveButton.classList.add('save_button');
    saveButton.addEventListener('click', function () {
        saveTask(task, editArea.value.trim());
    });

}

function saveTask(task, taskInput) {

    if (task) {
        const newTaskName = taskInput.value.trim();
        if (newTaskName !== '') {
            task.name = newTaskName;
            saveToLocalStorage();
        }
        showList();
    }
}

function getSubTaskInputContent(task) {
    return document.getElementById(`subtask_input_${task.id}`).value
}


function createButtonsSpan(task) {
    const buttonSpan = document.createElement('span');
    const deleteButton = createButton('Delete', 'delete_button', () => deleteTask(task));
    const editButton = createButton('Edit', 'edit_button', () => editTask(task));
    const infoButton = createButton('Info', 'info_button', () => showTaskDetails(task));

    const taskInfoSpan = document.createElement('span');
    taskInfoSpan.id = `task_info_${task.id}`;

    buttonSpan.appendChild(editButton);
    buttonSpan.appendChild(deleteButton);
    buttonSpan.appendChild(infoButton);
    buttonSpan.appendChild(taskInfoSpan);

    return buttonSpan;
}

function createButton(text, className, eventListenerFunction) {
    const button = document.createElement('button');
    button.innerHTML = text;
    button.classList.add(className);
    button.addEventListener('click', eventListenerFunction);
    return button;
}


function toggleTaskStatus(taskId) {
    const task = tasks.find(task => task.id === taskId);
    if (task) {
        task.status = !task.status;
        saveToLocalStorage();

        const listItem = document.getElementById(taskId);

        if (task.status) {
            listItem.classList.add('completed');
        } else {
            listItem.classList.remove('completed');
        }
    }
}

function toggleSubtasksVisibility(taskId) {
    const task = tasks.find(task => task.id === taskId);
    if (task) {
        task.showSubtasks = !task.showSubtasks;
        saveToLocalStorage();
        updateSubtaskContainer(task);
    }
}

function addSubtask(taskId, subtaskName) {
    const task = tasks.find(task => task.id === taskId);
    if (task) {

        const newSubtask = {
            id: taskIdCounter++,
            name: subtaskName,
            status: false,
        };
        task.subtasks.push(newSubtask);
        saveToLocalStorage();
        updateSubtaskContainer(task);
    }
}

function editSubtask(taskId, subtaskId, subtaskContent) {
    const task = tasks.find(task => task.id === taskId);
    if (task) {
        const subtask = task.subtasks.find(subtask => subtask.id === subtaskId);
        if (subtask) {
            const subtaskInput = document.createElement('input');
            subtaskInput.type = 'text';
            subtaskInput.value = subtask.name;

            const saveButton = createButton('Save', 'save_subtask_button', () => saveSubtask(task.id, subtask.id, subtaskInput, subtaskContent));

            subtaskContent.innerHTML = '';
            subtaskContent.appendChild(subtaskInput);
            subtaskContent.appendChild(saveButton);
            subtaskInput.focus();
        }
    }
}

function saveSubtask(taskId, subtaskId, subtaskInput, subtaskContent) {
    const task = tasks.find(task => task.id === taskId);
    if (task) {
        const subtask = task.subtasks.find(subtask => subtask.id === subtaskId);
        if (subtask) {
            const newSubtaskName = subtaskInput.value.trim();

            if (newSubtaskName !== '') {
                subtask.name = newSubtaskName;
                subtaskContent.innerHTML = '';
                subtaskContent.textContent = subtask.name;
                saveToLocalStorage();
            }
            //updateSubtaskContainer(task);
        }
    }
}

function updateSubtaskContainer(task) {
    const taskContainer = document.querySelector(`.task_container_${task.id}`);

    const subtaskContainer = taskContainer.querySelector('.subtask_container');

    subtaskContainer.innerHTML = '';
    const subtasksButton = createButton('Subtasks', 'subtask_button', () => toggleSubtasksVisibility(task.id));
    subtaskContainer.appendChild(subtasksButton);

    if (task.showSubtasks) {
        addSubtaskontent(subtaskContainer, task);
    }


}

function saveToLocalStorage() {

    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('taskIdCounter', JSON.stringify(taskIdCounter));
    localStorage.setItem('activityLogs', JSON.stringify(activityLogs))
}

function retrieveFromLocalStorage() {

    const savedTasks = localStorage.getItem('tasks');
    const savedTaskIdCounter = localStorage.getItem('taskIdCounter');
    const savedActivityLogs = localStorage.getItem('activityLogs');

    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }

    if (savedTaskIdCounter) {
        taskIdCounter = JSON.parse(savedTaskIdCounter);
    }

    if (savedActivityLogs) {
        activityLogs = JSON.parse(savedActivityLogs);
    }
}

// This function will display the information about tasks after clicking on Info button
function showTaskDetails(task) {
    const taskInfoSpan = document.querySelector(`#task_info_${task.id}`);

    // Check if the details are currently visible
    const isInfoVisible = taskInfoSpan.innerHTML !== '';

    if (isInfoVisible) {
        // If the details are visible, hide them.
        taskInfoSpan.innerHTML = '';
    } else {
        // If the details are hidden, set the details.
        taskInfoSpan.innerHTML = `<br>Priority: ${task.priority}<br>Category: ${task.category}<br>Due Date: ${task.dueDate}`;
    }

}


function isPriorityMatching(task) {
    const priorityFilter = document.getElementById('filter_priority').value;
    return priorityFilter === 'All' || task.priority === priorityFilter;
}

function isCategoryMatching(task) {
    const categoryFilter = document.getElementById('filter_category').value;
    return categoryFilter === '' || task.category.toLowerCase().includes(categoryFilter.toLowerCase());
}

function isDueDateMatching(task) {

    const startDateFilter = document.getElementById('start_date').value;
    const endDateFilter = document.getElementById('end_date').value;

    return (startDateFilter === '' && endDateFilter === '') ||
        (startDateFilter === '' && task.dueDate <= endDateFilter) ||
        (endDateFilter === '' && task.dueDate >= startDateFilter) ||
        (task.dueDate >= startDateFilter && task.dueDate <= endDateFilter);
}
function filterTasks() {

    const filteredTasks = tasks.filter(task => {
        return isPriorityMatching(task) && isCategoryMatching(task) && isDueDateMatching(task);
    });

    showList(filteredTasks);
}





function toggleSubtaskStatus(taskId, subtaskId) {
    const task = tasks.find(task => task.id === taskId);
    if (task) {
        const subtask = task.subtasks.find(subtask => subtask.id === subtaskId);
        if (subtask) {
            subtask.status = !subtask.status;
            saveToLocalStorage();
        }
    }
}

function deleteSubtask(taskId, subtaskId) {
    const task = tasks.find(task => task.id === taskId);
    if (task) {
        const subtaskIndex = task.subtasks.findIndex(subtask => subtask.id === subtaskId);
        if (subtaskIndex !== -1) {
            task.subtasks.splice(subtaskIndex, 1);
            saveToLocalStorage();
            showList();
        }
    }
}


function showBacklogs() {

    const now = new Date();
    const backlogs = tasks.filter(task => new Date(task.dueDate) < now && !task.status);


    showList(backlogs);
}

const viewBacklogsButton = document.getElementById('view_backlogs_button');
viewBacklogsButton.addEventListener('click', function () {
    showBacklogs();
});

const addButton = document.getElementById('add_button');

addButton.addEventListener('click', addTask);

const filterButton = document.getElementById('filter_button');
filterButton.addEventListener('click', filterTasks);


document.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        addTask();
    }
})

window.addEventListener('DOMContentLoaded', function () {
    // Retriving the content from local storage
    retrieveFromLocalStorage();

    showList();
    //localStorage.clear();
});

function searchTasks() {
    const searchQuery = document.getElementById('search_input').value.trim();
    const filteredTasks = tasks.filter(task => isTaskMatchingSearch(task, searchQuery));
    showList(filteredTasks);
}

function isTaskMatchingSearch(task, searchQuery) {
    const lowerCaseQuery = searchQuery.toLowerCase();
    if (task.name.toLowerCase().includes(lowerCaseQuery)) {
        return true;
    }

    for (const subtask of task.subtasks) {
        if (subtask.name.toLowerCase().includes(lowerCaseQuery)) {
            return true;
        }
    }

    return false;
}

const searchInput = document.getElementById('search_input');
searchInput.addEventListener('input', searchTasks);

function sortTasks(sortBy) {
    switch (sortBy) {
        case "due_date":
            tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
            break;
        case "priority":
            tasks.sort((a, b) => priorityValue(b.priority) - priorityValue(a.priority));
            break;
        case "name":
            tasks.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default:
            // Default sort by added date (by ID)
            tasks.sort((a, b) => a.id - b.id);
            break;
    }

    showList();
}

function priorityValue(priority) {
    switch (priority) {
        case "Low":
            return 1;
        case "Medium":
            return 2;
        case "High":
            return 3;
        default:
            return 0;
    }
}

const sortSelect = document.getElementById("sort_by");
sortSelect.addEventListener("change", function () {
    sortTasks(sortSelect.value);
});



function formatLog(log) {
    const timestamp = log.timestamp.toLocaleString();
    return `[${timestamp}] Task "${log.taskName}" ${log.action}.`;
}

const activityLogsButton = document.querySelector('.activity_log_button');
activityLogsButton.addEventListener('click', toggleActivityLogs);

function toggleActivityLogs() {
    console.log('hi');
    const activityLogsList = document.getElementById('activity_logs_list');
    if (activityLogsList.style.display === '' || activityLogsList.style.display === 'none') {
        showActivityLogs();
        console.log('hi 1');
        activityLogsList.style.display = 'block';

    }
    else {
        activityLogsList.style.display = 'none';
        console.log('hi 2');

    }
}

function showActivityLogs() {
    const activityLogsList = document.getElementById('activity_logs_list');
    activityLogsList.innerHTML = '';

    for (const log of activityLogs) {
        addActivityLog(log);
    }

}

function addActivityLog(log) {
    const activityLogsList = document.getElementById('activity_logs_list');
    const logItem = document.createElement('li');
    logItem.textContent = formatLog(log);
    activityLogsList.prepend(logItem); // To show the latest log on top
}


// Add an event listener to the task input field to capture real-time input
const taskInput = document.getElementById('task_input');
taskInput.addEventListener('input', autoCompleteDueDate);

function autoCompleteDueDate() {
    const taskData = getTaskInputData();
    const { name, dueDate } = extractDueDateFromTaskText(taskData.name);

    // Update the input content with the auto-completed task name
    taskInput.value = name;

    // If a valid due date is found, update the "task_due_date" input field
    if (dueDate) {
        const dueDateInput = document.getElementById('task_due_date');
        const formattedDueDate = formatDate(dueDate);
        dueDateInput.value = formattedDueDate;
    }
}

function extractDueDateFromTaskText(taskText) {
    const byIndex = taskText.toLowerCase().indexOf('by');

    if (byIndex !== -1) {
        const dateString = taskText.substring(byIndex + 2).trim();

        //console.log('hii  ' + dateString);
        // Check for keywords like 'tomorrow' or 'the day after tomorrow' or 'day after tomorrow'
        if (/^tomorrow|the\sday\safter\stomorrow|day\safter\stomorrow$/i.test(dateString)) {
            // Get the current date and add one day to it for tomorrow's date
            //console.log('hii545');

            const tomorrow = new Date();

            if (/^tomorrow$/.test(dateString)) {
                tomorrow.setDate(tomorrow.getDate() + 1);
            }
            else {
                tomorrow.setDate(tomorrow.getDate() + 2);
            }

            const name = taskText.substring(0, byIndex).trim();
            return {
                name,
                dueDate: tomorrow
            };
        } else {
            // Check for date patterns like '13th Jan 2023
            const dateRegex = /(\d{1,2}(?:th|st|nd|rd)? (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4})/;
            const dateMatch = dateString.match(dateRegex);

            if (dateMatch) {

                let cleanDateString = dateMatch[0].replace('th', '');
                cleanDateString = cleanDateString.replace('nd', '');
                cleanDateString = cleanDateString.replace('rd', '');
                cleanDateString = cleanDateString.replace('st', '');

                const dueDate = new Date(cleanDateString);
                if (!isNaN(dueDate)) {
                    // Remove the date expression from the task text
                    const name = taskText.substring(0, byIndex).trim();
                    return {
                        name,
                        dueDate,
                    };
                }
            }
        }
    }

    // If no valid due date is found, return the original task name and no due date
    return {
        name: taskText,
        dueDate: null,
    };
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

