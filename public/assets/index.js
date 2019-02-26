(function (window) {
  const body = document.body;
  const tasks = document.querySelectorAll('.task');
  const groupNameElem = document.querySelector('.title__group-name');
  const taskNameElem = document.querySelector('.title__task-name');
  const statusTextElem = document.querySelector('.status__text');
  const targetElem = document.querySelector('.content');
  const taskRunner = document.querySelector('.task-control--runner');
  const taskShowData = document.querySelector('.task-control--show-data');
  const taskPrepareData = document.querySelector('.task-control--prepare-data');
  const taskDownloadData = document.querySelector('.task-control--download-data');
  const taskOptions = document.querySelector('.options--task');
  const inputCompare = document.querySelector('.options__input--compare');
  const reloadControl = document.querySelector('.reload-control');

  let currentTask = {};
  window.taskIsRunning = false;

  taskRunner.disabled = true;
  taskShowData.disabled = true;
  taskPrepareData.disabled = true;
  inputCompare.checked = false;

  tasks.forEach(task => {
    task.addEventListener('click', event => {
      event.preventDefault();

      const groupTitle = task.dataset.grouptitle;
      const taskTitle = task.dataset.tasktitle;
      const taskId = task.dataset.taskid;
      const listId = task.dataset.listid;
      const data = {listId, taskId};
      currentTask = data;
      groupNameElem.innerHTML = groupTitle;
      taskNameElem.innerHTML = taskTitle;

      if(ws.readyState === 3) {
        statusTextElem.value = ws.messages.stopped;
        targetElem.innerHTML = '';
        statusTextElem.dataset.status = '';
        return;
      }

      statusTextElem.value = '';
      targetElem.innerHTML = '';
      statusTextElem.dataset.status = '';
      taskRunner.disabled = false;
      taskShowData.disabled = false;
      taskPrepareData.disabled = false;
      taskPrepareData.hidden = false;
      taskDownloadData.hidden = true;
      inputCompare.checked = false;

      taskRunner.innerHTML = 'Start';
      body.dataset.taskGroup = listId;

      checkCollectedData(listId);
    });
  });

  taskRunner.addEventListener('click', () => {
    if(window.taskIsRunning === true) {
      // STOP task
      taskShowData.disabled = false;
      taskPrepareData.disabled = false;

      const data = {action: 'stop-task'};
      const dataStr = JSON.stringify(data);
      ws.send(dataStr);

      window.taskIsRunning = false;
      taskRunner.innerHTML = 'Start';
    }
    else {
      // START task
      taskShowData.disabled = true;
      taskPrepareData.disabled = true;
      const dataStr = JSON.stringify(currentTask);
      ws.send(dataStr);

      statusTextElem.dataset.status = '';
      taskRunner.innerHTML = 'Stop';
      window.taskIsRunning = true;
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

  inputCompare.addEventListener('click', () => {
    const data = {
      action: 'compareScreens',
      payload: {
        isCompare: inputCompare.checked
      }
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

  const checkCollectedData = (listId) => {
    const data = {
      action: 'check-collected-data',
      payload: currentTask
    };
    const dataStr = JSON.stringify(data);
    ws.send(dataStr);
  }

  reloadControl.addEventListener('click', () => {
    location.reload(true);
  })

  window.initTabs = initTabs;
}(window));
