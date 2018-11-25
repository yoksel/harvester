

const fs = require('fs');
const puppeteer = require('puppeteer');
const opn = require('opn');

const {
  domainRestriction,
  linksSelectorRestriction,
  max,
  makeScreens, // enable screeens 1000x1000
  startUrl,
  ignoreStrings,
  findOnce
} = require('../rules-urls');

const credits = require('../credits');
const env = 'prod';

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

let collectedUrls = {};
let visitedUrls = {};
const tree = {};

let counter = 0;
let trysCounter = 0;
const trysMax = 5;
let browserIsOpened = false;

const findMatchOnce = findOnce.map(item => {
  return {
    expr: item,
    wasMet: false
  };
});

const filterLinks = (params) => {
  const {links, visitedUrls, collectedUrls} = params;
  const linksAtStart = links.length;

  const filtered = links.filter(link => {
    if (link.url) {
      const cleanedUrl = clearUrlProtocol(link.url);
      const urlKey = clearUrlDomain(link.url);

      // No visited or collected links
      if (visitedUrls[urlKey] || collectedUrls[urlKey]) {
        return false;
      }

      if (domainRestriction) {
        // No External link
        if (cleanedUrl.indexOf(domainRestriction) < 0) {
          return false;
        }
      }

      // Check ignored words
      const findIgnored = ignoreStrings.some(str => {
        return cleanedUrl.indexOf(str) > -1;
      });

      if (findIgnored === true) {
        return false;
      }

      // Check ignored matches
      const findIgnoredMatches = findMatchOnce.some((matchObj, index) => {
        var regex = new RegExp(matchObj.expr);
        const result = cleanedUrl.match(regex);

        // Link was found
        if (result !== null) {
          if (matchObj.wasMet === true) {
            return true;
          } else {
            // Find link first time
            findMatchOnce[index].wasMet = true;
            return false;
          }
        }

        return false;
      });

      if (findIgnoredMatches === true) {
        // Remove item from set
        return false;
      }

      return link;
    }

    // No url
    return false;
  });

  console.log(`— links: ${linksAtStart} -> ${filtered.length}`);
  return filtered;
};

// ------------------------------

var searchLinks = (currentUrl) => {
  let isGoToNext = true;

  console.log('\n------------------------------');
  console.log(`\n${counter}. Url: ${currentUrl}`);

  const browser = puppeteer
    .launch()
    .then(async browser => {

      const page = await browser.newPage();

      // Login
      if (credits && credits.env[env].loginUrl) {
        await makeLogin(page, credits, env);
      }

      await browser.newPage()
        .then(async page => {

          await page.goto(currentUrl);

          // Get all links from page
          let links = await page.$$eval(linksSelectorRestriction, anchors => {
            return anchors.map(anchor => {
              return {
                url: anchor.href,
                linkText: anchor.textContent
              };
            });
          });

          if (links.length === 0) {
            throw new Error('No links');
            return;
          }

          // Filter link to get only service pages
          links = filterLinks({
            links,
            visitedUrls,
            collectedUrls
          });

          // Collect urls
          links.forEach(link => {
            const {url, linkText} = link;
            const urlKey = clearUrlDomain(url);

            // Don't add current & visited links
            if (url !== currentUrl && !visitedUrls[urlKey] && !collectedUrls[urlKey]) {
              collectedUrls[urlKey] = {
                url,
                linkText: clearText(linkText)
              };

              if (url !== currentUrl) {
                collectedUrls[urlKey].fromPage = currentUrl;
              }
            }
          });

          // Handle current url
          const urlKey = clearUrlDomain(currentUrl);
          // Get title of current page
          const title = await page.title();

          // For the first link
          if (!collectedUrls[urlKey]) {
            collectedUrls[urlKey] = {
              url: currentUrl
            };
          }

          collectedUrls[urlKey].title = title;
          collectedUrls[urlKey].name = getNameFromUrl(urlKey);

          if (makeScreens) {
            const screenPath = `screens/${collectedUrls[urlKey].name}.png`;

            await page.setViewport({width: 1100, height: 1000});
            await page.screenshot({
              path: screenPath
            });

            collectedUrls[urlKey].screenPath = screenPath;
          }

          // Move current to visited
          visitedUrls[urlKey] = Object.assign({}, collectedUrls[urlKey]);
          delete collectedUrls[urlKey];

          // Add to Tree
          const urlKeyParts = urlKey.split('/');

          const pagePath = urlKeyParts.reduce((prev, item) => {
            if (!prev[item]) {
              prev[item] = {};
            }

            return prev[item];
          }, tree);

          pagePath.data = visitedUrls[urlKey];

          // Check path parts
          if (urlKeyParts.length > 1) {
            const urlToCheck = currentUrl
              .split('/')
              .slice(0,-1)
              .join('/');

            const middleUrlKey = clearUrlDomain(urlToCheck);

            collectedUrls[middleUrlKey] = {
              url: urlToCheck
            };

            collectedUrls[middleUrlKey + '.bml'] = {
              url: urlToCheck + '.bml'
            };
          }

          // console.log('Successful!');
          trysCounter = 0;
          counter++;
        })
        .catch(async err => {

          if (err.message === 'No links') {
            if (counter === 0) {
              isGoToNext = false;
            }
            console.log(`\nError: no links for selector '${linksSelectorRestriction}' on page '${currentUrl}'`);
            console.log('Check selector & url');

            return;
          }

          console.log('\nError while opening page:', err);

          if (trysCounter < trysMax) {
            console.log(`\n Try #${trysCounter}`);

            searchLinks(currentUrl);
            trysCounter++;
            isGoToNext = false;
          } else {
            console.log('\Max trys was reached');
            console.log('Go to the next link');

            trysCounter = 0;
            const collectedKeys = Object.keys(collectedUrls);
            const urlKey = clearUrlDomain(currentUrl);
            delete collectedKeys[urlKey];
          }
        });

      await browser.close();

      if (!isGoToNext) {
        return;
      }

      // Find next url
      const collectedKeys = Object.keys(collectedUrls);

      if (collectedKeys.length > 0) {
        console.log('— collectedUrls:', collectedKeys.length);

        const next = collectedUrls[collectedKeys[0]];

        if (counter < max) {
          searchLinks(next.url);
        } else if (trysCounter === 0) {
          console.log(`\nLimit ${max} is reached\n`);
        }
      } else {
        console.log('\nThere are not links in list\n');
      }

      writeAllFiles({
        visitedUrls,
        collectedUrls,
        tree
      });

      if (!browserIsOpened) {
        browserIsOpened = true;
        opn('index.html');
      }

    // console.log('tree', tree);
    // console.log('\nVISITEDURLS\n', visitedUrls);
    })
    .catch(async err => {
      console.log('Error in launching browser: ', err);
    });

  return;
};

console.log('Start from:', startUrl);
console.log('Max:', max);

searchLinks(startUrl);
