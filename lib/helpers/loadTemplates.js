const fs = require('fs');

const getPromisesList = (templatesNames) => {
  return promisesList = templatesNames
    .map(name => {
      const tmplPath = `./views/${name}.html`;

      return new Promise((resolve, reject) => {
        fs.readFile(tmplPath, 'utf8', function(err, contents) {
            if(err) {
              reject(err);
            }

            resolve(contents);
        });
      })
    });
};

const loadTemplates = (templatesNames = []) => {
  return new Promise((resolve, reject) => {
    const promisesList = getPromisesList(templatesNames);

    Promise.all(promisesList)
      .then((templatesList) => {

        const templates = templatesNames
          .reduce((prev, name, index) => {
            prev[name] = templatesList[index];

            return prev;
          }, {});

        resolve(templates);
      })
      .catch(error => {
        reject(error);
      });
  });
};

module.exports = loadTemplates;
