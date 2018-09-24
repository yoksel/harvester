'use strict';

const fs = require('fs');
const puppeteer = require('puppeteer');

const {
  max,
  startUrl,
  ignoreStrings,
  ignoreMatches
} = require('./rules');

const credits = require('./credits');

const {
  clearUrlProtocol,
  clearUrlDomain,
  clearText,
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

const findMatchOnce = ignoreMatches.map(item => {
  return {
    expr: item,
    wasMet: false
  }
});

const filterLinks = (params) => {
  const {links, visitedUrls, collectedUrls} = params;

  console.log('— links before:', links.length);

  const filtered = links.filter(link => {
    if(link.url) {
      const cleanedUrl = clearUrlProtocol(link.url);
      const urlKey = clearUrlDomain(link.url);

      // No visited or collected links
      if(visitedUrls[urlKey] || collectedUrls[urlKey]) {
        return false;
      }

      // No External link
      if(cleanedUrl.indexOf('livejournal.com') < 0) {
        return false;
      }

      // Check ignored words
      const findIgnored = ignoreStrings.some(str => {
        return cleanedUrl.indexOf(str) > -1
      })

      if(findIgnored === true) {
        return false
      }

      // Check ignored matches
      const findIgnoredMatches = findMatchOnce.some((matchObj, index) => {
        var regex = new RegExp(matchObj.expr);
        const result = cleanedUrl.match(regex);

        // Link was found
        if(result !== null) {
          if(matchObj.wasMet === true) {
            return true;
          }
          else {
            // Find link first time
            findMatchOnce[index].wasMet = true;
            return false;
          }
        }

        return false;
      });

      if(findIgnoredMatches === true) {
        // Remove item from set
        return false
      }

      return link;
    }

    // No url
    return false;
  });

  console.log('— links after:', filtered.length);
  return filtered;
}

// ------------------------------

var searchLinks = (currentUrl) => {

  console.log(`\n------------------------------`);
  console.log(`\n${counter}. Url: ${currentUrl}`);

  const browser = puppeteer
    .launch()
    .then(async browser => {

      const page = await browser.newPage();

      // Login
      if(credits && credits.loginUrl) {
        await makeLogin(page, credits);
      }

      await browser.newPage()
        .then(async page => {

          await page.goto(currentUrl);

          // Get all links from page
          let links = await page.$$eval('BODY a', anchors => {
            return anchors.map(anchor => {
              return {
                url: anchor.href,
                linkText: anchor.textContent
              };
            });
          });

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
            if(url !== currentUrl && !visitedUrls[urlKey] && !collectedUrls[urlKey]) {
              collectedUrls[urlKey] = {
                url,
                linkText: clearText(linkText)
              };

              if(url !== currentUrl) {
                collectedUrls[urlKey].fromPage = currentUrl;
              }
            }
          });

          // Handle current url
          const urlKey = clearUrlDomain(currentUrl);
          // Get title of current page
          const title = await page.title();

          // For the first link
          if(!collectedUrls[urlKey]) {
            collectedUrls[urlKey] = {
              url: currentUrl
            };
          }

          collectedUrls[urlKey].title = title;
          collectedUrls[urlKey].name = urlKey.replace(/\//g,'_');

          await page.screenshot({
            path: `screens/${collectedUrls[urlKey].name}.png`,
            // fullPage: true
          });

          // Move current to visited
          visitedUrls[urlKey] = Object.assign({}, collectedUrls[urlKey]);
          delete collectedUrls[urlKey];

          // Add to Tree
          const urlKeyParts = urlKey.split('/');

          const pagePath = urlKeyParts.reduce((prev, item) => {
            if(!prev[item]) {
              prev[item] = {};
            }

            return prev[item];
          }, tree);

          pagePath.data = visitedUrls[urlKey];

          // console.log('Successful!');
          counter++;
        })
        .catch(err => {
          console.log('Error:', err);
        })

      await browser.close();

      // Find next url
      const collectedKeys = Object.keys(collectedUrls);

      if (collectedKeys.length > 0) {
        console.log('— collectedUrls:', collectedKeys.length);

        const next = collectedUrls[collectedKeys[0]];

        if(counter < max) {
          searchLinks(next.url);
        }
        else {
          console.log(`\nLimit ${max} is reached\n`);
        }
      }
      else {
        console.log('\nThere are not links in list\n');
      }

      writeAllFiles({
        visitedUrls,
        collectedUrls,
        tree
      });

    // console.log('tree', tree);
    // console.log('\nVISITEDURLS\n', visitedUrls);
  })
}

searchLinks(startUrl);
