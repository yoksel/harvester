const ws = new WebSocket('ws://localhost:8080');
const targetElem = document.querySelector('.content');
const statusTextElem = document.querySelector('.status__text');

ws.onopen = function() {
  console.log("Соединение установлено.");
};

ws.onclose = function(event) {
  if (event.wasClean) {
    console.log('Соединение закрыто чисто');
  } else {
    console.log('Обрыв соединения'); // например, "убит" процесс сервера
  }
  console.log('Код: ' + event.code + ' причина: ' + event.reason);
};

ws.onmessage = function(event) {
  console.log("Получены данные ");

  const data = JSON.parse(event.data);

  statusTextElem.innerHTML = data.message;

  if(data.status && data.status == 'success') {
    targetElem.innerHTML = data.data;
  }
  else {
    console.log(event.data);
  }
};

ws.onerror = function(error) {
  console.error("Ошибка " + error.message);
};
