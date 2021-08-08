const puppeteer = require('puppeteer');
const mustache = require('mustache');
const URL = require('url').URL;

const tasks = require('../../../tasks/');
const credits = require('../../../credits');

const getLinksFromPage = require('./getLinksFromPage');
const treeToList = require('./treeToList');
const {renderTabs, setTab} = require('./renderTabs');
const showData = require('./showData');
const downloadData = require('./downloadData');

const {
  actBeforeStart,
  checkIsCollectedDataExist,
  clearText,
  clearUrlDomain,
  closeBanner,
  collectPageData,
  deepClone,
  eventEmitter,
  getFilesPromises,
  getFolderName,
  filterLinks,
  getNameFromUrl,
  loadTemplates,
  logs,
  makeLogin,
  writeAllFiles,
  writeCodeFile
} = require('../../helpers');

let creditsEnv = 'dev';
let collectedUrls = {};
let visitedUrls = {};
let tree = {};

let counter = 0;
let trysCounter = 0;
const trysMax = 5;
let browserIsOpened = false;
const defaultScreenSizes = {
  width: 1000,
  height: 1000
};
let isTaskStopped = false;

// Templates
const templatesNames = [
  'screensList--lazyload',
  'tabs',
  'treeListToplevel',
  'treeList',
  'treeItem',
  'savedIndex'
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

// Subscriptions
const taskStopper = () => {
  isTaskStopped = true;
};

eventEmitter.subscribe('stop-task', taskStopper);
eventEmitter.subscribe('check-collected-data', (data, ws) => {
  checkIsCollectedDataExist(data, ws, 'visited.json')
});
eventEmitter.subscribe('set-tab', setTab);

eventEmitter.subscribe('show-data', (data, ws) => {
  showData(data, ws, templates);
});
eventEmitter.subscribe('download-data', (data, ws) => {
  downloadData(data, ws, templates);
});

// ------------------------------

const addUrlToTree = ({url, pageData, from}) => {
  const urlData = new URL(url);
  const hostName = urlData.hostname.replace('www.','');
  const pathName = urlData.pathname;
  const pathNameParts = pathName
    .split('/')
    .filter(item => item && item !== 't');

  // Handle urls with ?get
  if(urlData.search) {
    const searchList = [];

    urlData.searchParams.forEach((value, key) => {
      searchList.push(`${key}=${value}`);
    });

    const searchStr = searchList.join('&');

    pathNameParts.push(searchStr);

    pageData.pathname += `?${searchStr}`;
  }

  // Handle urls with #hash
  if(urlData.hash) {
    const hash = urlData.hash.replace('#', '');
    const hashParts = hash.split('/');
    pathNameParts.push(...hashParts);
    pageData.pathname += urlData.hash;

    if(from) {
      const fromHash = new URL(from).hash
        .replace('#', '');

      if (fromHash) {
        const fromHashParts = fromHash.split('/');
        const fromHashFirstPart = fromHashParts[0];

        if (!pathNameParts.includes(fromHashFirstPart)){
          if(fromHashFirstPart === 'solutions')
            pathNameParts.unshift('forms');

          pathNameParts.unshift(...fromHashParts);
        }
      }
    }
  }

  if (!tree[hostName]) {
    tree[hostName] = {
      name: hostName,
      children: {}
    };
  }

  // Current url is host
  if (pathNameParts.length === 0) {
    tree[hostName].data = pageData;
    tree[hostName].data.pathname = pageData.url
      .replace('www.','')
      .replace('https://','');
  }

  pathNameParts.reduce((prev, item, index) => {
    // Search item in passed tree
    if (!prev.children[item]) {
      prev.children[item] = {
        name: item,
        children: {}
      };
    }
    if (index === pathNameParts.length - 1) {
      prev.children[item].data = pageData;
    }
    // Pass new tree for the next step
    return prev.children[item];

  }, tree[hostName]);
};

// ------------------------------

const getUrls = async ({
  browser,
  logsEmit,
  tasksGroupData,
  task,
}) => {
  collectedUrls = {};
  visitedUrls = {};
  tree = {};
  isTaskStopped = false;
  counter = 0;

  if (isTaskStopped) {
    return;
  }

  await templatesPromise;

  const screenFullPage = task.screenFullPage || tasksGroupData.screenFullPage;

  const page = await browser
    .newPage();
  const currentUrl = task.startUrl;
  const linksSelectorRestriction = task.linksSelectorRestriction;

  if (isTaskStopped) {
    return;
  }

  await collectUrlsRecoursive({
    page,
    task,
    logsEmit,
    currentUrl,
    linksSelectorRestriction
  });
};

// ------------------------------

const collectUrlsRecoursive = async ({
  page,
  task,
  logsEmit,
  currentUrl,
  linksSelectorRestriction
}) => {
  const urlKey = clearUrlDomain(currentUrl);

  // Add first url
  collectedUrls[urlKey] = {
    url: currentUrl
  };

  while (isTaskStopped === false && Object.keys(collectedUrls).length > 0 && counter < task.max) {

    // Find next url
    const collectedKeys = Object.keys(collectedUrls);
    const next = collectedUrls[collectedKeys[0]];

    await collectUrls({
      page,
      task,
      logsEmit,
      current: next,
      linksSelectorRestriction
    });

    counter++;
  }
};

// ------------------------------

const collectUrls = async ({
  page,
  task,
  logsEmit,
  current,
  linksSelectorRestriction
}) => {
  let isPageOpened = false;
  const folderName = `urls--${task.id}`;
  const currentUrl = current.url;
  const env = task.creditsEnv || 'none';
  const selectors = credits.selectors[env];

  logsEmit({
    task: 'collect urls',
    status: 'in-progress',
    message: `${counter}. ${currentUrl}`
  });

  await page
    .goto(currentUrl, {waitUntil: 'domcontentloaded'})
    .then(() => {
      isPageOpened = true;
    })
    .catch(error => {
      console.log(`Error while go to ${currentUrl}`);
    });

  if(!isPageOpened) {
    if (trysCounter < trysMax) {
      logsEmit({
        task: 'collect urls',
        status: 'retry',
        message: `Try #${trysCounter} for ${currentUrl}`
      });
      trysCounter++;
    } else {
      logsEmit({
        task: 'collect urls',
        status: 'retry',
        message: `Max trys was reached for ${currentUrl}. Remove url.`
      });
      trysCounter = 0;

      const urlKey = clearUrlDomain(currentUrl);
      delete collectedUrls[urlKey];
    }
    return;
  }

  trysCounter = 0;
  await page.waitFor(5000);

  if (selectors && selectors.closeBanner) {
    closeBanner({
      page,
      logsEmit,
      url: currentUrl,
      closeBannerSelector: selectors.closeBanner,
      isTaskStopped
    });
  }

  // Get all links from page
  let links = await getLinksFromPage({
    page,
    linksSelectorRestriction
  });

  if (links.length === 0) {
    logsEmit({
      task: 'collect urls',
      status: 'in-progress',
      message: `No links with selector ${linksSelectorRestriction} on ${currentUrl}`
    });
  }

  // Filter links
  links = filterLinks({
    logsEmit,
    task,
    links,
    visitedUrls,
    collectedUrls
  });

  // Collect urls
  links.forEach(link => {
    const {url, linkText} = link;
    const urlKey = clearUrlDomain(url);

    if (url !== currentUrl) {
      collectedUrls[urlKey] = {
        url,
        linkText: clearText(linkText),
        fromPage: currentUrl
      };
    }
  });

  // Handle current url
  const urlKey = clearUrlDomain(currentUrl);
  const pageData = await collectPageData({
    page,
    url: currentUrl,
    from: current.fromPage,
    screenSizes: defaultScreenSizes,
    folderName
  });

  // Move to visited
  visitedUrls[urlKey] = pageData;
  delete collectedUrls[urlKey];

  // Add to Tree
  addUrlToTree({
    url: currentUrl,
    from: current.fromPage,
    pageData
  });

  writeAllFiles({
    folderName,
    visitedUrls,
    collectedUrls,
    tree
  });

  const treeList = treeToList({tree, templates});
  const renderedTabs = await renderTabs({treeList, visitedUrls, templates});

  logsEmit({
    task: 'handle url',
    status: 'success',
    message: `${currentUrl} was processed. Collected urls: ${Object.keys(collectedUrls).length}`,
    data: renderedTabs
  });
};

// ------------------------------

module.exports = getUrls;
