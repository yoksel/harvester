const puppeteer = require('puppeteer');
const mustache = require('mustache');
const URL = require('url').URL;

const tasks = require('../../tasks/');
const credits = require('../../credits');

const {
  actBeforeStart,
  clearText,
  clearUrlDomain,
  closeBanner,
  collectPageData,
  deepClone,
  eventEmitter,
  filterLinks,
  getNameFromUrl,
  loadTemplates,
  logs,
  makeLogin,
  writeAllFiles,
  writeFile
} = require('../helpers');

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

const tabsIds = ['tab-1', 'tab-2'];
let checkedTab = tabsIds[0];

// Subscriptions
const taskStopper = () => {
  isTaskStopped = true;
};

eventEmitter.subscribe('stop-task', taskStopper);

const setTab = (tab) => {
  checkedTab = tab;
};

eventEmitter.subscribe('set-tab', setTab);

// Templates
const templatesNames = [
  'screensList',
  'screensList--lazyload',
  'tabs',
  'treeListToplevel',
  'treeList',
  'treeItem'
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

const addUrlToTree = ({url, pageData}) => {
  // const urlKeyParts = urlKey.split('/');
  const urlKey = clearUrlDomain(url);
  const urlData = new URL(url);
  const hostName = urlData.hostname.replace('www.','');
  // console.log(urlData.hostname);
  const pathName = urlData.pathname;
  const pathNameParts = pathName
    .split('/')
    .filter(item => item);

  if (!tree[hostName]) {
    tree[hostName] = {
      name: hostName,
      children: {}
    };
  }

  // Current url is host
  if (pathNameParts.length === 0) {
    tree[hostName].data = pageData;
    tree[hostName].data.pathname = pageData.url;
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

  writeAllFiles({
    visitedUrls,
    collectedUrls,
    tree
  });
};

// ------------------------------

const valuesToList = (obj) => {
  const values = Object.values(obj);

  if (values.length === 0) {
    return [];
  }

  const newList = values.map(item => {
    const url = item.data ? item.data.url : '';
    if (!item.data) {
      item.data = {
        title: '(no title)',
        pathname: item.name
      };
    }

    if (Object.keys(item.children).length > 0) {
      item.children = valuesToList(item.children);
      item.markup = fillTemplates({
        templateId: 'treeList',
        data: {
          data: item.data,
          items: item.children
        }
      });
    } else {
      if (item.data.url) {
        item.markup = fillTemplates({
          templateId: 'treeItem',
          data: {
            data: item.data
          }
        });
      }
    }

    return item;
  });

  return newList;
};

// ------------------------------

const treeToList = () => {
  const treeCopy = deepClone(tree);

  const result = valuesToList(treeCopy);

  writeFile('data/treeList.json', result);

  return result;
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

  const urls = task.urls;

  const screenFullPage = task.screenFullPage || tasksGroupData.screenFullPage;

  const page = await browser.newPage();
  const fullPage = screenFullPage || false;
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
    const url = next.url;

    await collectUrls({
      page,
      task,
      logsEmit,
      currentUrl: next.url,
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
  currentUrl,
  linksSelectorRestriction
}) => {

  logsEmit({
    task: 'collect urls',
    status: 'in-progress',
    message: `${counter}. ${currentUrl}`
  });

  await page.goto(currentUrl);

  // Get all links from page
  let links = await page.$$eval(linksSelectorRestriction, anchors => {
    return anchors.map(anchor => {
      return {
        url: anchor.href,
        linkText: anchor.textContent
          .replace(/\\n/g,'')
          .trim()
      };
    });
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
  const pageData = await collectPageData({
    page,
    url: currentUrl,
    screenSizes: defaultScreenSizes
  });

  // Move to visited
  visitedUrls[urlKey] = pageData;
  delete collectedUrls[urlKey];

  // Add to Tree
  addUrlToTree({
    url: currentUrl,
    pageData
  });

  const treeList = treeToList();

  // Fill template with data
  const renderedTree = await fillTemplates({
    templateId: 'treeListToplevel',
    data: {
      items: treeList,
    }
  });
  const renderedScreens = await fillTemplates({
    templateId: 'screensList--lazyload',
    data: {
      images: Object.values(visitedUrls)
    }
  });

  const renderedTabs = await fillTemplates({
    templateId: 'tabs',
    data: {
      items: [
        {
          id: tabsIds[0],
          title: 'Links tree',
          content: renderedTree,
          checked: checkedTab === tabsIds[0] ? 'checked' : ''
        },
        {
          id: tabsIds[1],
          title: 'Screens',
          content: renderedScreens,
          checked: checkedTab === tabsIds[1] ? 'checked' : ''
        }
      ]
    }
  });

  logsEmit({
    task: 'handle url',
    status: 'success',
    message: `${currentUrl} was processed. Collected urls: ${Object.keys(collectedUrls).length}`,
    data: renderedTabs
  });
};

// ------------------------------

const fillTemplates = ({data, templateId}) => {
  const renderedContent = mustache.render(templates[templateId], data);

  return renderedContent;
};

// ------------------------------

module.exports = getUrls;
