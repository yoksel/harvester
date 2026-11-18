const clearUrlProtocol = require('./clearUrlProtocol');

const clearUrlDomain = (url) => {
  try {
    const {host} = new URL(url.trim());

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
  } catch (error) {
    console.log('Something went wrong in clearUrlDomain():');
    console.log(error);
  }
};

module.exports = clearUrlDomain;
