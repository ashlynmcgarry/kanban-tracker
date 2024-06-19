const formEl = $('#taskForm');
const taskNameEl = $('input[name="task-name"]');
const taskDueDateEl = $('input[name="task-due-date"]');
const taskDescriptionEl = $('input[name="task-description"]');


let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));


let counter = 100;
function generateTaskId() {
  return 'id-' + counter++;
}


function createTaskCard(task) {
const taskCard = $('<div>').addClass('card task-card draggable my-3').attr('data-task-id', task.id);
const cardHeader = $('<div>').addClass('card-header h3').text(task.title);
const cardBody = $('<div>').addClass('card-body');
const cardDescription = $('<p>').addClass('card-text').text(task.description);
const cardDueDate = $('<p>').addClass('card-text').text(task.dueDate);
const cardDeleteBtn = $('<button>').addClass('btn btn-danger delete').text('Delete').attr('data-task-id', task.id);

cardDeleteBtn.on('click', handleDeleteTask); 

if(task.dueDate !== 'done') {
  const now = dayjs(); 
  const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');

  
  if (now.isSame(taskDueDate, 'day')) { 
    taskCard.addClass('bg-warning text-white');
  } else if (now.isAfter(taskDueDate)) { 
    taskCard.addClass('bg-danger text-white');
    cardDeleteBtn.addClass('border-light');
  }
}

cardBody.append(cardDescription, cardDueDate, cardDeleteBtn); 
taskCard.append(cardHeader, cardBody);

return taskCard;
}


function renderTaskList() {

  let tasks = JSON.parse(localStorage.getItem("tasks"));

  if(!tasks) { 
    tasks = [];
 } else if (!Array.isArray(tasks)) {
   tasks = [tasks];
  }

  const toDoList = $('#to-do-cards');
toDoList.empty(); 
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

  $('.draggable').draggable({ 
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


function handleAddTask(event){
event.preventDefault(); 

  const taskName = taskNameEl.val(); 
  const dueDate = taskDueDateEl.val();
  const description = taskDescriptionEl.val();

  const task = { 
    id: generateTaskId(),
    title: taskName,
    dueDate: dueDate,
    description: description,
    status: 'to-do'
  }

  console.log(task);

  let tasks = JSON.parse(localStorage.getItem("tasks")); 
  
  if(!tasks || !Array.isArray(tasks)) { 
    tasks = [];
  }

  tasks.push(task); 

  localStorage.setItem('tasks', JSON.stringify(tasks)); 

  $('input[type="text"]').val(''); 

  renderTaskList();
}


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


$(document).ready(function () {
  renderTaskList();

  $(function() {
    $("#taskDueDate").datepicker();
  });
  
  formEl.on('submit', handleAddTask);
  
  $('.lane').droppable({
    accept: '.draggable',
    drop: handleDrop,
  });

});
