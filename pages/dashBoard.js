const fs = require('fs');
const mustache = require('mustache');

const tasks = require('../tasks/');
const test = require('../test');

const getScreens = require('../lib/getScreens');
const {loadTemplates} = require('../lib/helpers');

const templatesNames = [
  'dashBoard',
  'tasksList'
];

let templates = {};
const templatesPromise = loadTemplates(templatesNames)
  .then(result => {
    templates = result;
  })
  .catch(error => {
    console.log('Error while loading templates: ', error);
  });

const WebSocketServer = require('ws').Server,
ws = new WebSocketServer({port: 8080});

ws.on('connection', function (ws) {

  ws.on('message', function (message) {
    // console.log('received:');
    // console.log(message);
    const {listId, taskId} = JSON.parse(message);
    // console.log(listId, taskId);
    const task = tasks[listId].tasks
      .filter(task => task.id === taskId)[0];

    if(listId === 'adaptivity') {
      getScreens({
        ws,
        task
      });
    }
  });

  ws.on('close', function() {
    console.log('соединение закрыто');
  });
});

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
