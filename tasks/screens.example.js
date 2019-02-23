const baseScreenSizes = [
  {
    width: 320,
    height: 600
  },
  {
    width: 760,
    height: 800
  },
  {
    width: 1280,
    height: 1000
  },
  {
    width: 1440,
    height: 1200
  },
];

const screenFullPage = false;

const listId = 'screens';
const listTitle = 'Adaptivity';

const tasks = [
  {
    id: 'some-pages',
    name: 'Some pages',
    creditsEnv: 'none',
    urls: [
      'https://mysite.com',
      'https://mysite.com/about'
    ]
  },
  {
    id: 'some-pages-sizes',
    name: 'Some pages with sizes',
    creditsEnv: 'prod',
    urls: [
      'https://mysite.com',
      'https://mysite.com/about'
    ],
    screenSizes: [
      {
        width: 600,
        height: 400
      },
      {
        width: 1440,
        height: 1000
      },
    ]
  },
  {
    id: 'some-pages-sizes-and-devices',
    name: 'Some pages with sizes and devices',
    creditsEnv: 'none',
    urls: [
      'https://mysite.com',
      'https://mysite.com/about'
    ],
    screenSizes: [
      {
        width: 600,
        height: 400
      },
      {
        width: 1440,
        height: 1000
      },
    ],
    devices: [
      {
        name: 'iPhone 6'
      },
      {
        name: 'iPad'
      }
    ],
  },
];

module.exports = {
  listId,
  listTitle,
  baseScreenSizes,
  screenFullPage,
  tasks,
};
