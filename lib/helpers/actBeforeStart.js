const clearUrlDomain = require('./clearUrlDomain');

const actBeforeStart = async (params) => {
  let {
    page,
    beforeStart,
    logsEmit,
    visitedUrls
  } = params;

  const beforeStartResult = await beforeStartPromise({
      page,
      beforeStart
    })
      .then(result => {
        if(result) {
          visitedUrls = Object.assign(visitedUrls, result);
        }

        if(result) {
          logsEmit({
            task: 'beforeStart',
            status: 'success',
            message: `beforeStart task was processed`
          });
        }

        return true;
      })
      .catch(err => {
        logsEmit({
          task: 'beforeStart',
          status: 'error',
          message: err.toString()
        });

        return false;
      });

  return beforeStartResult;
}

const beforeStartPromise = async (params) => {
  const {
    page,
    beforeStart
  } = params;

  const promise = new Promise(async (resolve, reject) => {
    if(!beforeStart) {
      resolve(null);
      return;
    }

    const gotoPage = await page.goto(beforeStart.url)
      .then(result => {
        return true;
      })
      .catch(err => {
        return {err};
      });

    // Check if page was opened
    if(gotoPage.err) {
      reject(gotoPage.err);
      return;
    }

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
    const result = {};
    result[urlKey] = {
      screenPath: [`screens/_beforeStart.png`],
      url: beforeStart.url
    };

    resolve(result);
  });

  return promise;
}

module.exports = actBeforeStart;
