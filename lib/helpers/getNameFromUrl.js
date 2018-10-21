const getNameFromUrl = (url) => {
  return url.replace(/\//g,'_')
    .replace(/\?/g,'_')
    .replace(/=/g,'_')
    .replace(/ /g,'_')
    .replace(/%/g,'')
    .replace(/:/g,'')
    .replace(/\./g,'_');
};

module.exports = getNameFromUrl;
