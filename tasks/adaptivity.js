const baseScreenSizes = [
  {
    width: 320,
    height: 1000
  },
  {
    width: 760,
    height: 1000
  },
  {
    width: 1280,
    height: 1000
  },
  {
    width: 1440,
    height: 1000
  },
];

const listId = 'adaptivity';
const listTitle = 'Adaptivity';

const tasks = [
  {
    id: 'some-pages',
    name: 'Some pages',
    env: 'prod',
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
    env: 'prod',
    urls: [
      "https://livejournal.com",
      "https://livejournal.com/shop",
      "https://yokcel.livejournal.com/",
      "https://yokcel.livejournal.com/profile",
      "https://yokcel.livejournal.com/friends"
    ],
    screenSizes: [
      {
        width: 320,
        height: 1000
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
  tasks
};
