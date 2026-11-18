const closeBanner = async ({
  page,
  logsEmit,
  url,
  closeBannerSelector,
  isTaskStopped
}) => {
  if (isTaskStopped === true) {
    return;
  }

  const getCloseBannerPromise = (selector) => {
    return new Promise((resolve, reject) => {
      page.$eval(
        selector,
        bannerElemClose => {
          if (bannerElemClose) {
            bannerElemClose.click();
            return true;
          }

          return false;
        })
        .then(async bannerWasClosed => {
          if (bannerWasClosed) {
            await page.waitFor(2000);

            logsEmit({
              task: 'close banner',
              status: 'success',
              message: `Banner was closed on ${url}, ${bannerWasClosed}`
            });

            resolve();
          } else {
            logsEmit({
              task: 'close banner',
              status: 'success',
              message: `Banner was not found, ${bannerWasClosed}`
            });

            resolve();
          }
        })
        .catch(err => {
          resolve();
        });
    });
  };

  const promises = [];

  if (Array.isArray(closeBannerSelector)) {
    closeBannerSelector.forEach(selector => {
      const closeBannerPromise = getCloseBannerPromise(selector);
      promises.push(closeBannerPromise);
    });
  } else {
    const closeBannerPromise = getCloseBannerPromise(closeBannerSelector);
    promises.push(closeBannerPromise);
  }

  await Promise.all(promises);
};

module.exports = closeBanner;
