const {
  logs,
  fillTemplates
} = require('../../helpers');

const getPromises = require('./getPromises');
const {renderTabs} = require('./renderTabs');
const treeToList = require('./treeToList');

const showData = async (data, ws, templates) => {
  if(data.listId === 'urls') {
    const logsEmit = logs(ws);
    const promisesList = getPromises(data);

    Promise.all(promisesList)
      .then(async (content) => {
        const tree = JSON.parse(content[0]);
        const treeList = treeToList({tree, templates});
        const visitedUrls = JSON.parse(content[1]);

        const renderedTabs = await renderTabs({treeList, visitedUrls, templates});

        logsEmit({
          task: 'show collected data',
          status: 'success',
          message: `Collected data was printed`,
          data: renderedTabs
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

module.exports = showData;
