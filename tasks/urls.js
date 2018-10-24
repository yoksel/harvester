const listId = 'urls';
const listTitle = 'Discovery pages';

const tasks = [
  {
    id: 'links-finder-prod',
    name: 'Find all links on prod',
    creditsEnv: 'prod',
    startUrl: 'https://www.livejournal.com/',
    // Check this string in every url
    domainRestriction: 'livejournal.com/',
    // Finds all links on page
    // Set another selector to get links from particular element
    linksSelectorRestriction: 'a',
    // Max iterations for searchin links
    max: 100,//200,
    // Enable if you need screenshots
    makeScreens: true,
    // if true, ignores height from screenSizes
    screenFullPage: false,
    ignoreStrings: [
      '#',
      'void(0)',
      'random.bml',
      'mailto:',
      'SetupCab.cab',
      'data/rss',

      // Actions
      'logout',
      'delcomment',
      'delete_group',
      'freeze',
      'instant_relation',
      '&itemid=',
      '&talkid=',
      '?opt_sort=',

      // Media
      '?media',
      '/media/',

      // Inbox
      '&bookmark_on=',
      '&expand=',
      'inbox/?page=0',

      // Customize
      'customize/?authas=',
      'preview_redirect.bml',
      'customize/?cat',
      'customize/?layoutid',
      'customize/?designer',

      // Shop
      'vgift.bml?cat',
      'vgift.bml?name',
      'vgift.bml?to',
      'theme/?cat',
      'theme/?theme_id',
      'commpromo.bml?date',
      'profaccount.bml?form',

      // Update
      'update.bml?usejournal',
      'update.bml?event',
      'update.bml?repost',
      'update.bml?photo',
      'update.bml?albums',

      // Profile
      '?socconns=',
      '?comms=',

      // FAQ
      '?faqid=',
      'help.bml?sort=date',

      // Support
      'support/request/?id=',

      // Manage
      'manage.bml?sortby',

      // Livejournal
      'livejournal.com/?skip='

    ],
    findOnce: [
      'community\\/account.bml\\?authas=',
      'community\\/moderate.bml\\?authas=',
      'community\\/mailing.bml\\?authas=',
      'community\\/settings.bml\\?authas=',
      'community\\/sentinvites.bml\\?authas=',
      'community\\/members.bml\\?authas=',
      'community\\/directory.bml\\?authas=',
      'community.livejournal.com\\/[\\S]{2,20}\/\\d{2,10}.html',
      'community.livejournal.com\\/[\\S]{2,20}',
      'tools\\/communitylog\\/\\?user=',

      'friends\\/add.bml\\?user=',

      'customize\\/\\?search=',
      'customize\\/\\?page=',

      'rsearch\\/\\?tags=',

      'admin\\/entrylog.bml\\?url',

      'shop\\/history.bml\\?authas=',
      'shop\\/selfpromo\\/history\\?date',
      'shop\\/renameaccount.bml\\?dest_name=',
      'shop\\/journalpromo.bml\\?tab=',
      'manage\\/payments\\/modify.bml\\?bill_when=',

      'inbox\\/?page=',
      'inbox\\/\\?[\\S]{2,20}&page=',

      'ratings\\/community\\?country=[\\S]{1,5}\\&page=',
      'ratings\\/community\\?country=[\\S]{1,5}',
      'ratings\\/users\\?country=[\\S]{1,5}\\&page=',
      'ratings\\/users\\?country=[\\S]{1,5}',

      '\\/blogs\\/',

      'subscriptions\\/comments.bml\\?talkid=',

      '[\\S]{2,20}.livejournal.com\\/\\d{2,10}.html',
      '[\\S]{2,20}.livejournal.com\\/$',
      '[\\S]{2,20}.livejournal.com\\/profile',
      '[\\S]{2,20}.livejournal.com\\/tag',
      '[\\S]{2,20}.livejournal.com\\/calendar',
      '[\\S]{2,20}.livejournal.com\\/\\d{4}\/',
      '[\\S]{2,20}.livejournal.com\\/\\d{4}\/\\d{2}',
      '[\\S]{2,20}.livejournal.com\\/friends',
      '[\\S]{2,20}.livejournal.com\\/friendsfriends',
      '[\\S]{2,20}.livejournal.com\\/photo/album/d{2,10}',

      'livejournal.com\\/profile\\?userid=',
      'users\\.livejournal\\.com/[\\S]{2,20}/profile',

      'support\\/highscores.bml\\?page=',
      'support\\/faq\/\\d{1,30}.html',
      'support\\/help.bml\\?cat=',
    ]
  },
  {
    id: 'links-finder-prod-service',
    name: 'Find all links on dev',
    creditsEnv: 'prod',
    startUrl: 'https://livejournal.com',
    domainRestriction: 'livejournal.com',
    linksSelectorRestriction: 'a',
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
