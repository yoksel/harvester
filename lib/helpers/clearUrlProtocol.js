const clearUrlProtocol = (url) => {
  return url
    .replace(/(?:http|https):\/\//,'')
    .replace(/www\./,'');
};

module.exports = clearUrlProtocol;
