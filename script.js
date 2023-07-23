
// Array to store tasks
let tasks = [];
let taskIdCounter = 0;

function addTask() {
    const taskInput = document.getElementById('task_input');
    const taskName = taskInput.value;

    if (taskName.trim() !== '') {

        const priorityInput = document.getElementById('task_priority');
        const categoryInput = document.getElementById('task_category');
        const dueDateInput = document.getElementById('task_due_date');

        const newTask = {
            id: taskIdCounter++,
            name: taskName,
            status: false,
            priority: priorityInput.value,
            category: categoryInput.value,
            dueDate: dueDateInput.value,
            showSubtasks: false,
            subtasks: []
        };
        tasks.push(newTask);
        taskInput.value = '';
        categoryInput.value = '';

        const taskList = document.getElementById('task_list');

        // The following code is added so that when list is being viewed and user adds task, then it should reflect in list
        if (taskList.style.display === 'block') {
            showList(true);
        }
    }
    // saving the content to local storage
    saveToLocalStorage();
}


// Function:showList --> This function will show all the tasks when clicking show list button or when called from other functions.
// parameter1:isCallFromOtherFunction --> 
//                 this is true by default, so when it gets called from other functions we show the tasks.
//                 If user click on show list button when the tasks are shown, then we will hide the tasks.

// parameter2:filteredTasks -->
//                 The tasks will be filtered for the given filters.

function showList(isCallFromOtherFunction, filteredTasks) {
    taskList = document.getElementById('task_list');

    // This if condition will toggle the display of tasklist, so when user clicks on showlist again, it will disappear
    if (taskList.style.display !== 'block' || isCallFromOtherFunction) {
        taskList.style.display = 'block';
        taskList.innerHTML = '';

        const tasksToShow = filteredTasks && filteredTasks.length > 0 ? filteredTasks : tasks;

        if (tasksToShow.length === 0) {
            taskList.innerHTML = '<li>No tasks found</li>';
        } else {
            for (const task of tasksToShow) {
                const listItem = document.createElement('li');
                listItem.id = `${task.id}`;

                setListItemInnerHtml(listItem, task);

                const taskButtons = getSpanOfButtons(task);
                listItem.appendChild(taskButtons);
                taskList.appendChild(listItem);
            }
        }
    } else {
        taskList.style.display = 'none';
    }
}

function deleteTask(task) {
    const index = tasks.findIndex(item => item.id === task.id);
    if (index !== -1) {
        tasks.splice(index, 1);
        showList(true);
        saveToLocalStorage();
    }
}

function editTask(task) {
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

    listItem.innerHTML = '';
    listItem.appendChild(editArea);
    listItem.appendChild(saveButton);
    editArea.focus();
}

function saveTask(task, newTaskName) {
    task.name = newTaskName;
    const listItem = document.getElementById(`${task.id}`);

    setListItemInnerHtml(listItem, task);

    const taskButtons = getSpanOfButtons(task);
    listItem.appendChild(taskButtons);

    saveToLocalStorage();
}

function addSubtaskontent(subtaskOuterContainer, task) {
    const subtaskContainer = document.createElement('div');
    subtaskContainer.classList.add('subtask-container');
    subtaskContainer.id = `subtask_container_${task.id}`;

    const subtaskInput = document.createElement('input');
    subtaskInput.type = 'text';
    subtaskInput.id = `subtask_input_${task.id}`;
    subtaskInput.placeholder = 'Add subtask';

    const addSubtaskButton = document.createElement('button');
    addSubtaskButton.innerHTML = 'Add Subtask';
    addSubtaskButton.addEventListener('click', function () {
        addSubtask(task.id, document.getElementById(`subtask_input_${task.id}`).value);
    });

    subtaskContainer.appendChild(subtaskInput);
    subtaskContainer.appendChild(addSubtaskButton);

    subtaskOuterContainer.appendChild(subtaskContainer);
    if (task.subtasks.length > 0) {

        const subTaskListContainer = document.createElement('div');

        for (const subtask of task.subtasks) {
            const subtaskElement = document.createElement('div');
            subtaskElement.classList.add('subTask_element')
            subtaskElement.innerHTML = `
        <input type="checkbox" id="checkbox_${subtask.id}" onclick="toggleSubtaskStatus(${task.id}, ${subtask.id})" ${subtask.status ? "checked" : ""}>
        <span id="subtask_content_${subtask.id}">${subtask.name}</span>
        <button class = "delete_subtask_button" onclick="deleteSubtask(${task.id}, ${subtask.id})">Delete</button>
    `;


            subTaskListContainer.appendChild(subtaskElement);
        }
        subtaskOuterContainer.appendChild(subTaskListContainer);
    }
}

function setListItemInnerHtml(listItem, task) {
    listItem.innerHTML = `
        <input type="checkbox" id="checkbox_${task.id}" onclick="toggleTaskStatus(${task.id})" ${task.status ? "checked" : ""}>
        <span id="task_content_${task.id}" onclick="toggleSubtasksVisibility(${task.id})">${task.name}</span>
    `;

    const subtaskOuterContainer = document.createElement('div');
    subtaskOuterContainer.classList.add(`s_task`);
    subtaskOuterContainer.classList.add(`s_${task.id}`);
    listItem.appendChild(subtaskOuterContainer);

    const subtasksButton = document.createElement('button');
    subtasksButton.innerHTML = 'Subtasks';
    subtasksButton.addEventListener('click', function () {
        toggleSubtasksVisibility(task.id);
    });
    subtaskOuterContainer.appendChild(subtasksButton);

    if (task.showSubtasks) {

        addSubtaskontent(subtaskOuterContainer, task);

    }
    listItem.appendChild(subtaskOuterContainer);
}

function getSpanOfButtons(task) {
    const buttonSpan = document.createElement('span');
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = 'Delete';
    deleteButton.classList.add('delete_button');
    deleteButton.addEventListener('click', function () {
        deleteTask(task);
    });

    const editButton = document.createElement('button');
    editButton.innerHTML = 'Edit';
    editButton.classList.add('edit_button');
    editButton.addEventListener('click', function () {
        editTask(task);
    });

    const infoButton = document.createElement('button');
    infoButton.innerHTML = 'Info';
    infoButton.classList.add('info_button');
    infoButton.addEventListener('click', function () {
        showTaskDetails(task);
    });

    // creating a span where info of task will be shown
    const taskInfoSpan = document.createElement('span');
    taskInfoSpan.id = `task_info_${task.id}`;

    buttonSpan.appendChild(editButton);
    buttonSpan.appendChild(deleteButton);
    buttonSpan.appendChild(infoButton);
    buttonSpan.appendChild(taskInfoSpan);

    return buttonSpan;


}



function toggleTaskStatus(taskId) {
    const task = tasks.find(task => task.id === taskId);
    if (task) {
        task.status = !task.status;
        saveToLocalStorage();
    }
}

function toggleSubtasksVisibility(taskId) {
    const task = tasks.find(task => task.id === taskId);
    if (task) {
        task.showSubtasks = !task.showSubtasks;
        showList(true);
        saveToLocalStorage();

    }
}

function saveToLocalStorage() {

    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('taskIdCounter', JSON.stringify(taskIdCounter))
}

function retrieveFromLocalStorage() {

    const savedTasks = localStorage.getItem('tasks');
    const savedTaskIdCounter = localStorage.getItem('taskIdCounter');

    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }

    if (savedTaskIdCounter) {
        taskIdCounter = JSON.parse(savedTaskIdCounter);
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

    showList(true, filteredTasks);
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
        showList(true);
    }
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
            showList(true);
        }
    }
}

// function editSubtask(taskId, subtaskId, newSubtaskName) {
//     const task = tasks.find(task => task.id === taskId);
//     if (task) {
//         const subtask = task.subtasks.find(subtask => subtask.id === subtaskId);
//         if (subtask) {
//             subtask.name = newSubtaskName;
//             saveToLocalStorage();
//             showList(true);
//         }
//     }
// }


function showBacklogs() {

    const now = new Date();
    console.log('hii' + now);
    const backlogs = tasks.filter(task => new Date(task.dueDate) < now && !task.status);

    if (backlogs.length === 0) {
        alert("No Backlogs");
    }

    showList(true, backlogs);
}

const viewBacklogsButton = document.getElementById('view_backlogs_button');
viewBacklogsButton.addEventListener('click', function () {
    showBacklogs();
});

const addButton = document.getElementById('add_button');
const showButton = document.getElementById('show_button');

addButton.addEventListener('click', addTask);
showButton.addEventListener('click', function () {
    showList(false);
});

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
    //localStorage.clear();
});