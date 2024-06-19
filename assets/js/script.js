const formEl = $('#taskForm');
const taskNameEl = $('input[name="task-name"]');
const taskDueDateEl = $('input[name="task-due-date"]');
const taskDescriptionEl = $('input[name="task-description"]');

// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

// Todo: create a function to generate a unique task id
let counter = 100;
function generateTaskId() {
  return 'id-' + counter++;
}

// Todo: create a function to create a task card
function createTaskCard(task) {
const taskCard = $('<div>').addClass('card task-card draggable my-3').attr('data-task-id', task.id);
const cardHeader = $('<div>').addClass('card-header h3').text(task.title);
const cardBody = $('<div>').addClass('card-body');
const cardDescription = $('<p>').addClass('card-text').text(task.description);
const cardDueDate = $('<p>').addClass('card-text').text(task.dueDate);
const cardDeleteBtn = $('<button>').addClass('btn btn-danger delete').text('Delete').attr('data-task-id', task.id);

cardDeleteBtn.on('click', handleDeleteTask); //calling handle delete task function on delete

if(task.dueDate !== 'done') {
  const now = dayjs(); //setting dayjs to know the date
  const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');

  //setting card colours
  if (now.isSame(taskDueDate, 'day')) { //if the today is the duedate, make the card yellow
    taskCard.addClass('bg-warning text-white');
  } else if (now.isAfter(taskDueDate)) { //if the date is after the duedate, make the card red with a lighter button border
    taskCard.addClass('bg-danger text-white');
    cardDeleteBtn.addClass('border-light');
  }
}

cardBody.append(cardDescription, cardDueDate, cardDeleteBtn); //append body div to add task details
taskCard.append(cardHeader, cardBody);//append the card to add header & body divs

return taskCard;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {

  let tasks = JSON.parse(localStorage.getItem("tasks"));

  if(!tasks) { //make tasks into an array
    tasks = [];
 } else if (!Array.isArray(tasks)) {
   tasks = [tasks];
  }

  const toDoList = $('#to-do-cards');
toDoList.empty(); //empty lists so we re-render every time to avoid duplicates
  const inProgressList = $('#in-progress-cards');
inProgressList.empty();
  const doneList = $('#done-cards');
doneList.empty();

  for (let task of tasks) {
    if (task.status === 'to-do') {
      toDoList.append(createTaskCard(task));
    } else if (task.status === 'in-progress') {
      inProgressList.append(createTaskCard(task));
    } else if (task.status === 'done') {
      doneList.append(createTaskCard(task));
    }
  }

  $('.draggable').draggable({ //helper function
    opacity: 0.7,
    zIndex: 100,
    helper: function(e) {
      const original = $(e.target).hasClass('ui-draggable')
      ? $(e.target)
      : $(e.target).closest('.ui-draggable');
      return original.clone().css({
        width: original.outerWidth(),
      })
    }
  })

}

// Todo: create a function to handle adding a new task
function handleAddTask(event){
event.preventDefault(); //prevent the default behaviour

  const taskName = taskNameEl.val(); //pulling values from elements
  const dueDate = taskDueDateEl.val();
  const description = taskDescriptionEl.val();

  const task = { //creting the variable task, that includes title, dueDate, description
    id: generateTaskId(),
    title: taskName,
    dueDate: dueDate,
    description: description,
    status: 'to-do'
  }

  console.log(task);

  let tasks = JSON.parse(localStorage.getItem("tasks")); //pulling from local storage
  
  if(!tasks || !Array.isArray(tasks)) { //if there's no tasks or it's not an array, initialise an empty array
    tasks = [];
  }

  tasks.push(task); //push new task to the array

  localStorage.setItem('tasks', JSON.stringify(tasks)); //saving to local storage

  $('input[type="text"]').val(''); //clear input fields

  renderTaskList();
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event){

event.preventDefault();

const taskId = $(this).attr('data-task-id');
let tasks = JSON.parse(localStorage.getItem("tasks"));


tasks.forEach((task) => {
  if (task.id === taskId) {
    tasks.splice(tasks.indexOf(task),1);
  }
});

localStorage.setItem('tasks', JSON.stringify(tasks));

renderTaskList();
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  let tasks = JSON.parse(localStorage.getItem("tasks")); 
  const taskId = ui.draggable[0].dataset.taskId;
  const newStatus = event.target.id;

  for(let task of tasks) {
    if(task.id === taskId) {
      task.status = newStatus;
    }
  }

  localStorage.setItem('tasks', JSON.stringify(tasks));

  renderTaskList();

}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  //render task list on page load
  renderTaskList();

  //date picker
  $(function() {
    $("#taskDueDate").datepicker();
  });

  //event listeners
  formEl.on('submit', handleAddTask);

  //droppable
  $('.lane').droppable({
    accept: '.draggable',
    drop: handleDrop,
  });

});
