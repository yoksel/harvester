const clearUrlProtocol = require('./clearUrlProtocol');

const clearUrlDomain = (url) => {
  let result = clearUrlProtocol(url)
    // TODO
    .replace(/livejournal.com/,'')
    .replace(/^\//,'') // slash on start
    .replace(/\/$/,'') // slash on end
    .replace(/^\./,'') // dot on start
    .replace(/\.$/,'') // dot on end
    .replace(/\.\//,'/');

  if(result === '') {
    result = 'main';
  }

  return result;
};

module.exports = clearUrlDomain;
