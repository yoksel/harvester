'use strict';

const puppeteer = require('puppeteer');
const mustache = require('mustache');

const tasksHandlers = require('../lib/tasksHandlers');

const tasks = require('../tasks/');
const credits = require('../credits');

const {
  actBeforeStart,
  clearUrlDomain,
  closeBanner,
  getNameFromUrl,
  loadTemplates,
  logs,
  makeLogin,
  sendData,
} = require('./helpers');

let creditsEnv = 'dev';
let visitedUrls = {};

const templatesNames = [
  'screensList'
];

// ------------------------------

const handleTask = async ({
  ws,
  listId,
  taskId
  }) => {
  const logsEmit = logs(ws);
  const tasksGroupData = tasks[listId];
  const task = tasksGroupData.tasks
      .filter(task => task.id === taskId)[0];

  if(!task) {
    logsEmit({
      task: task.name,
      status: 'error',
      message: 'Task not found'
    });

    return;
  }

  const currentEnv = task.creditsEnv || creditsEnv;
  const loginUrl = credits.env[currentEnv].loginUrl || '';
  visitedUrls = {};

  const screenSizes = task.screenSizes || tasksGroupData.baseScreenSizes;
  const screenFullPage = task.screenFullPage || tasksGroupData.screenFullPage;

  logsEmit({
    task: task.name,
    status: 'in-progress',
    message: `Task started...`
  });

  const browser = puppeteer
    .launch()
    .then(async browser => {

      const page = await browser.newPage();
      const fullPage = screenFullPage || false;

      // If exist, process action before start
      if(credits.beforeStart) {
        const beforeStart = await actBeforeStart({
          page,
          beforeStart: credits.beforeStart,
          logsEmit,
          visitedUrls
        });

        if(!beforeStart) {
          // Task is broken, stop process
          return;
        }
      }

      // Login
      if(credits && loginUrl) {
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

        if(!loginResult) {
          // Login is broken, stop process
          return;
        }
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

      logsEmit({
        task: task.name,
        status: 'in-progress',
        message: 'Doing things'
      });

      // ------------------------------

      await browser.close();

      logsEmit({
        task: task.name,
        status: 'success',
        message: 'All items were processed'
      });
    })
    .catch(error => {
      console.log('Error while launching browser: ', error);
    });
};

// ------------------------------

module.exports = handleTask;
