const {
  getFilesPromises,
  getFolderName
} = require('../../helpers');

const getPromises = (data) => {
  const folderName = getFolderName(data);
  const filePathVisited = `public/${folderName}/data/visited.json`;
  const filePathCSS = `public/assets/styles.css`;
  const filePathsList = [filePathVisited, filePathCSS];

  return getFilesPromises(filePathsList);
};

module.exports = getPromises;
