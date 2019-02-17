const URL = require('url').URL;

const clearUrlDomain = require('./clearUrlDomain');
const getNameFromUrl = require('./getNameFromUrl');

const collectPageData = async ({
  page,
  url,
  screenSizes = {},
  screenFullPage = false,
  deviceData,
  screenSelector = {},
  folderName
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
  const screenPath = `${folderName}/screens/${screenName}`;
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

  if(clip.width !== undefined) {
    screenShotOptions.clip = clip;
  }
  else {
    screenShotOptions.fullPage = screenFullPage || false;
  }

  // Need to move bad banner from middle of the screen
  await page.waitFor(5000);

  await page.screenshot(screenShotOptions);

  data.screens = [{
    path: screenPath,
    sizes: screenSizes
  }];
  data.title = title;
  data.url = url;
  data.pathname = urlData.pathname;

  return data;
};

module.exports = collectPageData;
