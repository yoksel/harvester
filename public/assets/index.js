const tasks = document.querySelectorAll('.task');

tasks.forEach(task => {
  task.addEventListener('click', event => {
    event.preventDefault();

    const taskId = task.dataset.taskid;
    const listId = task.dataset.listid;

    const data = {listId, taskId};
    const dataStr = JSON.stringify(data);
    ws.send(dataStr);
  })
});
