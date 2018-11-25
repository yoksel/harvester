const sendData = require('./sendData');
const clearUrlDomain = require('./clearUrlDomain');

const screensPaths = {
  success: {
    saveTo: 'public/screens/_login_success.png',
    showFrom: 'screens/_login_success.png'
  },
  error: {
    saveTo: 'public/screens/_login_error.png',
    showFrom: 'screens/_login_error.png'
  }
};

// ------------------------------

const makeLogin = async ({
  page,
  credits,
  currentEnv,
  logsEmit,
  visitedUrls
}) => {

  const loginPromise = makeLoginPromise({
    page,
    credits,
    currentEnv
  });

  const loginResult = await loginPromise
    .then(result => {
      visitedUrls = Object.assign(visitedUrls, result.data);

      let message = 'Login successul.';

      if (result.message) {
        message = `${message} ${result.message}`;
      }

      logsEmit({
        task: 'login',
        status: 'successul',
        message
      });

      return true;
    })
    .catch(error => {
      visitedUrls = Object.assign(visitedUrls, error.data);

      let message = 'Login failed. Check your login & password.';

      if (error.pageStatus) {
        message = `Login failed. ${error.err}, ${error.pageStatus}.`;
      }
      if (error.message) {
        message = `${message} ${error.message}`;
      }

      logsEmit({
        task: 'login',
        status: 'error',
        message
      });
      return false;
    });

  return loginResult;
};

// ------------------------------

const makeLoginPromise = ({page, credits, currentEnv}) => {
  const {
    selectors,
    env
  } = credits;
  const errorSelector = selectors.error;
  const {
    loginUrl,
    username,
    password
  } = env[currentEnv];
  const urlKey = clearUrlDomain(loginUrl);

  const makeLoginPromise = new Promise(async (resolve, reject) => {

    // Try to open page
    const gotoPageReport = await page.goto(loginUrl)
      .then(async result => {
        if (result._status === 200) {
          return true;
        }

        const errorReport = await collectErrorReport({
          page, urlKey, loginUrl
        });

        return {
          err: 'Page was not opened',
          pageStatus: result._status,
          data: errorReport
        };
      })
      .catch(err => {
        return {err};
      });

    // Check if page was opened
    if (gotoPageReport.err) {
      reject(gotoPageReport);
      return;
    }

    // Make login
    await page.click(selectors.username);
    await page.keyboard.type(username);

    await page.click(selectors.password);
    await page.keyboard.type(password);

    await page.click(selectors.submit);

    await page.waitForNavigation()
      .then(async (result) => {

        // Page was successfuly opened
        if (result._status === 200) {
          // Check error warning if selectors exist
          if (selectors.error) {

            let loginError = await page.$$eval(errorSelector, errorElem => {
              return errorElem.length;
            });

            if (loginError > 0) {
              const errorReport = await collectErrorReport({
                page, urlKey, loginUrl
              });

              reject({
                data: errorReport
              });
            } else {
              const successReport = await collectSuccessReport({
                page, urlKey, loginUrl
              });

              resolve({
                data: successReport,
                message: 'Successfully logged in with checking error element'
              });
            }
          }
          // No selectors to check error warningexist
          else {
            const successReport = await collectSuccessReport({
              page, urlKey, loginUrl
            });

            resolve({
              data: successReport,
              message: 'Logged in without checking error element'
            });
          }

        }
        // Problem while opening page
        else {
          const errorReport = await collectErrorReport({
            page, urlKey, loginUrl
          });

          reject({
            data: errorReport,
            message: data._status + ',' + data._statusText
          });
        }
      })
      .catch(async (error) => {
        if (selectors.error) {

          let loginError = await page.$$eval(errorSelector, errorElem => {
            return errorElem.length;
          });

          const errorReport = await collectErrorReport({
            page, urlKey, loginUrl
          });

          if (loginError > 0) {
            reject({
              message: 'Can\'t open page after login',
              data: errorReport
            });
          }
        }

        reject(error);
      });
  });

  return makeLoginPromise;
};

// ------------------------------

const collectReport = async ({type, page, urlKey, loginUrl}) => {
  await page.screenshot({
    path: screensPaths[type].saveTo,
    fullPage: false
  });

  const loginResult = {};
  loginResult[urlKey] = {
    screenPath: screensPaths[type].showFrom,
    url: loginUrl
  };

  return loginResult;
};

// ------------------------------

const collectErrorReport = async (params) => {
  return collectReport({
    ...params,
    type: 'error'
  });
};

// ------------------------------

const collectSuccessReport = async (params) => {
  return collectReport({
    ...params,
    type: 'success'
  });
};

// ------------------------------

module.exports = makeLogin;
