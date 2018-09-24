'use strict';

const puppeteer = require('puppeteer');

const urls = require('./urls');

const USERNAME_SELECTOR = '#user';
const PASSWORD_SELECTOR = '#lj_loginwidget_password';
const BUTTON_SELECTOR = '.lj_login_form .b-loginform-btn--auth';
const CLOSE_ADV_SELECTOR = '.ljsale__hide';

const CREDITS = {
  username: 'yokcel',
  password: 'Yoksel37'
};

const screenSizes = [
  {
    width: 320,
    height: 1000
  },
  // {
  //   width: 760,
  //   height: 1000
  // },
  {
    width: 1280,
    height: 1000
  },
  // {
  //   width: 1400,
  //   height: 1000
  // }
];

(async () => {
  const browser = puppeteer
    .launch()
    .then(async browser => {

    const page = await browser.newPage();

    // Login
    await page.goto('https://www.livejournal.com/login.bml');
    // await page.screenshot({path: 'screens/login.png'});
    await page.click(USERNAME_SELECTOR);
    await page.keyboard.type(CREDITS.username);

    await page.click(PASSWORD_SELECTOR);
    await page.keyboard.type(CREDITS.password);

    await page.click(BUTTON_SELECTOR);

    await page.waitForNavigation();
    // await page.click(CLOSE_ADV_SELECTOR);

    for (let i = 0; i < urls.length; i++) {
      const promises = [];

      const url = urls[i].url;
      let name = url
        .replace(/livejournal.com/,'')
        .replace(/(?:http|https):\/\//,'')
        .replace(/.bml|.html/,'')
        .replace(/^\/|\/$/g,'')
        .replace(/^\.|\.$/g,'')
        .replace(/\//g,'_');
      console.log('\nURL:', url);
      // console.log('name(', name, ')');

      if(url === 'https://livejournal.com/') {
        name = 'main';
      }

      for (var k = screenSizes.length - 1; k >= 0; k--) {
        const width = screenSizes[k].width;
        const height = screenSizes[k].height;

        promises.push(browser.newPage()
          .then(async page => {
            await page.setViewport({ width: width, height: height });
            await page.goto(url);

            await page.screenshot({
              path: `screens/${name}--${width}x${height}.png`,
              fullPage: true
            });
          }))
      }

      await Promise.all(promises)
    }

    await browser.close()
  })
})();
