const {
  fillTemplates,
  getFolderName,
  logs,
  writeCodeFile
} = require('../../helpers');

const getPromises = require('./getPromises');

const downloadData = async (data, ws, templates) => {
  if(data.listId === 'screens') {
    const logsEmit = logs(ws);
    const promisesList = getPromises(data);
    const folderName = getFolderName(data);

    Promise.all(promisesList)
      .then(async (content) => {
        const images = Object.values(JSON.parse(content[0]));
        const regexp = new RegExp(`${folderName}&#x2F;screens`, 'g');

        const renderedList = await fillTemplates({
          template: templates.screensList,
          data: {
            images
          }
        });
        const contentWithReplacedUrls = renderedList.replace(regexp, 'screens/');

        const pageContent = await fillTemplates({
          template: templates.savedIndex,
          data: {
            styles: content[1],
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
          .catch(error => {
            logsEmit({
              task: 'download collected data',
              status: 'error',
              message: `Archive was not written: ${error}`,
            });
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
        logsEmit({
          task: 'download collected data',
          status: 'error',
          message: `No saved data, run task to collect it: ${error}`,
        });
      });
  }
};

module.exports = downloadData;
