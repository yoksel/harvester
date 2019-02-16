const fs = require('fs');

const createdFolders = [];

const createFolder = async (path) => {
  console.log('createFolder()');
  console.log('path:', path);

  const promise = new Promise((resolve, reject) => {
    fs.mkdir(path, {recursive: true}, (err) => {
      if (err) {
        reject(err);
      }

      createdFolders[path] = path;
      resolve(path);
    });
  });

  const result = await promise
    .then(pathOfCreated => {
      return pathOfCreated;
    })
    .catch(err => {
      if(err.code === 'EEXIST') {
        return path;
      }

      console.log('Err while creating folder', err);
    });

  return result;
};

module.exports = createFolder;
