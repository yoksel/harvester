const sendData = (ws) => {

  return (data) => {
    if(!data) {
      return null;
    }

    ws.send(JSON.stringify(data));
  }
};

module.exports = sendData;
