(function (window) {
  const tasks = document.querySelectorAll('.task');
  const groupNameElem = document.querySelector('.title__group-name');
  const taskNameElem = document.querySelector('.title__task-name');
  const statusTextElem = document.querySelector('.status__text');
  const targetElem = document.querySelector('.content');
  const taskRunner = document.querySelector('.task-control--runner');
  const taskShowData = document.querySelector('.task-control--show-data');
  const taskPrepareData = document.querySelector('.task-control--prepare-data');
  const taskDownloadData = document.querySelector('.task-control--download-data');

  let currentTask = {};
  let taskIsRunning = false;

  taskRunner.disabled = true;
  taskShowData.disabled = true;
  taskPrepareData.disabled = true;

  tasks.forEach(task => {
    task.addEventListener('click', event => {
      event.preventDefault();
      statusTextElem.value = '';
      targetElem.innerHTML = '';
      statusTextElem.dataset.status = '';
      taskRunner.disabled = false;
      taskShowData.disabled = false;
      taskPrepareData.disabled = false;
      taskPrepareData.hidden = false;
      taskDownloadData.hidden = true;

      const groupTitle = task.dataset.grouptitle;
      const taskTitle = task.dataset.tasktitle;
      const taskId = task.dataset.taskid;
      const listId = task.dataset.listid;
      const data = {listId, taskId};
      currentTask = data;
      taskRunner.innerHTML = 'Start';

      groupNameElem.innerHTML = groupTitle;
      taskNameElem.innerHTML = taskTitle;
    });
  });

  taskRunner.addEventListener('click', () => {
    if(taskIsRunning === true) {
      // STOP task
      taskShowData.disabled = false;

      const data = {action: 'stop-task'};
      const dataStr = JSON.stringify(data);
      ws.send(dataStr);

      taskIsRunning = false;
      taskRunner.innerHTML = 'Start';
    }
    else {
      // START task
      taskShowData.disabled = true;
      const dataStr = JSON.stringify(currentTask);
      ws.send(dataStr);

      statusTextElem.dataset.status = '';
      taskRunner.innerHTML = 'Stop';
      taskIsRunning = true;
      targetElem.innerHTML = '';
    }
  });

  taskShowData.addEventListener('click', () => {
    const data = {
      action: 'show-data',
      payload: currentTask
    };
    const dataStr = JSON.stringify(data);
    ws.send(dataStr);
  });

  taskPrepareData.addEventListener('click', () => {
    const data = {
      action: 'download-data',
      payload: currentTask
    };
    const dataStr = JSON.stringify(data);
    ws.send(dataStr);
  });

  const initTabs = () => {
    const tabsRadioInputs = document.querySelectorAll('.tabs__radio');

    tabsRadioInputs.forEach(tabInput => {
      tabInput.addEventListener('click', () => {
        const data = {
          action: 'set-tab',
          payload: tabInput.id
        };
        const dataStr = JSON.stringify(data);
        ws.send(dataStr);
      });
    });
  };

  window.initTabs = initTabs;
}(window));
