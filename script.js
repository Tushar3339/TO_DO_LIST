
// Array to store content of tasks
let tasks = [];
// Array to store task statuses
let taskStatus = [];
// Array to store priority of each task (low/medium/high)
let taskPriority = [];
// Array to store category of each task
let taskCategory = [];
// Array to store due date of each task
let taskDueDate = [];

function addTask() {
    taskInput = document.getElementById('task_input');
    task = taskInput.value
    if (task !== '') {
        tasks.push(task);
        taskStatus.push(false);

        // Getting the priority value for the task
        let priorityInput = document.getElementById('task_priority');
        taskPriority.push(priorityInput.value);

        let categoryInput = document.getElementById('task_category');
        taskCategory.push(categoryInput.value);

        let dueDateInput = document.getElementById('task_due_date');
        taskDueDate.push(dueDateInput.value);

        taskInput.value = '';

        taskList = document.getElementById('task_list');

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

        if (priorityFilter !== "All") {
            filteredTasks = [];
            for (let i = 0; i < tasks.length; i++) {
                if (taskPriority[i] === priorityFilter) {
                    filteredTasks.push(i);
                }
            }
        } else {
            // If "All" is selected, show all tasks
            filteredTasks = tasks.map((_, index) => index);
        }

        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<li>No tasks found</li>';
        } else {
            for (let i of filteredTasks) {
                listItem = document.createElement('li');
                setListItemInnerHtml(listItem, i);

                let editDelete = getSpanOfButtons(i);
                listItem.appendChild(editDelete);
                taskList.appendChild(listItem);
            }
        }
    } else {
        taskList.style.display = 'none';
    }
}

function deleteTask(index) {
    tasks.splice(index, 1);
    taskStatus.splice(index, 1);
    taskPriority.splice(index, 1);
    taskCategory.splice(index, 1);
    taskDueDate.splice(index, 1);

    showList(true);

    // Saving the content to local storage
    saveToLocalStorage();
}

function editTask(index) {
    listItem = document.querySelectorAll('li')[index];
    taskText = listItem.querySelector(`.task_content_${index}`)

    editArea = document.createElement('textarea');
    editArea.value = taskText.textContent;

    saveButton = document.createElement('button');
    saveButton.innerHTML = 'Save';
    saveButton.classList.add('save_button');
    saveButton.addEventListener('click', function () {
        saveTask(index, editArea.value);
    });

    listItem.innerHTML = '';
    listItem.appendChild(editArea);
    listItem.appendChild(saveButton);
    editArea.focus();
}

function saveTask(index, newTask) {
    tasks[index] = newTask;
    listItem = document.querySelectorAll('li')[index];
    setListItemInnerHtml(listItem, index);

    let editDelete = getSpanOfButtons(index);
    listItem.appendChild(editDelete);
}

function setListItemInnerHtml(listItem, index) {
    listItem.innerHTML = `
    <input type="checkbox" id="task_${index}" onclick="toggleTaskStatus(${index})" ${taskStatus[index] ? "checked" : ""}>
                <span class = "task_content_${index}">${tasks[index]}</span> 
                
`;
}

function getSpanOfButtons(index) {
    let editDelete = document.createElement('span');
    deleteButton = document.createElement('button');
    deleteButton.innerHTML = 'Delete';
    deleteButton.classList.add('delete_button');
    deleteButton.addEventListener('click', function () {
        deleteTask(index);
    });


    editButton = document.createElement('button');
    editButton.innerHTML = 'Edit';
    editButton.classList.add('edit_button');
    editButton.addEventListener('click', function () {
        editTask(index);
    });

    infoButton = document.createElement('button');
    infoButton.innerHTML = 'Info';
    infoButton.classList.add('info_button');
    infoButton.addEventListener('click', function () {
        showTaskDetails(index);
    })

    let taskInfoSpan = document.createElement('span');
    taskInfoSpan.classList.add(`task_info_${index}`)

    editDelete.appendChild(editButton);
    editDelete.appendChild(deleteButton);
    editDelete.appendChild(infoButton);
    editDelete.appendChild(taskInfoSpan);

    return editDelete;
}


let addButton = document.getElementById('add_button');
let showButton = document.getElementById('show_button');
let filterButton = document.getElementById('filter_button');
addButton.addEventListener('click', addTask);
showButton.addEventListener('click', function () {
    showList(false);
});

filterButton.addEventListener('click', function () {
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


function toggleTaskStatus(index) {
    // Toggle the status
    taskStatus[index] = !taskStatus[index];

    // Save taskStatus to Local Storage
    saveToLocalStorage();
}

function saveToLocalStorage() {
    // Saving content to Local Storage
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('taskStatus', JSON.stringify(taskStatus));
    localStorage.setItem('taskPriority', JSON.stringify(taskPriority));
    localStorage.setItem('taskCategory', JSON.stringify(taskCategory));
    localStorage.setItem('taskDueDate', JSON.stringify(taskDueDate));
}

function retrieveFromLocalStorage() {
    // Retrieve content from Local Storage
    savedTasks = localStorage.getItem('tasks');
    savedTaskStatus = localStorage.getItem('taskStatus');
    savedTaskPriority = localStorage.getItem('taskPriority');
    savedTaskCategory = localStorage.getItem('taskCategory');
    savedTaskDueDate = localStorage.getItem('taskDueDate');


    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }

    if (savedTaskStatus) {
        taskStatus = JSON.parse(savedTaskStatus);
    }

    if (savedTaskPriority) {
        taskPriority = JSON.parse(savedTaskPriority);
    }

    if (savedTaskCategory) {
        taskCategory = JSON.parse(savedTaskCategory);
    }

    if (savedTaskDueDate) {
        taskDueDate = JSON.parse(savedTaskDueDate);
    }
}

// This function will display the information about tasks after clicking on Info button
function showTaskDetails(index) {
    taskInfoSpan = document.querySelector(`.task_info_${index}`);
    priority = taskPriority[index];
    category = taskCategory[index];
    dueDate = taskDueDate[index];


    // Check if the details are currently visible
    isInfoVisible = taskInfoSpan.innerHTML !== '';

    if (isInfoVisible) {
        // If the details are visible, hide them.
        taskInfoSpan.innerHTML = '';
    } else {
        // If the details are hidden, set the details.
        taskInfoSpan.innerHTML = `<br>Priority: ${priority}<br>Category: ${category}<br>Due Date: ${dueDate}`;
    }

}


