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
  writeIndexFile
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
    if(credits && credits.loginUrl) {
      await makeLogin(page, credits);
    }

    for (let i = 0; i < urls.length; i++) {
      const promises = [];

      const url = urls[i];
      let name = getNameFromUrl(url);
      console.log(`\n${i}. URL: ${url}`);

      for (var k = screenSizes.length - 1; k >= 0; k--) {
        const width = screenSizes[k].width;
        const height = screenSizes[k].height;

        console.log(`— ${width}x${fullPage ? 'full' : height}`);

        promises.push(browser.newPage()
          .then(async page => {
            await page.setViewport({ width: width, height: height });
            await page.goto(url);

            await page.screenshot({
              path: `screens/${name}--${width}x${height}.png`,
              fullPage: screenFullPage || false
            });
          }))
      }

      await Promise.all(promises)
    }

    await browser.close()
  })
})();
