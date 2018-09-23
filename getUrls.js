'use strict';

const fs = require('fs');
const puppeteer = require('puppeteer');

const {
  max,
  credits,
  startUrl,
  ignoreStrings,
  ignoreMatches
} = require('./config');

let collectedUrls = {};
let visitedUrls = {};
const tree = {};

let counter = 0;

const USERNAME_SELECTOR = '#user';
const PASSWORD_SELECTOR = '#lj_loginwidget_password';
const BUTTON_SELECTOR = '.lj_login_form .b-loginform-btn--auth';
const CLOSE_ADV_SELECTOR = '.ljsale__hide';

const clearUrlProtocol = (url) => {
  return url
    .replace(/(?:http|https):\/\//,'')
    .replace(/www\./,'');
};

const clearUrlDomain = (url) => {
  let result = clearUrlProtocol(url)
    .replace(/livejournal.com/,'')
    .replace(/^\//,'')
    .replace(/\/$/,'')
    .replace(/\.\//,'/');

  if(result === '') {
    result = 'main';
  }

  return result;
};

const clearText = (str) => {
  return str
    .replace(/[\n\t\r]/g,' ')
    .replace(/\s{2,}/g,'');
};

const filterLinks = (links) => {
  console.log('— links before:', links.length);

  const filtered = links.filter(link => {
    if(link.url) {
      const cleanedUrl = clearUrlProtocol(link.url);

      // No External link
      if(cleanedUrl.indexOf('livejournal.com') < 0) {
        return false;
      }

      const findIgnored = ignoreStrings.some(str => {
        return cleanedUrl.indexOf(str) > -1
      })

      if(findIgnored === true) {
        return false
      }

      const findIgnoredMatches = ignoreMatches.some(str => {
        var regex = new RegExp(str);
        const result = cleanedUrl.match(regex);
        return result;
      });

      if(findIgnoredMatches === true) {
        return false
      }

      // No Profile except of current user profile
      if(cleanedUrl.match(/[\S].livejournal.com\/profile/) !==  null) {
        if(cleanedUrl.indexOf(credits.username) < 0) {
          return false;
        }
      }

      return link;
    }

    // No url
    return false;
  });

  console.log('— links after:', filtered.length);
  return filtered;
}

const writeFile = (fileName, content) => {
  fs.writeFile(fileName, JSON.stringify(content, null, '\t'), function(error){
    if(error) throw error;
    // console.log(`Data was written to ${fileName}`);
  });
}

const writeVisitedFile = (content) => {
  writeFile('visited.json', content);
};

const writeCollectedFile = (content) => {
  writeFile('collected.json', content);
}

const writeTreeFile = (content) => {
  writeFile('tree.json', content);
}

const writeIndexFile = (content) => {
  const indexSrcFile = 'index-src.html';
  const indexFile = 'index.html';

  // Read markup from source
  fs.readFile(indexSrcFile, 'utf8', function(error, markup){
    if(error) throw error;
    const dataStr = `<script type="text/javascript">
const data = ${JSON.stringify(content, null, '\t')};
</script>`;
    markup = markup.replace('<!-- data -->', dataStr);

    // Write markup to destination
    fs.writeFile(indexFile, markup, function(error){
      if(error) throw error;
      // console.log(`Data was written to ${indexFile}`);
    });
  });
}

// ------------------------------

var searchLinks = (currentUrl) => {

  console.log(`\n${counter}. Url: ${currentUrl}`);

  const browser = puppeteer
    .launch()
    .then(async browser => {

    const page = await browser.newPage();

    // Login
    await page.goto('https://www.livejournal.com/login.bml');

    await page.click(USERNAME_SELECTOR);
    await page.keyboard.type(credits.username);

    await page.click(PASSWORD_SELECTOR);
    await page.keyboard.type(credits.password);

    await page.click(BUTTON_SELECTOR);

    await page.waitForNavigation();

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
        links = filterLinks(links);

        // Collect urls
        links.forEach(link => {
          const {url, linkText} = link;
          const urlKey = clearUrlDomain(url);

          // Don't add current & visited links
          if(url !== currentUrl && !visitedUrls[urlKey]) {
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

    await browser.close()

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

    // Write visited links before searching next
    try {
      writeVisitedFile(visitedUrls);
    }
    catch(e) {
      console.log('Data file was not written');
      console.log(e);
    }

    // Write collected links before searching next
    try {
      writeCollectedFile(collectedUrls);
    }
    catch(e) {
      console.log('Collected file was not written');
      console.log(e);
    }

    // Update index file
    try {
      writeIndexFile(tree);
    }
    catch(e) {
      console.log('Index file was not written');
      console.log(e);
    }

    // Wrire tree file
    try {
      writeTreeFile(tree);
    }
    catch(e) {
      console.log('Tree file was not written');
      console.log(e);
    }

    // console.log('tree', tree);
    // console.log('\nVISITEDURLS\n', visitedUrls);
  })
}

searchLinks(startUrl);
