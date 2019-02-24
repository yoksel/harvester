const fs = require('fs');
const getFolderName = require('./getFolderName');
const logs = require('./logs');

const checkIsCollectedDataExist = (data, ws, fileName) => {
  const logsEmit = logs(ws);
  const folderName = getFolderName(data);
  const filePathVisited = `public/${folderName}/data/${fileName}`;
  const isFileExist = fs.existsSync(filePathVisited);

  logsEmit({
    task: 'check collected data',
    data: {
      isFileExist
    }
  });
};

module.exports = checkIsCollectedDataExist;
