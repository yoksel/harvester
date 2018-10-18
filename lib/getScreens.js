'use strict';

const puppeteer = require('puppeteer');
const mustache = require('mustache');

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

let templates = {};
const templatesPromise = loadTemplates(templatesNames)
  .then(result => {
    templates = result;
  })
  .catch(error => {
    console.log('Error while loading templates: ', error);
  });

// ------------------------------

const getPageData = async ({
    page,
    url,
    width,
    height,
    screenFullPage
  }) => {

  const title = await page.title();
  let name = getNameFromUrl(url);
  const urlKey = clearUrlDomain(url);
  const screenPath = `screens/${name}--${width}x${height}.png`;

  await page.screenshot({
    path: `public/${screenPath}`,
    fullPage: screenFullPage || false
  });

  if(!visitedUrls[urlKey]) {
    visitedUrls[urlKey] = {
      screenPath: []
    };
  }

  visitedUrls[urlKey].screenPath.push(screenPath);
  visitedUrls[urlKey].title = title;
  visitedUrls[urlKey].url = url;

  const images = Object.values(visitedUrls);
  const renderedList = await fillTemplates({ images });

  return renderedList;
}

// ------------------------------

const createScreenPromise = params => {
  const {
    browser,
    logsEmit,
    url,
    width,
    height,
    screenFullPage
  } = params;

  return new Promise((resolve, reject) => {
    browser.newPage()
      .then(async page => {

        await page.setViewport({ width: width, height: height });
        await page.goto(url);

        // Wait for loading
        await page.waitFor(10000);

        logsEmit({
          task: 'handle screen',
          status: 'start',
          message: `Start process ${url} (${width}x${height})`
        });

        if(credits.selectors.closeBanner) {
          closeBanner({
            page,
            logsEmit,
            url,
            closeBannerSelector: credits.selectors.closeBanner
          });
        }

        const renderedList = await getPageData({
          page,
          url,
          width,
          height,
          screenFullPage
        });

        logsEmit({
          task: 'handle urls',
          status: 'success',
          message: `${url} was processed`,
          data: renderedList
        });

        resolve();
      })
  })
}

// ------------------------------

const getScreens = async ({
  ws,
  listId,
  taskId
  }) => {
  await templatesPromise;
  const sendDataWS = sendData(ws);
  const logsEmit = logs(ws);

  const tasksGroupData = tasks[listId];
  const task = tasksGroupData.tasks
      .filter(task => task.id === taskId)[0];

  if(!task) {
    sendDataWS({
      status: 'error',
      message: 'Task not found'
    });

    return;
  }

  const urls = task.urls;
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
      const beforeStart = await actBeforeStart({
        page,
        beforeStart: credits.beforeStart,
        sendDataWS
      })
        .then(result => {
          if(result) {
            visitedUrls = Object.assign(visitedUrls, result);
          }

          if(result) {
            logsEmit({
              task: 'beforeStart',
              status: 'success',
              message: `beforeStart task was processed`
            });
          }

          return true;
        })
        .catch(err => {
          logsEmit({
            task: 'beforeStart',
            status: 'error',
            message: err.toString()
          });

          return false;
        });

      if(!beforeStart) {
        // Task is broken, stop process
        return;
      }

      // Login
      if(credits && loginUrl) {
        logsEmit({
          task: 'login',
          status: 'in-progress',
          message: `Has credentials, start to login on ${loginUrl}...`
        });

        const loginPromise = makeLogin({
          page,
          credits,
          currentEnv,
          ws
        });

        const loginResult = await loginPromise
          .then(result => {
            console.log(result.status);
            visitedUrls = Object.assign(visitedUrls, result.data);

            let message = 'Login successul.';

            if(result.message) {
              message = `${message} ${result.message}`;
            }

            logsEmit({
              task: 'login',
              status: 'successul',
              message
            });

            return true;
          })
          .catch(error => {
            // console.log('Login failed');
            // console.log(error);

            visitedUrls = Object.assign(visitedUrls, error.data);

            let message = 'Login failed. Check your login & password.';

            if(error.pageStatus){
              message = `Login failed. ${error.err}, ${error.pageStatus}.`;
            }
            if(error.message) {
              message = `${message} ${error.message}`;
            }

            logsEmit({
              task: 'login',
              status: 'error',
              message
            });
            return false;
          });

        if(!loginResult) {
          // Login is broken, stop process
          return;
        }
      }


      for (let i = 0; i < urls.length; i++) {
        const promises = [];

        const url = urls[i];
        logsEmit({
            task: 'handle urls',
            status: 'in-progress',
            message: `${i}. URL: ${url}`
          });

        for (var k = 0; k < screenSizes.length; k++) {
          const width = screenSizes[k].width;
          const height = screenSizes[k].height;

          console.log(`— ${width}x${fullPage ? 'full' : height}`);

          promises.push(createScreenPromise({
            browser,
            logsEmit,
            url,
            width,
            height,
            screenFullPage
          }))
        }

        await Promise.all(promises)
          .then(result => {
            //do nothing
            logsEmit({
              task: 'handle urls',
              status: 'success',
              message: 'Go to next'
            });
          })
          .catch(error => {
            if(error.name === 'TimeoutError') {
              logsEmit({
                task: 'handle urls',
                status: 'error',
                message: `${error.name} while loading pages: ${error.message}`,
                data: error
              });
            }
            else {
              logsEmit({
                task: 'handle urls',
                status: 'error',
                message: `Error while loading pages: ${error}`,
                data: error
              });
            }
          });
      }

      await browser.close();

      logsEmit({
        task: task.name,
        status: 'success',
        message: 'All screens were processed'
      });
    })
    .catch(error => {
      console.log('Error while launching browser: ', error);
    });
};

// ------------------------------

const fillTemplates = (data) => {
  const renderedContent = mustache.render(templates.screensList, data);

  return renderedContent;
}

// ------------------------------

module.exports = getScreens;
