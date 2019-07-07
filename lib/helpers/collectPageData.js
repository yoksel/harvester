const URL = require('url').URL;

const clearUrlDomain = require('./clearUrlDomain');
const getNameFromUrl = require('./getNameFromUrl');

const collectPageData = async ({
  page,
  url,
  from,
  screenSizes = {},
  screenFullPage = false,
  deviceData,
  screenSelector = {},
  folderName,
  isCompare,
  customData
}) => {
  const urlData = new URL(url);
  const title = await page.title();
  let name = getNameFromUrl(url).slice(0, 100);
  const urlKey = clearUrlDomain(url);
  const deviceName = deviceData ? deviceData.name : '';
  let info = `${screenSizes.width}x${screenSizes.height}`;
  if(deviceName) {
    info = deviceName;
  }
  const screenName = `${name}--${info}.png`;
  const screenPath = `${folderName}/screens/${screenName}`;
  const screenNameCompare = `${name}--${info}--compare.png`;
  const screenPathCompare = `${folderName}/screens/${screenNameCompare}`;
  const data = {};
  let clip = {};

  if(screenSelector.scrollTarget) {
    // Get clip area

    clip = await page.evaluate(async (screenSelector) => {
      const element = document.querySelector(screenSelector.underElem);
      let {x, y, width, height} = element.getBoundingClientRect();
      y = y + height;
      window.scrollTo(0, y);

      // Check height after scroll & scroll again
      const newElemRect = element.getBoundingClientRect();
      window.scrollTo(0, y - height + newElemRect.height);
      height = newElemRect.height;

      const slotElement = document.querySelector(screenSelector.scrollTarget);
      let slotHeight = slotElement ? slotElement.clientHeight : null;

      return {
        x, y, width, height, slotHeight
      };
    }, screenSelector);

    const offset = clip.slotHeight ? clip.slotHeight : 250;
    clip.y -= offset;

    clip.x = 0;
    clip.width = screenSizes.width ? screenSizes.width : deviceData.viewport.width;
    clip.height = offset * 3;
  }

  if(!deviceData) {
    page.setViewport(screenSizes);
  }

  const screenShotOptions = {
    path: `public/${screenPath}`
  };

  // Replace path to get second screen for comparing
  if(isCompare) {
    screenShotOptions.path = `public/${screenPathCompare}`;
  }

  if(clip.width !== undefined) {
    screenShotOptions.clip = clip;
  }
  else {
    screenShotOptions.fullPage = screenFullPage || false;
  }

  // Need to move bad banner from middle of the screen
  await page.waitFor(5000);

  await page.screenshot(screenShotOptions);

  const screensData = {
    path: screenPath,
    sizes: screenSizes
  };

  if(isCompare) {
    screensData.pathCompare = screenPathCompare;
  }

  if(deviceData) {
    screensData.device = deviceName;
    screensData.sizes = deviceData.viewport;
  }

  data.screens = [screensData];
  data.title = title || '(no title)';
  data.url = url;
  data.from = from;
  data.pathname = urlData.pathname;

  if(customData) {
    Object.assign(data, customData);
  }

  return data;
};

module.exports = collectPageData;
