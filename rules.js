module.exports = {
  max: 200,
  makeScreens: true,
  // if true, ignores height from screenSizes
  screenFullPage: false,
  screenSizes: [
    {
      width: 320,
      height: 1000
    },
    {
      width: 1280,
      height: 1000
    },
  ],
  startUrl: 'https://livejournal.com/',
  ignoreStrings: [
    '#',
    'void(0)',
    'random.bml',
    '&page=1',
    '&page=2',

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
    'inbox/?view',
    '&bookmark_on=',
    '&expand=',
    'inbox/?page=0',

    // Interests
    '/blogs/',

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
    // 'bml?authas',

    // Livejournal
    'livejournal.com/?skip='

  ],
  ignoreMatches: [
    'community\\/account.bml\\?authas=',
    'community\\/moderate.bml\\?authas=',
    'community\\/mailing.bml\\?authas=',
    'community\\/settings.bml\\?authas=',
    'community\\/sentinvites.bml\\?authas=',
    'community\\/members.bml\\?authas=',
    'community\\/directory.bml\\?authas=',
    'tools\\/communitylog\\?user=',
    '[\\S]{2,20}.livejournal.com\\/\\d{2,10}.html',
    'community.livejournal.com\\/[\\S]{2,20}\/\\d{2,10}.html',
    '[\\S]{2,20}.livejournal.com\\/$',
    '[\\S]{2,20}.livejournal.com\\/profile',
    '[\\S]{2,20}.livejournal.com\\/tag',
    '[\\S]{2,20}.livejournal.com\\/calendar',
    '[\\S]{2,20}.livejournal.com\\/\\d{4}\/',
    '[\\S]{2,20}.livejournal.com\\/\\d{4}\/\\d{2}',
    '[\\S]{2,20}.livejournal.com\\/friends',
    '[\\S]{2,20}.livejournal.com\\/friendsfriends',
    'support\\/faq\/\\d{1,30}.html',
  ]
};
