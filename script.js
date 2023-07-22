
// Array to store content of tasks
let tasks = [];
let taskIdCounter = 0;
// // Array to store task statuses
// let taskStatus = [];
// // Array to store priority of each task (low/medium/high)
// let taskPriority = [];
// // Array to store category of each task
// let taskCategory = [];
// // Array to store due date of each task
// let taskDueDate = [];

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

// parameter2:priorityFilter -->
//                 The tasks will be displayed for the given priority

function showList(isCallFromOtherFunction, priorityFilter = "All") {
    taskList = document.getElementById('task_list');

    // This if condition will toggle the display of tasklist, so when user clicks on showlist again, it will disappear
    if (taskList.style.display !== 'block' || isCallFromOtherFunction) {
        taskList.style.display = 'block';
        taskList.innerHTML = '';

        let filteredTasks;
        if (priorityFilter !== "All") {
            filteredTasks = tasks.filter(task => task.priority === priorityFilter);
        } else {
            filteredTasks = tasks;
        }

        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<li>No tasks found</li>';
        } else {
            for (const task of filteredTasks) {
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

function setListItemInnerHtml(listItem, task) {
    listItem.innerHTML = `
    <input type="checkbox" id="checkbox_${task.id}" onclick="toggleTaskStatus(${task.id})" ${task.status ? "checked" : ""}>
        <span id="task_content_${task.id}">${task.name}</span>
                
`;
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


let addButton = document.getElementById('add_button');
let showButton = document.getElementById('show_button');
let priorityFilterButton = document.getElementById('priority_filter_button');
addButton.addEventListener('click', addTask);
showButton.addEventListener('click', function () {
    showList(false);
});

priorityFilterButton.addEventListener('click', function () {
    let priorityFilter = document.getElementById('priority_filter').value;
    console.log(priorityFilter);
    showList(true, priorityFilter);
});

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


function toggleTaskStatus(taskId) {
    const task = tasks.find(task => task.id === taskId);
    if (task) {
        task.status = !task.status;
        saveToLocalStorage();
    }
}

function saveToLocalStorage() {

    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function retrieveFromLocalStorage() {

    const savedTasks = localStorage.getItem('tasks');

    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
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


