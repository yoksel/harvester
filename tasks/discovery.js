const listId = 'discovery-pages';
const listTitle = 'Discovery pages';

const tasks = [
  {
    id: 'links-finder-prod',
    name: 'Find all links on prod',
    startUrl: 'http://livejournal.com',
    // Check this string in every url
    domainRestriction: 'livejournal.com/',
    // Finds all links on page
    // Set another selector to get links from particular element
    linksSelectorRestriction: 'a',
    // Max iterations for searchin links
    max: 200,
    // Enable if you need screenshots
    makeScreens: true,
    // if true, ignores height from screenSizes
    screenFullPage: false,
    // Enable makeScreens to use screenSizes
  },
  {
    id: 'links-finder-prod-service',
    name: 'Find all links on dev',
    startUrl: 'https://livejournal.com',
    domainRestriction: 'livejournal.com',
    linksSelectorRestriction: '.b-service a',
    max: 200,
    makeScreens: true,
    screenFullPage: false,
  }
];

module.exports = {
  listId,
  listTitle,
  tasks
};
