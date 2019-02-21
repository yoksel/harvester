(function (window) {
  const ws = new WebSocket('ws://localhost:8080');
  const targetElem = document.querySelector('.content');
  const statusTextElem = document.querySelector('.status__text');
  const statusNameElem = document.querySelector('.status__name');
  const taskPrepareData = document.querySelector('.task-control--prepare-data');
  const taskDownloadData = document.querySelector('.task-control--download-data');
  const inputCompare = document.querySelector('.options__input--compare');

  ws.onopen = function () {
    console.log('Connection established');
  };

  ws.onclose = function (event) {
    if (event.wasClean) {
      console.log('Connection was closed correctly');
    } else {
      console.log('Connection lost'); // например, "убит" процесс сервера
    }

    console.log(`Code: ${event.code}`);

    if (event.reason) {
      console.log(`Reason: ${event.reason}`);
    }

    if (event.code === 1006) {
      const message = '*** Server was stopped. Futher requests will not be processed. ***\n\n';
      statusTextElem.value = message + statusTextElem.value;
      statusTextElem.dataset.status = '';
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

    if(data.task === 'check compare') {
      inputCompare.disabled = !data.data.isFileExist;
    }

    if(!data.status || !data.data) {
      return;
    }

    if (data.status === 'success') {
      targetElem.innerHTML = data.data;
      window.initTabs();
    }
    else if (data.status === 'download') {
      const {name, url} = data.data;
      taskDownloadData.download = name;
      taskDownloadData.href = url;
      taskDownloadData.hidden = false;
      taskPrepareData.hidden = true;
    }

    if(data.task === 'show collected data') {
      window.initGallery();
    }
  };

  ws.onerror = function (error) {
    console.error('Error: ' + error.message);
  };

  window.ws = ws;

}(window));
