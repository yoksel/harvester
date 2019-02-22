const fs = require('fs');
const mustache = require('mustache');

const handleTask = require('../lib/handleTask');
const {
  eventEmitter,
  loadTemplates
} = require('../lib/helpers');
const tasks = require('../tasks/');

const templatesNames = [
  'dashBoard',
  'tasksList'
];

// ------------------------------

let templates = {};
const templatesPromise = loadTemplates(templatesNames)
  .then(result => {
    templates = result;
  })
  .catch(error => {
    console.log('Error while loading templates: ', error);
  });

// ------------------------------

const WebSocketServer = require('ws').Server;

const webSocket = new WebSocketServer({port: 8080});

webSocket.on('connection', function (ws) {

  ws.on('message', function (message) {
    const {
      listId,
      taskId,
      action,
      payload
    } = JSON.parse(message);

    if (action) {
      eventEmitter.emit(action, payload, ws);
      return;
    }

    handleTask({
      ws,
      listId,
      taskId
    });
  });

  ws.on('close', function () {
    console.log('соединение закрыто');
  });
});

// ------------------------------

const dashboardPage = async (req, res) => {
  await templatesPromise;

  const tasksGroups = Object.keys(tasks)
    .map(key => {
      tasks[key].tasks = tasks[key].tasks
        .filter(task => !task.disabled);

      return mustache.render(templates.tasksList, tasks[key]);
    });

  const renderedPage = mustache.render(templates.dashBoard, {tasksGroups});

  res.send(renderedPage);
};

// ------------------------------

module.exports = dashboardPage;
