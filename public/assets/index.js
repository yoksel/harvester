(function (window) {
  const tasks = document.querySelectorAll('.task');
  const groupNameElem = document.querySelector('.title__group-name');
  const taskNameElem = document.querySelector('.title__task-name');
  const statusTextElem = document.querySelector('.status__text');
  const targetElem = document.querySelector('.content');
  const taskStopper = document.querySelector('.task-stopper');

  tasks.forEach(task => {
    task.addEventListener('click', event => {
      event.preventDefault();
      statusTextElem.value = '';
      targetElem.innerHTML = '';
      statusTextElem.dataset.status = '';
      taskStopper.disabled = false;

      const taskId = task.dataset.taskid;
      const listId = task.dataset.listid;
      const groupTitle = task.dataset.grouptitle;
      const taskTitle = task.dataset.tasktitle;

      const data = {listId, taskId};
      const dataStr = JSON.stringify(data);
      ws.send(dataStr);

      groupNameElem.innerHTML = groupTitle;
      taskNameElem.innerHTML = taskTitle;
    });
  });


  taskStopper.addEventListener('click', () => {
    taskStopper.disabled = true;

    const data = {action: 'stop-task'};
    const dataStr = JSON.stringify(data);
    ws.send(dataStr);
  });
}(window));
