const closeBanner = async ({
    page,
    logsEmit,
    url,
    closeBannerSelector
  }) => {
  logsEmit({
    task: 'close banner',
    status: 'in-progress',
    message: `Try to close banner on ${url}`
  });
  await page.$eval(
    closeBannerSelector,
    bannerElemClose => {
      if(bannerElemClose) {
        bannerElemClose.click();
        return true;
      }

      return false;
    })
      .then(async bannerWasClosed => {
        if(bannerWasClosed) {
          await page.waitFor(2000);
          logsEmit({
            task: 'close banner',
            status: 'success',
            message: `Banner was closed on ${url}, ${bannerWasClosed}`
          });
        }
        else {
          logsEmit({
            task: 'close banner',
            status: 'success',
            message: `Banner was not found, ${bannerWasClosed}`
          });
        }
      })
      .catch(err => {});
}

module.exports = closeBanner;
