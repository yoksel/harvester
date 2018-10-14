const clearUrlDomain = require('./clearUrlDomain');

const actBeforeStart = async (params) => {
  const {
    page,
    beforeStart
  } = params;

  const promise = new Promise(async (resolve, reject) => {
    if(!beforeStart) {
      resolve(null);
    }

    await page.goto(beforeStart.url);

    await beforeStart.clickSelectors.forEach(async (item) => {
      await page.click(item);
    });

    // TODO: handle errors
    await page.waitForNavigation();

    await page.screenshot({
      path: `public/screens/_beforeStart.png`,
      fullPage: false
    });

    const urlKey = clearUrlDomain(beforeStart.url);
    const result = {
      screenPath: [`screens/_beforeStart.png`],
      url: beforeStart.url
    };

    resolve({
      urlKey: result
    });
  });

  return promise;

}

module.exports = actBeforeStart;
