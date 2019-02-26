(function (window) {
  const ws = new WebSocket('ws://localhost:8080');
  const targetElem = document.querySelector('.content');
  const statusTextElem = document.querySelector('.status__text');
  const statusNameElem = document.querySelector('.status__name');
  const taskRunner = document.querySelector('.task-control--runner');
  const taskShowData = document.querySelector('.task-control--show-data');
  const taskPrepareData = document.querySelector('.task-control--prepare-data');
  const taskDownloadData = document.querySelector('.task-control--download-data');
  const inputCompare = document.querySelector('.options__input--compare');
  const inputShowCompare = document.querySelector('.options__input--show-compare');
  const inputOpacity = document.querySelector('.options__input--opacity');
  const allInputs = document.querySelectorAll('.container input, .container button');
  const reloadControl = document.querySelector('.reload-control');
  const messages = {
    established: 'Connection established',
    closed: 'Connection was closed correctly',
    lost: 'Connection lost', // proccess was killed
    stopped: '*** Server was stopped. Futher requests will not be processed. ***\n\n'
  };

  ws.onopen = function () {
    console.log(messages.established);
  };

  ws.onclose = function (event) {
    if (event.wasClean) {
      console.log(messages.closed);
    } else {
      console.log(messages.lost);
    }

    console.log(`Code: ${event.code}`);

    if (event.reason) {
      console.log(`Reason: ${event.reason}`);
    }

    if (event.code === 1006) {
      const message = messages.stopped;
      statusTextElem.value = message + statusTextElem.value;
      statusTextElem.dataset.status = '';
      reloadControl.hidden = false;

      allInputs.forEach(input => {
        input.disabled = true;
      });
    }
  };

  // Получены данные
  ws.onmessage = function (event) {
    const data = JSON.parse(event.data);

    const message = `⬇️ Task: ${data.task}
        ${data.message}
        ⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼\n`;

    if(data.message) {
      statusTextElem.value = message + statusTextElem.value;
    }

    if (data.status && statusTextElem.dataset.status !== 'stopped') {
      statusNameElem.innerHTML = data.status;
      statusTextElem.dataset.status = data.status;
    }

    if(data.task === 'check collected data') {
      taskShowData.disabled = !data.data.isFileExist;
      taskPrepareData.disabled = !data.data.isFileExist;

      inputCompare.disabled = !data.data.isFileExist;
      inputShowCompare.disabled = !data.data.isFileExist;
      inputOpacity.disabled = !data.data.isFileExist;
    }

    if (data.status === 'done') {
      if(inputCompare.disabled) {
        inputCompare.disabled = false;
        inputShowCompare.disabled = false;
      }
      taskShowData.disabled = false;
      taskPrepareData.disabled = false;

      window.taskIsRunning = false;
      taskRunner.innerHTML = 'Start';
    }

    if(!data.status || !data.data) {
      return;
    }

    if (data.status === 'success') {
      targetElem.innerHTML = data.data;
      window.initTabs();
      window.initGallery();
    }
    else if (data.status === 'download') {
      const {name, url} = data.data;
      taskDownloadData.download = name;
      taskDownloadData.href = url;
      taskDownloadData.hidden = false;
      taskPrepareData.hidden = true;
    }
  };

  ws.onerror = function (error) {
    console.error('Error: ' + error.message);
  };

  ws.messages = messages;
  window.ws = ws;

}(window));
