const actBeforeStart = require('./actBeforeStart');
const clearUrlDomain = require('./clearUrlDomain');
const clearUrlProtocol = require('./clearUrlProtocol');
const closeBanner = require('./closeBanner');
const collectPageData = require('./collectPageData');
const filterLinks = require('./filterLinks');
const deepClone = require('./deepClone');
const getNameFromUrl = require('./getNameFromUrl');
const loadTemplates = require('./loadTemplates');
const logs = require('./logs');
const makeLogin = require('./makeLogin');
const sendData = require('./sendData');
const eventEmitter = require('./eventEmitter');

const fs = require('fs');

const clearText = (str) => {
  return str
    .replace(/[\n\t\r]/g,' ')
    .replace(/\s{2,}/g,' ')
    .trim();
};

const writeCodeFile = (fileName, content) => {
  fs.writeFile(fileName, content, function (error) {
    if (error) {
      throw error;
    }
    // console.log(`Data was written to ${fileName}`);
  });
};

const writeFile = (fileName, content) => {
  fs.writeFile(fileName, JSON.stringify(content, null, '\t'), function (error) {
    if (error) {
      throw error;
    }
    // console.log(`Data was written to ${fileName}`);
  });
};

const writeVisitedFile = (content) => {
  writeFile('data/visited.json', content);
};

const writeCollectedFile = (content) => {
  writeFile('data/collected.json', content);
};

const writeTreeFile = (content) => {
  writeFile('data/tree.json', content);
};

const writeAllFiles = ({visitedUrls, collectedUrls, tree}) => {
  // Write visited links before searching next
  try {
    writeVisitedFile(visitedUrls);
  } catch (e) {
    console.log('Data file was not written');
    console.log(e);
  }

  // Write collected links before searching next
  try {
    writeCollectedFile(collectedUrls);
  } catch (e) {
    console.log('Collected file was not written');
    console.log(e);
  }

  try {
    writeTreeFile(tree);
  } catch (e) {
    console.log('Tree file was not written');
    console.log(e);
  }
};

module.exports = {
  actBeforeStart,
  clearUrlProtocol,
  clearUrlDomain,
  clearText,
  closeBanner,
  collectPageData,
  deepClone,
  eventEmitter,
  filterLinks,
  getNameFromUrl,
  loadTemplates,
  logs,
  makeLogin,
  sendData,
  writeFile,
  writeCodeFile,
  writeAllFiles,
  writeVisitedFile,
  writeCollectedFile,
  writeTreeFile
};
