const sendData = require('./sendData');

const makeLogin = ({page, credits, currentEnv, ws}) => {
  const sendDataWS = sendData(ws);
  const {
    selectors,
    env
  } = credits;
  const errorSelector = selectors.error;
  const loginUrl = env[currentEnv].loginUrl;

  console.log('Make login...');
  sendDataWS({
    status: 'login',
    message: `Start login on ${loginUrl}...`
  });

  const makeLoginPromise = new Promise(async (resolve, reject) => {
    await page.goto(loginUrl);

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
                sendDataWS({
                  status: 'error',
                  message: 'Check your login & password'
                });
                reject('Check your login & password');
              }
              else {
                sendDataWS({
                  status: 'login',
                  message: `Successfully logged in with checking error element`
                });
                resolve('Success');
              }
            }
            else {
              sendDataWS({
                status: 'login',
                message: `Successfully logged in without checking error element`
              });
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
