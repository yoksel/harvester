const actBeforeStart = require('./actBeforeStart');
const clearUrlDomain = require('./clearUrlDomain');
const clearUrlProtocol = require('./clearUrlProtocol');
const closeBanner = require('./closeBanner');
const collectPageData = require('./collectPageData');
const createFolder = require('./createFolder');
const filterLinks = require('./filterLinks');
const getFolderName = require('./getFolderName');
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

const writeVisitedFile = (folderName, content) => {
  writeFile(`public/${folderName}/data/visited.json`, content);
};

const writeCollectedFile = (folderName, content) => {
  writeFile(`public/${folderName}/data/collected.json`, content);
};

const writeTreeFile = (folderName, content) => {
  writeFile(`public/${folderName}/data/tree.json`, content);
};

const writeAllFiles = async ({folderName, visitedUrls, collectedUrls, tree}) => {
  // Write visited links before searching next
  try {
    writeVisitedFile(folderName, visitedUrls);
  } catch (e) {
    console.log('Data file was not written');
    console.log(e);
  }

  // Write collected links before searching next
  try {
    writeCollectedFile(folderName, collectedUrls);
  } catch (e) {
    console.log('Collected file was not written');
    console.log(e);
  }

  try {
    writeTreeFile(folderName, tree);
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
  createFolder,
  deepClone,
  eventEmitter,
  filterLinks,
  getNameFromUrl,
  getFolderName,
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
