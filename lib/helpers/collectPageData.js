const URL = require('url').URL;

const clearUrlDomain = require('./clearUrlDomain');
const getNameFromUrl = require('./getNameFromUrl');

const collectPageData = async ({
  page,
  url,
  screenSizes = {},
  screenFullPage = false,
  deviceData,
  screenSelector = ''
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

  // const screenSelector = deviceData ? deviceData.screenSelector : screenSizes.screenSelector;

  //screenSelector
  if(screenSelector) {
    // Get clip area

    clip = await page.evaluate(async (screenSelector) => {
      const element = document.querySelector(screenSelector);
      let {x, y, width, height} = element.getBoundingClientRect();
      // 1.5 (not 2) need to escape from banner which I can't catch & hide
      y = y + height;
      window.scrollTo(0, y);

      // Check height after scroll & scroll again
      const newElemRect = element.getBoundingClientRect();
      window.scrollTo(0, y - height + newElemRect.height);

      const slotElement = document.querySelector('DIV[lj-sale-init*="adfox_mobile_content"]');
      let slotElementRect = {};

      if(slotElement) {
        slotElementRect = slotElement.getBoundingClientRect();
      }

      return {
        x, y, width, height,
        slot: {
          y: slotElementRect.y || 0,
          h: slotElementRect.height || 0,
          elemH: newElemRect.height
        }
      };
    }, screenSelector);

    const offset = 200;
    clip.y -= offset;

    clip.x = 0;
    clip.width = screenSizes.width ? screenSizes.width : deviceData.viewport.width;
    clip.height = clip.width * 2;

    if(!deviceData) {
      clip.height = clip.width;
    }

    console.log('----------------------');
    console.log('device: ', deviceName);
    console.log(clip);
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

  data.screenPath = [screenPath];
  data.title = title;
  data.url = url;
  data.pathname = urlData.pathname;

  return data;
};

module.exports = collectPageData;
