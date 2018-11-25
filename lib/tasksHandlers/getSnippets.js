

const fs = require('fs');
const puppeteer = require('puppeteer');
const del = require('del');
const mustache = require('mustache');
const URL = require('url').URL;

const tasks = require('../../tasks/');
const credits = require('../../credits');

const {
  clearUrlDomain,
  collectPageData,
  getNameFromUrl,
  loadTemplates,
  logs,
  writeFile,
  writeCodeFile,
  sendData,
} = require('../helpers');

let creditsEnv = 'dev';
let visitedUrls = {};
let collectedLinks = {};

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

// ------------------------------

const delFolder = (path) => {
  return del(path)
    .then(path => {
      return true;
    })
    .catch(err => {
      return false;
    });
};

// ------------------------------

const createFolder = async (path) => {
  const promise = new Promise((resolve, reject) => {
    fs.mkdir(path, { recursive: true }, (err) => {
      if (err) {
        reject(err);
      };

      resolve(path);
    })
  });

  const result = await promise
    .then(path => {
      return path;
    })
    .catch(err => {
      console.log('Err while creating folder', err);
    });

  return result;
};

// ------------------------------

const createSnippetPromise = params => {
  const {
    browser,
    logsEmit,
    url,
    articleName,
    sizes,
    screenFullPage
  } = params;
  const width = sizes.width;
  const height = sizes.height;
  const urlKey = clearUrlDomain(url);

  if(!url) {
    console.log('NO URL');
    return;
  }

  return new Promise((resolve, reject) => {
    browser.newPage()
      .then(async page => {

        await page.setViewport({ width: width, height: height });
        await page.goto(url)
          .then(result => {
            // console.log(result);
          })
          .catch(err => {
            console.log('\nERR url', url);
            console.log('Err while openinn demo url:', err);
          });

        // Wait for loading
        await page.waitFor(10000);

        logsEmit({
          task: 'handle snippet',
          status: 'start',
          message: `Start process ${url}`
        });

        // Get all codes from page
        let codes = await page.$$eval('.CodeMirror', codes => {
          return codes.map(code => {
            return {
              innerText: code.innerText.trim(),
              id: code.previousSibling.id
            };
          });
        });

        if(codes.length === 0) {
          logsEmit({
            task: 'collect urls',
            status: 'in-progress',
            message: `No codes with selector on ${articleName}`
          });
        }

        // console.log(codes);
        const name = getNameFromUrl(url);
        // const folderPath = `./data/snippets/${articleName}/`;
        // await console.log(fs.lstat(folderPath));
        // const folder = await createFolder(`./data/snippets/${articleName}/`);
        // const folderPath = await createFolder(`./data/snippets/`);
        // console.log('folderPath', folderPath);

        await codes.forEach(code => {
          if(code.innerText != '') {
            const urlData = new URL(url);
            const name = urlData.pathname
              .split('/')
              .slice(0,3)
              .join('_');
            const id = code.id.replace('javascript','js');
            const fileName = `./data/snippets/${articleName}/${name}.${id}`;
            const text = code.innerText;
            writeCodeFile(fileName, text);
          }
        })

        const pageData = await collectPageData({
          page,
          url,
          screenSizes: sizes,
          screenFullPage
        });

        if(visitedUrls[urlKey]) {
          visitedUrls[urlKey].screenPath.push(pageData.screenPath);
        }
        else {
          visitedUrls[urlKey] = pageData;
        }

        const images = Object.values(visitedUrls);
        const renderedList = await fillTemplates({ images });

        logsEmit({
          task: 'handle urls',
          status: 'success',
          message: `${url} was processed`,
          data: renderedList
        });

        resolve();
      })
  })
};

// ------------------------------

const getSnippets = async ({
    browser,
    logsEmit,
    tasksGroupData,
    task,
  }) => {
  await templatesPromise;
  const {name, linksSelectorRestriction, urls} = task;

  await delFolder('./data/snippets');
  await createFolder(`./data/snippets/`);

  visitedUrls = {};

  const screenSizes = {
    width: 1000,
    height: 1000
  };
  const screenFullPage = task.screenFullPage || tasksGroupData.screenFullPage;

  logsEmit({
    task: name,
    status: 'in-progress',
    message: `Task started...`
  });

  const page = await browser.newPage();
  const fullPage = screenFullPage || false;
  let next = urls[0];

  while (next) {
    const promises = [];

    const currentUrl = next;
    const articlePathName = new URL(currentUrl).pathname;
    const articleName = getNameFromUrl(articlePathName);
    const folderPath = `./data/snippets/${articleName}`;

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

    if(links.length === 0) {
      logsEmit({
        task: 'collect urls',
        status: 'in-progress',
        message: `No links with selector ${linksSelectorRestriction} on ${currentUrl}`
      });
    }
    else {
      links = links
        .map(item => {
          let url = item.src;
          url = url.replace(/\/embed\?[\S]{1,}/g, '/edit?html,css');
          return url;
        });

      const folderResult = await createFolder(folderPath);
      // console.log('\nfolderResult\n', folderResult);
      collectedLinks[articleName] = links;

      // for (var k = 0; k < links.length; k++) {
      //   let url = links[k].src;
      //   url = url.replace(/embed\?output/g, 'edit?html,css,output');
      //   url = url.replace(/embed/g, 'edit?html,css,output');

      //   promises.push(createSnippetPromise({
      //     browser,
      //     logsEmit,
      //     url,
      //     articleName,
      //     sizes: screenSizes,
      //     screenFullPage
      //   }))
      // }

      console.log(articleName);
      console.log(links);
      // console.log('--------------------');

      await Promise.all(promises)
        .then(result => {
          //do nothing
          logsEmit({
            task: 'handle urls',
            status: 'success',
            message: 'Go to next'
          });
        })
        .catch(error => {
          if(error.name === 'TimeoutError') {
            logsEmit({
              task: 'handle urls',
              status: 'error',
              message: `${error.name} while loading pages: ${error.message}`,
              data: error
            });
          }
          else {
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
    const nextLinks = await page.$$eval('.pagination__item--next', links => {
      return links.map(link => {
        return link.href;
      });
    });

    if(nextLinks.length > 0) {
      // console.log('next', next);
      next = nextLinks[0];
    }
    else {
      next = null;
    }

    writeFile('data/collectedSnippetsLinks.json', collectedLinks);
  }

  logsEmit({
    task: name,
    status: 'success',
    message: `Task finished`
  });
};

// ------------------------------

const fillTemplates = (data) => {
  const renderedContent = mustache.render(templates.screensList, data);

  return renderedContent;
}

// ------------------------------

module.exports = getSnippets;
