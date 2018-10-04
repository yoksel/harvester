'use strict';

const puppeteer = require('puppeteer');

const {
  max,
  screenFullPage,
  screenSizes,
  startUrl,
  ignoreStrings,
  ignoreMatches
} = require('./rules');

const credits = require('./credits');
const env = 'dev';
let visitedUrls = {};

const {
  clearUrlProtocol,
  clearUrlDomain,
  clearText,
  getNameFromUrl,
  makeLogin,
  writeFile,
  writeAllFiles,
  writeVisitedFile,
  writeCollectedFile,
  writeTreeFile,
  writeIndexFile,
  writeScreensFile
} = require('./helpers');

// Links list to get screens
const urls = require('./urls');

(async () => {
  const browser = puppeteer
    .launch()
    .then(async browser => {

      const page = await browser.newPage();
      const fullPage = screenFullPage || false;

      // Login
      if(credits && credits.env[env].loginUrl) {
        console.log('Has credentials, try to login');
        const loginPromise = makeLogin(page, credits, env);

        await loginPromise
          .then(result => {
            console.log(result);
          })
          .catch(err => {
            console.log('Login failed');
            console.log(err);

            process.exit();
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

              // Wait for loading
              await page.waitFor(10000);
              // await page.waitFor(() => !!document.querySelector('.ljsale[lj-sale-init*="adfox_native_footer"]'));

              await page.screenshot({
                path: screenPath,
                fullPage: screenFullPage || false
              });

              if(!visitedUrls[urlKey]) {
                visitedUrls[urlKey] = {
                  screenPath: []
                };
              }

              visitedUrls[urlKey].screenPath.push(screenPath);
              visitedUrls[urlKey].title = url;
              visitedUrls[urlKey].url = url;
            }))
        }

        await Promise.all(promises)
          .then(result => {})
          .catch(err => {
            console.log('Error while loading pages: ',err);
          });

        writeScreensFile(visitedUrls);
      }

      await browser.close()
    })
    .catch(error => {
      console.log('Error:', error);

      process.exit();
    });
})();
