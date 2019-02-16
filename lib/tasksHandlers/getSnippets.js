const fs = require('fs');
const puppeteer = require('puppeteer');
const mustache = require('mustache');
const URL = require('url').URL;

const tasks = require('../../tasks/');
const credits = require('../../credits');

const {
  clearUrlDomain,
  collectPageData,
  createFolder,
  delFolder,
  eventEmitter,
  getNameFromUrl,
  loadTemplates,
  logs,
  writeFile,
  writeCodeFile,
  sendData,
} = require('../helpers');

let creditsEnv = 'dev';
let visitedUrls = {};
let collectedLinks = [];
let collectedSnippetsLinks = {};
const createdFolders = {};
const snippetsFolderPath = 'public/snippets';
const dataFolderPath = `${snippetsFolderPath}/data`;

let isTaskStopped = false;

const taskStopper = () => {
  isTaskStopped = true;
};

eventEmitter.subscribe('stop-task', taskStopper);

const templatesNames = [
  'linksList',
  'statsList'
];

let templates = {};
const templatesPromise = loadTemplates(templatesNames)
  .then(result => {
    templates = result;
  })
  .catch(error => {
    console.log('Error while loading templates: ', error);
  });

let currentTask = {};

// ------------------------------

const getSnippets = async ({
  browser,
  logsEmit,
  tasksGroupData,
  task,
}) => {

  isTaskStopped = false;

  currentTask = task;
  await templatesPromise;
  await createFolder(snippetsFolderPath);
  await createFolder(dataFolderPath);

  const {
    id,
    subtask,
    name,
    linksSelectorRestriction,
    codeSelector,
    urls,
    snippetsListFilePath
  } = task;

  visitedUrls = {};

  // Huge sizes are needed to grab code form CodeMirror
  const screenSizes = {
    width: 2560,
    height: 5000
  };
  const screenFullPage = task.screenFullPage || tasksGroupData.screenFullPage;

  const page = await browser.newPage();
  const fullPage = screenFullPage || false;

  // Run with care, can be banned by frames sources
  // Neet to be fixed
  if (subtask === 'get-snippets-urls') {
    let next = urls[0];
    await grabFrameUrls({
      next,
      logsEmit,
      page,
      linksSelectorRestriction,
      snippetsListFilePath
    });
  } else if (subtask === 'get-snippets-code') {
    await grabSnippetsCode({
      logsEmit,
      browser,
      screenSizes,
      screenFullPage
    });
  } else {
    const message = 'Set subtask in config: get-snippets-urls or get-snippets-code';

    logsEmit({
      task: name,
      status: 'error',
      message
    });

    throw new Error(message);
  }

  if (isTaskStopped === true) {
    return;
  }

  logsEmit({
    task: name,
    status: 'success',
    message: 'Task finished'
  });
};

// ------------------------------

const getSnippetsListFromFile = (snippetsListFilePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(snippetsListFilePath, 'utf8', function (error, data) {
      if (error) {
        reject(error);
      }

      resolve(JSON.parse(data));
    });
  });
};

// ------------------------------

const grabSnippetsCode = async ({
  logsEmit,
  browser,
  screenSizes,
  screenFullPage
}) => {
  const {codeSelector, snippetsListFilePath} = currentTask;
  const filePath = `${dataFolderPath}/${snippetsListFilePath}`;
  const snippetsList = await getSnippetsListFromFile(filePath);
  const pages = Object.keys(snippetsList);
  const promises = [];
  let counter = 0;

  await delFolder(dataFolderPath);
  await createFolder(dataFolderPath);

  // Links object to flat list
  const demosList = snippetsList
    .reduce((prev, item) => {
      const linksList = item.links;

      linksList.forEach(link => {
        prev.push({
          url: link,
          pageName: item.articleName
        });
      });

      return prev;
    }, []);

  let next = demosList[counter];

  while (isTaskStopped === false && next) {
    const folderPath = `${dataFolderPath}/${next.pageName}`;
    const folderResult = await createFolder(folderPath);

    await processDemo({
      linkData: next,
      logsEmit,
      browser,
      screenSizes,
      screenFullPage
    });

    counter++;
    next = demosList[counter];
  }

  return true;
};

// ------------------------------

const processDemo = async ({
  linkData,
  logsEmit,
  browser,
  screenSizes,
  screenFullPage
}) => {
  const {codeSelector, dropUrlPart} = currentTask;
  const {width, height} = screenSizes;
  const {url, pageName} = linkData;

  await browser.newPage()
    .then(async page => {
      await page.waitFor(Math.random() * 10000 + 2000);

      await page.setViewport({width: width, height: height});

      await page.goto(url)
        .then(async (result) => {
          await page.waitFor(5000);

          logsEmit({
            task: 'handle snippet',
            status: 'start',
            message: `Start process ${url}`
          });

          // Get all codes from page
          let codes = await page.$$eval(codeSelector, codesList => {
            return codesList.map(codesItem => {
              return {
                src: codesItem.innerText,
                innerText: codesItem.innerText.trim(),
                value: codesItem.value,
                id: codesItem.previousSibling ? codesItem.previousSibling.id : null
              };
            });
          });

          await codes.forEach(code => {
            const content = code.innerText !== '' ? code.innerText : code.value;

            if (content !== '') {
              let clearUrl = dropUrlPart ? url.replace(dropUrlPart, '') : url;
              const urlData = new URL(clearUrl);
              const name = urlData.pathname
                .replace('.html', '')
                .split('/')
                // .slice(0,3) check this with jsbin
                .join('_')
                .replace(/^_/, '')
                .replace(`${pageName}_`, '');
              let id = '';

              if (code.id) { // may be Codemirror
                id = code.id.replace('javascript','js');
              } else {
                const checkIsHtml = content.match(/<\S{2,10}[^<\n]{0,}>/g);

                if (checkIsHtml) {
                  id = 'html';
                } else {
                  // No variant for js
                  // TOD: add js detection
                  id = 'css';
                }
              }

              if (id !== '') {
                const fileName = `${dataFolderPath}/${pageName}/${name}.${id}`;
                const text = content;
                writeCodeFile(fileName, text);

                if (!collectedSnippetsLinks[pageName]) {
                  collectedSnippetsLinks[pageName] = {
                    articleName: pageName,
                    links: [],
                    counter: 0
                  };
                }

                collectedSnippetsLinks[pageName].links.push(fileName);
                collectedSnippetsLinks[pageName].counter++;
              }
            }
          });

          const items = Object.values(collectedSnippetsLinks);
          const renderedList = await fillTemplates({items}, 'statsList');

          logsEmit({
            task: 'handle snippet',
            status: 'success',
            message: `${url} processed`,
            data: renderedList
          });
        })
        .catch(err => {
          console.log('\nERR url', url);
          console.log('Err while opening demo url:', err);
        });
    });// End browser
};

// ------------------------------

const grabFrameUrls = async ({
  next,
  logsEmit,
  page,
  linksSelectorRestriction,
  snippetsListFilePath
}) => {

  while (isTaskStopped === false && next) {
    const promises = [];

    const currentUrl = next;
    const articlePathName = new URL(currentUrl).pathname;
    const articleName = getNameFromUrl(articlePathName);
    const folderPath = `${dataFolderPath}/${articleName}`;

    logsEmit({
      task: 'handle urls',
      status: 'in-progress',
      message: `URL: ${currentUrl}`
    });

    await page.goto(currentUrl);

    // Get all links from page
    let links = await page.$$eval(linksSelectorRestriction, frames => {
      return frames.map(frame => {
        return {
          src: frame.src || frame.dataset.src
        };
      });
    });

    if (links.length === 0) {
      logsEmit({
        task: 'collect urls',
        status: 'in-progress',
        message: `No links with selector ${linksSelectorRestriction} on ${currentUrl}`
      });
    } else {
      links = links
        .map(item => {
          let url = item.src;
          if (!url) {
            return;
          }

          // Need for JSBin demos
          url = url.replace(/\/embed\?[\S]{1,}/g, '/edit?html,css');
          // Need for live-snippet demos
          url = url.replace(/\?output/g, '');
          url = url.replace(/\?css/g, '');
          return url;
        });

      collectedLinks.push({
        articleUrl: currentUrl,
        articleName,
        links
      });

      await Promise.all(promises)
        .then(async (result) => {
          // Print collected links to page
          const items = collectedLinks;
          const renderedList = await fillTemplates({items}, 'linksList');

          logsEmit({
            task: 'handle urls',
            status: 'success',
            message: 'Go to next',
            data: renderedList
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

    // Get next
    const nextLinks = await page.$$eval('.pagination__item--next', linksList => {
      return linksList.map(link => {
        return link.href;
      });
    });

    if (nextLinks.length > 0) {
      next = nextLinks[0];
    } else {
      next = null;
    }

    if (snippetsListFilePath) {
      const filePath = `${dataFolderPath}/${snippetsListFilePath}`;
      writeFile(filePath, collectedLinks);

    } else {
      logsEmit({
        task: 'handle urls',
        status: 'error',
        message: 'Need to set param `snippetsListFilePath` in config',
      });
    }
  }

  return true;
};

// ------------------------------

const fillTemplates = (data, temlateName) => {
  const renderedContent = mustache.render(templates[temlateName], data);

  return renderedContent;
};

// ------------------------------

module.exports = getSnippets;
