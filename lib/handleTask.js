const puppeteer = require('puppeteer');
const mustache = require('mustache');

const tasksHandlers = require('../lib/tasksHandlers');

const tasks = require('../tasks/');
const credits = require('../credits');

const {
  actBeforeStart,
  clearUrlDomain,
  createFolder,
  eventEmitter,
  getNameFromUrl,
  loadTemplates,
  logs,
  makeLogin,
  sendData,
} = require('./helpers');

let creditsEnv = 'dev';
let visitedUrls = {};

let isTaskStopped = false;

const templatesNames = [
  'screensList'
];

// ------------------------------

const prepareFolders = async (listId, taskId) => {
  const folderName = `${listId}--${taskId}`;

  await createFolder(`public/${folderName}`);
  await createFolder(`public/${folderName}/data`);
  await createFolder(`public/${folderName}/screens`);

  return true;
}

// ------------------------------

const handleTask = async ({
  ws,
  listId,
  taskId
}) => {
  const logsEmit = logs(ws);
  const tasksGroupData = tasks[listId];
  const task = tasksGroupData.tasks
    .filter(item => item.id === taskId)[0];
  isTaskStopped = false;

  if (!task) {
    logsEmit({
      task: task.name,
      status: 'error',
      message: 'Task not found'
    });

    return;
  }

  if(listId !== 'snippets') {
    await prepareFolders(listId, taskId);
  }

  const taskStopper = () => {
    logsEmit({
      task: task.name,
      status: 'stopped',
      message: 'TASK WAS STOPPED'
    });
    isTaskStopped = true;

    eventEmitter.unsubscribe('stop-task', taskStopper);
  };

  eventEmitter.subscribe('stop-task', taskStopper);

  const currentEnv = task.creditsEnv || creditsEnv;
  const loginUrl = credits.env[currentEnv] && credits.env[currentEnv].loginUrl || '';
  visitedUrls = {};

  const screenSizes = task.screenSizes || tasksGroupData.baseScreenSizes;
  const screenFullPage = task.screenFullPage || tasksGroupData.screenFullPage;

  logsEmit({
    task: task.name,
    status: 'in-progress',
    message: 'Task started...'
  });

  if (isTaskStopped) {
    return;
  }

  puppeteer
    .launch()
    .then(async browser => {

      const page = await browser.newPage();
      const fullPage = screenFullPage || false;

      // If exist, process action before start
      if (task.useBeforeStart === true && credits.beforeStart) {
        const beforeStart = await actBeforeStart({
          page,
          beforeStart: credits.beforeStart,
          logsEmit,
          visitedUrls
        });

        if (!beforeStart) {
          // Task is broken, stop process
          return;
        }
      }

      if (isTaskStopped) {
        return;
      }

      // Login
      if (credits && loginUrl) {
        logsEmit({
          task: 'login',
          status: 'in-progress',
          message: `Has credentials, start to login on ${loginUrl}...`
        });

        const loginResult = await makeLogin({
          page,
          credits,
          currentEnv,
          logsEmit,
          visitedUrls
        });

        if (!loginResult) {
          // Login is broken, stop process
          return;
        }
      }

      if (isTaskStopped) {
        return;
      }

      // ------------------------------
      // Handle task here
      // ------------------------------
      if (tasksHandlers[listId]) {
        await tasksHandlers[listId]({
          browser,
          logsEmit,
          tasksGroupData,
          task,
        });
      }

      // ------------------------------

      await browser.close();

      if (isTaskStopped === true) {
        return;
      }

      let status = 'success';
      let message = 'All items were processed';

      logsEmit({
        task: task.name,
        status,
        message
      });
    })
    .catch(error => {
      console.log('handleTask: error while launching browser: ', error);
    });
};

// ------------------------------

module.exports = handleTask;
