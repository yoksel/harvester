const fs = require('fs');
const mustache = require('mustache');

const getScreens = require('../lib/getScreens');
const {loadTemplates} = require('../lib/helpers');
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

const WebSocketServer = require('ws').Server,
ws = new WebSocketServer({port: 8080});

ws.on('connection', function (ws) {

  ws.on('message', function (message) {
    const {listId, taskId} = JSON.parse(message);
    console.log('RUN:', listId, taskId);

    if(listId === 'adaptivity') {
      getScreens({
        ws,
        listId,
        taskId
      });
    }
  });

  ws.on('close', function() {
    console.log('соединение закрыто');
  });
});

// ------------------------------

const dashboardPage = async (req, res) => {
  await templatesPromise;

  const tasksGroups = Object.keys(tasks)
    .reduce((prev, key) => {
      prev[key] = mustache.render(templates.tasksList, tasks[key]);
      return prev;
    }, {});

  const renderedPage = mustache.render(templates.dashBoard, tasksGroups);

  res.send(renderedPage);
}

module.exports = dashboardPage;
