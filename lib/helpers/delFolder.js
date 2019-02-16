const del = require('del');

const delFolder = (path) => {
  return del(path)
    .then(() => {
      return true;
    })
    .catch(err => {
      return false;
    });
};

module.exports = delFolder;
