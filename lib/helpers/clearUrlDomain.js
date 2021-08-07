const clearUrlProtocol = require('./clearUrlProtocol');

const clearUrlDomain = (url) => {
  const {host} = new URL(url);

  let result = clearUrlProtocol(url)
    .replace(host,'')
    .replace(/^\//,'') // slash on start
    .replace(/\/$/,'') // slash on end
    .replace(/^\./,'') // dot on start
    .replace(/\.$/,'') // dot on end
    .replace(/\.\//,'/')
    .replace(/\d{5,20}/,'');

  if (result === '') {
    result = 'main';
  }

  return result;
};

module.exports = clearUrlDomain;
