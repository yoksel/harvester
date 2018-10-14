const sendData = require('./sendData');

const logs = (ws) => {
  const sendDataWS = sendData(ws);

  const emit = (data) => {
    sendDataWS(data);

    if(data.message) {
      console.log('* ------------------------ *');
      console.log('Task:',data.task);
      console.log('Status:',data.status);
      console.log('Message:',data.message);
      console.log('* ------------------------ *');
    }
  }

  return emit;
};

module.exports = logs;
