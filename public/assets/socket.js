const ws = new WebSocket('ws://localhost:8080');
const targetElem = document.querySelector('.content');
const statusTextElem = document.querySelector('.status__text');

ws.onopen = function() {
  console.log("Соединение установлено");
};

ws.onclose = function(event) {
  if (event.wasClean) {
    console.log('Соединение закрыто чисто');
  } else {
    console.log('Обрыв соединения'); // например, "убит" процесс сервера
  }

  console.log(`Код: ${event.code}`);

  if(event.reason) {
    console.log(`причина: ${event.reason}`);
  }

  if(event.code === 1006) {
    const message = 'Server was stopped. Futher requests will not be processed.\n\n';
    statusTextElem.value = message + statusTextElem.value;
  }
};

// Получены данные
ws.onmessage = function(event) {
  const data = JSON.parse(event.data);

  const message = `⬇️ Task: ${data.task}\n${data.message}\n⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼\n`;

  statusTextElem.value = message + statusTextElem.value;

  statusTextElem.dataset.status = data.status;

  if(data.status && data.status == 'success') {
    if(data.data) {
      targetElem.innerHTML = data.data
    }
  }
  else {
    // console.log(event.data);
  }
};

ws.onerror = function(error) {
  console.error("Ошибка " + error.message);
};
