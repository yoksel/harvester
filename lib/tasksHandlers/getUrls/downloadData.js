const {
  fillTemplates,
  getFolderName,
  logs,
  writeCodeFile
} = require('../../helpers');

const getPromises = require('./getPromises');
const {renderTabs} = require('./renderTabs');
const treeToList = require('./treeToList');

const downloadData = async (data, ws, templates) => {
  if(data.listId === 'urls') {
    const logsEmit = logs(ws);
    const promisesList = getPromises(data);
    const folderName = getFolderName(data);

    Promise.all(promisesList)
      .then(async (content) => {
        const tree = JSON.parse(content[0]);
        const treeList = treeToList({tree, templates});
        const visitedUrls = JSON.parse(content[1]);
        const regexp = new RegExp(`${folderName}&#x2F;screens`, 'g');

        const renderedTabs = await renderTabs({treeList, visitedUrls, templates});
        const contentWithReplacedUrls = renderedTabs.replace(regexp, 'screens/');
        const pageContent = await fillTemplates({
          template: templates.savedIndex,
          data: {
            styles: content[2],
            listId: data.listId,
            taskId: data.taskId,
            content: contentWithReplacedUrls,
          }
        });

        writeCodeFile(`public/${folderName}/index.html`, pageContent)
          .then(() => {
            // https://stackoverflow.com/questions/15641243/need-to-zip-an-entire-directory-using-node-js
            const child_process = require("child_process");
            child_process.execSync(`zip -r ../../public/downloads/${folderName} *`, {
              cwd: `public/${folderName}`
            });
          })
          .catch(err => {
            console.log(err);
          });

        logsEmit({
          task: 'download collected data',
          status: 'download',
          message: `Collected data ready to be downloaded`,
          data: {
            name: `${folderName}.zip`,
            url: `downloads/${folderName}.zip`
          }
        });
      })
      .catch(error => {
        console.log(error);

        logsEmit({
          task: 'show collected data',
          status: 'error',
          message: `No saved data, run task to collect it`,
        });
      });
  }
};

module.exports = downloadData;
