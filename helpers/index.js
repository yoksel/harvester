const fs = require('fs');

const clearUrlProtocol = (url) => {
  return url
    .replace(/(?:http|https):\/\//,'')
    .replace(/www\./,'');
};

const clearUrlDomain = (url) => {
  let result = clearUrlProtocol(url)
    .replace(/livejournal.com/,'')
    .replace(/^\//,'') // slash on start
    .replace(/\/$/,'') // slash on end
    .replace(/^\./,'') // dot on start
    .replace(/\.$/,'') // dot on end
    .replace(/\.\//,'/');

  if(result === '') {
    result = 'main';
  }

  return result;
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

  // Read markup from source
  fs.readFile(indexSrcFile, 'utf8', function(error, markup){
    if(error) throw error;
    const dataStr = `<script type="text/javascript">
const showLinks = true;
const showScreens = false;
const data = ${JSON.stringify(content, null, '\t')};
</script>`;
    markup = markup.replace('<!-- data -->', dataStr);

    // Write markup to destination
    fs.writeFile(indexFile, markup, function(error){
      if(error) throw error;
      // console.log(`Data was written to ${indexFile}`);
    });
  });
};

const writeScreensFile = (content) => {
  const indexSrcFile = 'assets/index-src.html';
  const indexFile = 'screens.html';

  // Read markup from source
  fs.readFile(indexSrcFile, 'utf8', function(error, markup){
    if(error) throw error;
    const dataStr = `<script type="text/javascript">
const showLinks = false;
const showScreens = true;
const data = ${JSON.stringify(content, null, '\t')};
</script>`;
    markup = markup.replace('<!-- data -->', dataStr);

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
    writeScreensFile(tree);
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

const makeLogin = async (page, credits) => {
  const {
    loginUrl,

    username_selector,
    password_selector,
    submit_selector,

    username,
    password
  } = credits;

  await page.goto(loginUrl);

  await page.click(username_selector);
  await page.keyboard.type(username);

  await page.click(password_selector);
  await page.keyboard.type(password);

  await page.click(submit_selector);

  await page.waitForNavigation();

  return true;
}

module.exports = {
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
};
