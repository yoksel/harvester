const actBeforeStart = require('./actBeforeStart');
const clearUrlDomain = require('./clearUrlDomain');
const clearUrlProtocol = require('./clearUrlProtocol');
const closeBanner = require('./closeBanner');
const loadTemplates = require('./loadTemplates');
const logs = require('./logs');
const makeLogin = require('./makeLogin');
const sendData = require('./sendData');

const fs = require('fs');

const getNameFromUrl = (url) => {
  return url.replace(/\//g,'_')
    .replace(/\?/g,'_')
    .replace(/=/g,'_')
    .replace(/ /g,'_')
    .replace(/%/g,'')
    .replace(/:/g,'')
    .replace(/\./g,'_');
};

const clearText = (str) => {
  return str
    .replace(/[\n\t\r]/g,' ')
    .replace(/\s{2,}/g,' ')
    trim();
};

const writeFile = (fileName, content) => {
  fs.writeFile(fileName, JSON.stringify(content, null, '\t'), function(error){
    if(error) throw error;
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

const writeIndexFile = (content) => {
  const indexSrcFile = 'assets/index-src.html';
  const indexFile = 'index.html';
  const mod = 'urls';

  // Read markup from source
  fs.readFile(indexSrcFile, 'utf8', function(error, markup){
    if(error) throw error;
    const dataStr = `<script type="text/javascript">
const showLinks = true;
const showScreens = false;
const data = ${JSON.stringify(content, null, '\t')};
</script>`;
    markup = markup
      .replace('{{data}}', dataStr)
      .replace('{{mod}}', mod);

    // Write markup to destination
    fs.writeFile(indexFile, markup, function(error){
      if(error) throw error;
      // console.log(`Data was written to ${indexFile}`);
    });
  });
};

const writeScreensFile = (content, task = 'urls') => {
  const indexSrcFile = 'assets/index-src.html';
  let indexFile = 'urls-screens.html';
  let mod = 'usrls-screens';

  if(task === 'screens') {
    indexFile = 'screens.html';
    mod = 'screens';
  }

  // Read markup from source
  fs.readFile(indexSrcFile, 'utf8', function(error, markup){
    if(error) throw error;
    const dataStr = `<script type="text/javascript">
  const showLinks = false;
  const showScreens = true;
  const data = ${JSON.stringify(content, null, '\t')};
</script>`;
    markup = markup
      .replace('{{data}}', dataStr)
      .replace('{{mod}}', mod);

    // Write markup to destination
    fs.writeFile(indexFile, markup, function(error){
      if(error) throw error;
      // console.log(`Data was written to ${indexFile}`);
    });
  });
};

const writeAllFiles = ({visitedUrls, collectedUrls, tree}) => {
  // Write visited links before searching next
  try {
    writeVisitedFile(visitedUrls);
  }
  catch(e) {
    console.log('Data file was not written');
    console.log(e);
  }

  // Write visited links before searching next
  try {
    writeScreensFile(visitedUrls);
  }
  catch(e) {
    console.log('Screens file was not written');
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
};

module.exports = {
  actBeforeStart,
  clearUrlProtocol,
  clearUrlDomain,
  clearText,
  closeBanner,
  getNameFromUrl,
  loadTemplates,
  logs,
  makeLogin,
  sendData,
  writeFile,
  writeAllFiles,
  writeVisitedFile,
  writeCollectedFile,
  writeTreeFile,
  writeIndexFile,
  writeScreensFile
};
