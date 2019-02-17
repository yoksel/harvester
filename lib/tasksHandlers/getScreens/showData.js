const {
  logs,
  fillTemplates
} = require('../../helpers');

const getPromises = require('./getPromises');

const showData = async (data, ws, templates) => {
  if(data.listId === 'screens') {
    const logsEmit = logs(ws);
    const promisesList = getPromises(data);

    Promise.all(promisesList)
      .then(async (content) => {
        const images = Object.values(JSON.parse(content[0]));
        const renderedList = await fillTemplates({
          template: templates.screensList,
          data: {
            images
          }
        });

        logsEmit({
          task: 'show collected data',
          status: 'success',
          message: `Collected data was printed`,
          data: renderedList
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
