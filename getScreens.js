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
      await makeLogin(page, credits, env);
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
            await page.setViewport({ width: width, height: height });
            await page.goto(url);
            const screenPath = `screens/${name}--${width}x${height}.png`;

            await page.screenshot({
              path: screenPath,
              fullPage: screenFullPage || false
            });

            visitedUrls[urlKey] = {};
            visitedUrls[urlKey].screenPath = screenPath;

            if(i === urls.length - 1 && k === screenSizes.length) {
              writeScreensFile(visitedUrls);
            }
          }))
      }

      await Promise.all(promises)
    }

    await browser.close()
  })
})();
