const clearUrlProtocol = (url) => {
  if(!url) {
    return url;
  }

  return url
    .replace(/(?:http|https):\/\//,'')
    .replace(/www\./,'');
};

module.exports = clearUrlProtocol;
