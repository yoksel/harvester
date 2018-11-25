const sendData = (ws) => {

  return (data) => {
    if (!data) {
      return null;
    }

    ws.send(JSON.stringify(data), (error) => {
      if (error) {
        console.log('Error while sending data to page: ', error);
      }
    });
  };
};

module.exports = sendData;
