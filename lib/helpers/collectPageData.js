const clearUrlDomain = require('./clearUrlDomain');
const getNameFromUrl = require('./getNameFromUrl');

const collectPageData = async ({
    page,
    url,
    screenSizes,
    screenFullPage = false
  }) => {

  const title = await page.title();
  let name = getNameFromUrl(url);
  const urlKey = clearUrlDomain(url);
  const screenName = `${name}--${screenSizes.width}x${screenSizes.height}.png`;
  const screenPath = `screens/${screenName}`;
  const data = {};

  await page.screenshot({
    path: `public/${screenPath}`,
    fullPage: screenFullPage || false
  });

  data.screenPath = [screenPath];
  data.title = title;
  data.url = url;

  return data;
};

module.exports = collectPageData;
