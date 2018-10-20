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
    creditsEnv: 'prod',
    urls: [
      "https://livejournal.com",
      "https://livejournal.com/shop",
      "https://yokcel.livejournal.com/",
      "https://yokcel.livejournal.com/profile",
      "https://yokcel.livejournal.com/friends"
    ]
  },
  {
    id: 'some-pages-sizes',
    name: 'Some pages with sizes',
    creditsEnv: 'prod',
    urls: [
      "https://livejournal.com",
      "https://livejournal.com/shop",
      "https://yokcel.livejournal.com/",
      "https://yokcel.livejournal.com/profile",
      "https://yokcel.livejournal.com/friends"
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
  }
];


module.exports = {
  listId,
  listTitle,
  baseScreenSizes,
  screenFullPage,
  tasks,
};
