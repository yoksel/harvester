const makeLogin = (page, credits, currentEnv) => {
  console.log('Make login...');

  const {
    selectors,
    env
  } = credits;
  const errorSelector = selectors.error;

  const makeLoginPromise = new Promise(async (resolve, reject) => {
    await page.goto(env[currentEnv].loginUrl);

    await page.click(selectors.username);
    await page.keyboard.type(env[currentEnv].username);

    await page.click(selectors.password);
    await page.keyboard.type(env[currentEnv].password);

    await page.click(selectors.submit);

    await page.waitForNavigation()
      .then(async (result) => {
        await page.on('response', async (data) => {
          if(data._status === 200) {
            if(selectors.error){

              let loginError = await page.$$eval(errorSelector, errorElem => {
                return errorElem.length;
              });

              if(loginError > 0) {
                reject('Check your login & password');
              }
              else {
                resolve('Success');
              }
            }
            else {
              resolve('Success');
            }

          }
          else {
            reject('Status:', data._status, data._statusText);
          }
        })
      })
      .catch( async (error) => {
        if(selectors.error){

          let loginError = await page.$$eval(errorSelector, errorElem => {
            return errorElem.length;
          });

          if(loginError > 0) {
            reject('Check your login & password');
          }
        }

        reject(error);
      });
  });

  return makeLoginPromise;
}

module.exports = makeLogin;
