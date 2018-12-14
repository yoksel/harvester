const URL = require('url').URL;

const clearUrlDomain = require('./clearUrlDomain');
const getNameFromUrl = require('./getNameFromUrl');

const collectPageData = async ({
  page,
  url,
  screenSizes,
  screenFullPage = false,
  deviceData
}) => {

  const urlData = new URL(url);
  const title = await page.title();
  let name = getNameFromUrl(url);
  const urlKey = clearUrlDomain(url);
  const deviceName = deviceData ? deviceData.name : '';
  let info = `${screenSizes.width}x${screenSizes.height}`;
  if(deviceName) {
    info = deviceName;
  }
  const screenName = `${name}--${info}.png`;
  const screenPath = `screens/${screenName}`;
  const data = {};
  let clip = {};

  const screenSelector = deviceData ? deviceData.screenSelector : screenSizes.screenSelector;

  if(screenSelector) {
    console.log('screenSelector:',screenSelector);

    clip = await page.evaluate(screenSelector => {
      const element = document.querySelector(screenSelector);
      const {x, y, width, height} = element.getBoundingClientRect();
      return {x, y, width, height};
    }, screenSelector);

    clip.y -= 300;
    clip.height += 600;
  }

  if(!deviceData) {
    page.setViewport(screenSizes);
  }
  else if(deviceData) {
    clip.width = deviceData.viewport.width;
  }

  const screenShotOptions = {
    path: `public/${screenPath}`
  };

  if(clip.width !== undefined) {
    screenShotOptions.clip = clip;
  }
  else {
    screenShotOptions.fullPage = screenFullPage || false;
  }

  await page.screenshot(screenShotOptions);

  data.screenPath = [screenPath];
  data.title = title;
  data.url = url;
  data.pathname = urlData.pathname;

  return data;
};

module.exports = collectPageData;
