const {
  getFilesPromises,
  getFolderName
} = require('../../helpers');

const getPromises = (data) => {
  const folderName = getFolderName(data);
  const filePathTree = `public/${folderName}/data/tree.json`;
  const filePathVisited = `public/${folderName}/data/visited.json`;
  const filePathCSS = `public/assets/styles.css`;
  const filePathsList = [filePathTree, filePathVisited, filePathCSS];

  return getFilesPromises(filePathsList);
};

module.exports = getPromises;
