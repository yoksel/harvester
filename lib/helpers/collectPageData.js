const URL = require('url').URL;

const clearUrlDomain = require('./clearUrlDomain');
const getNameFromUrl = require('./getNameFromUrl');

const collectPageData = async ({
  page,
  url,
  screenSizes,
  screenFullPage = false
}) => {

  const urlData = new URL(url);
  const title = await page.title();
  let name = getNameFromUrl(url);
  const urlKey = clearUrlDomain(url);
  const screenName = `${name}--${screenSizes.width}x${screenSizes.height}.png`;
  const screenPath = `screens/${screenName}`;
  const data = {};
  page.setViewport(screenSizes);

  await page.screenshot({
    path: `public/${screenPath}`,
    fullPage: screenFullPage || false
  });

  data.screenPath = [screenPath];
  data.title = title;
  data.url = url;
  data.pathname = urlData.pathname;

  return data;
};

module.exports = collectPageData;
