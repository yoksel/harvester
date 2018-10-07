'use strict';

const puppeteer = require('puppeteer');
const mustache = require('mustache');

const tasks = require('../tasks/');
const credits = require('../credits');

const {
  clearUrlDomain,
  getNameFromUrl,
  loadTemplates,
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

const getScreens = async ({
  ws,
  listId,
  taskId
  }) => {
  await templatesPromise;
  const sendDataWS = sendData(ws);

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
  const screenSizes = task.screenSizes || tasksGroupData.baseScreenSizes;
  const screenFullPage = task.screenFullPage || tasksGroupData.screenFullPage;

  sendDataWS({
    status: 'start',
    message: `task "${task.name}" started...`
  });

  const browser = puppeteer
    .launch()
    .then(async browser => {

      const page = await browser.newPage();
      const fullPage = screenFullPage || false;

      if(credits.beforeStart) {
        await page.goto(credits.beforeStart.url);

        await credits.beforeStart.clickSelectors.forEach(async (item) => {
          await page.click(item);
        });

        await page.waitForNavigation();
      }

      // Login
      if(credits && credits.env[currentEnv].loginUrl) {
        console.log('Has credentials, try to login');
        const loginPromise = makeLogin({
          page,
          credits,
          currentEnv,
          ws
        });

        await loginPromise
          .then(result => {
            console.log(result);
          })
          .catch(error => {
            console.log('Login failed');
            console.log(error);
            sendDataWS({
              status: 'error',
              message: 'Login failed. Check your login & password'
            });
          });
      }

      for (let i = 0; i < urls.length; i++) {
        const promises = [];

        const url = urls[i];
        let name = getNameFromUrl(url);
        const urlKey = clearUrlDomain(url);
        console.log(`\n${i}. URL: ${url}`);

        for (var k = 0; k < screenSizes.length; k++) {
          const width = screenSizes[k].width;
          const height = screenSizes[k].height;

          console.log(`— ${width}x${fullPage ? 'full' : height}`);

          promises.push(browser.newPage()
            .then(async page => {
              const screenPath = `screens/${name}--${width}x${height}.png`;

              await page.setViewport({ width: width, height: height });
              await page.goto(url);
              const title = await page.title();

              sendDataWS({
                status: 'start',
                message: `Start process ${url} (${width}x${height})`
              });

              // Wait for loading
              await page.waitFor(10000);

              if(credits.selectors.closeBanner) {
                let banner = await page.$eval(credits.selectors.closeBanner, bannerElemClose => {
                  if(bannerElemClose) {
                    bannerElemClose.click();
                    return true;
                  }
                  return false;
                })
                  .then(async bannerElemClose => {
                    if(bannerElemClose) {
                      await page.waitFor(2000);
                    }
                  })
                  .catch(err => {});
              }

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

              sendDataWS({
                status: 'success',
                message: `${url} was processed`,
                data: renderedList
              });
            }))
        }

        await Promise.all(promises)
          .then(result => {
            //do nothing
          })
          .catch(error => {
            if(error.name === 'TimeoutError') {
              sendDataWS({
                status: 'error',
                message: `${error.name} while loading pages: ${error.message}`,
                data: error
              });
            }
            else {
              sendDataWS({
                status: 'error',
                message: `Error while loading pages: ${error}`,
                data: error
              });
            }
          });
      }

      await browser.close();
    })
    .catch(error => {
      console.log('Error while launching browser: ', error);
    });
};

const fillTemplates = (data) => {
  const renderedContent = mustache.render(templates.screensList, data);

  return renderedContent;
}

module.exports = getScreens;
