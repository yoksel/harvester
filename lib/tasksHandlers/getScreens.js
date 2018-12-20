const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const mustache = require('mustache');

const tasks = require('../../tasks/');
const credits = require('../../credits');

const {
  actBeforeStart,
  clearUrlDomain,
  closeBanner,
  collectPageData,
  eventEmitter,
  getNameFromUrl,
  loadTemplates,
  logs,
  makeLogin,
  sendData,
} = require('../helpers');

let creditsEnv = 'dev';
let visitedUrls = {};

let isTaskStopped = false;

const taskStopper = () => {
  isTaskStopped = true;
};

eventEmitter.subscribe('stop-task', taskStopper);

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

const createScreenPromise = params => {
  const {
    browser,
    logsEmit,
    url,
    sizes,
    screenFullPage,
    deviceData,
    screenSelector
  } = params;
  const device = deviceData && devices[deviceData.name];
  const width = sizes.width || device.viewport.width;
  const height = sizes.height || device.viewport.height;
  const urlKey = clearUrlDomain(url);
  let info = `${width}x${height}`;

  if(deviceData) {
    info = deviceData.name;
  }

  return new Promise((resolve, reject) => {
    if (isTaskStopped === true) {
      resolve();
    }

    browser.newPage()
      .then(async page => {
        await page.waitFor(Math.random() * 10000 + 2000);

        if(device) {
          await page.emulate(device);
        }
        else {
          await page.setViewport({
            width: width,
            height: height
          });
        }

        await page.goto(url, {waitUntil: 'domcontentloaded'})
          .then(result => {
            // console.log('result._status', result._status)
          })
          .catch(error => {
            console.log(`Error while opening page ${url}`);
          });

        // Wait for loading
        await page.waitFor(10000);

        if (credits.selectors.closeBanner) {
          await closeBanner({
            page,
            logsEmit,
            url,
            closeBannerSelector: credits.selectors.closeBanner,
            isTaskStopped
          });
        }

        await page.waitFor(5000);

        if(device && device.viewport) {
          deviceData.viewport = device.viewport;
        }

        const pageData = await collectPageData({
          page,
          url,
          screenSizes: sizes,
          screenFullPage,
          deviceData,
          screenSelector
        });

        if (visitedUrls[urlKey]) {
          visitedUrls[urlKey].screenPath.push(pageData.screenPath);
        } else {
          visitedUrls[urlKey] = pageData;
        }

        const images = Object.values(visitedUrls);
        const renderedList = await fillTemplates({images});

        logsEmit({
          task: 'handle urls',
          status: 'success',
          message: `${url} (${info}) was processed`,
          data: renderedList
        });

        resolve();
      })
      .catch(err => {
        console.log('err\n',err);
        logsEmit({
          task: 'handle urls',
          status: 'error',
          message: `${url} (${info}) was not opened`
        });
      });
  });
};

// ------------------------------

const getScreens = async ({
  browser,
  logsEmit,
  tasksGroupData,
  task,
}) => {
  isTaskStopped = false;

  await templatesPromise;

  const urls = task.urls;
  visitedUrls = {};

  const screenSizes = task.screenSizes || tasksGroupData.baseScreenSizes;
  const screenFullPage = task.screenFullPage || tasksGroupData.screenFullPage;
  const devices = task.devices || '';
  const screenSelector = task.screenSelector || [];

  logsEmit({
    task: task.name,
    status: 'in-progress',
    message: 'Task started...'
  });

  const page = await browser.newPage();
  const fullPage = screenFullPage || false;

  for (let i = 0; i < urls.length; i++) {
    if (isTaskStopped === true) {
      return;
    }

    const promises = [];

    const url = urls[i];
    logsEmit({
      task: 'handle urls',
      status: 'in-progress',
      message: `${i}. URL: ${url}`
    });

    // Handle screen sizes
    for (let k = 0; k < screenSizes.length; k++) {
      promises.push(createScreenPromise({
        browser,
        logsEmit,
        url,
        sizes: screenSizes[k],
        screenFullPage,
        screenSelector
      }));
    }

    // Handle devices
    for (let k = 0; k < devices.length; k++) {
      promises.push(createScreenPromise({
        browser,
        logsEmit,
        url,
        sizes: {},
        deviceData: devices[k],
        screenFullPage,
        screenSelector
      }));
    }

    await Promise.all(promises)
      .then(result => {
        if (isTaskStopped === true) {
          return;
        }
        // do nothing
        logsEmit({
          task: 'handle urls',
          status: 'success',
          message: 'Go to next'
        });
      })
      .catch(error => {
        if (error.name === 'TimeoutError') {
          logsEmit({
            task: 'handle urls',
            status: 'error',
            message: `${error.name} while loading pages: ${error.message}`,
            data: error
          });
        } else {
          logsEmit({
            task: 'handle urls',
            status: 'error',
            message: `Error while loading pages: ${error}`,
            data: error
          });
        }
      });
  }
};

// ------------------------------

const fillTemplates = (data) => {
  const renderedContent = mustache.render(templates.screensList, data);

  return renderedContent;
};

// ------------------------------

module.exports = getScreens;
