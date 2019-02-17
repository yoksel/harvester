const fs = require('fs');

const getFilesPromises = (filesList) => {
  const readFilePromises = filesList.map(filePath => {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', function (err, contents) {
        if (err) {
          reject(err);
        }

        resolve(contents);
      });
    });
  });

  return readFilePromises;
};

module.exports = getFilesPromises;
