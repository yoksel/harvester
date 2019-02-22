const listId = 'urls';
const listTitle = 'Discovery pages';

const tasks = [
  {
    id: 'pages-finder',
    // Uncomment next line to disable task
    // disabled: true,
    name: 'Find all links on site',
    creditsEnv: 'prod',
    useBeforeStart: false,
    startUrl: 'https://www.my-site.com/',
    // Check this string in every url
    domainRestriction: 'my-site.com/',
    // Finds all links on page
    // Set another selector to get links from particular element
    linksSelectorRestriction: 'a',
    // Max iterations for searchin links
    max: 100,
    // Enable if you need screenshots
    makeScreens: true,
    // if true, ignores height from screenSizes
    screenFullPage: false,
    ignoreStrings: [
      '#',
      'void(0)',
      'mailto:',
      'data/rss'
    ],
    findOnce: [
      'calendar\\/year'
    ]
  }
];

module.exports = {
  listId,
  listTitle,
  tasks
};
