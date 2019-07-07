const getLinksFromPage = require('./getLinksFromPage');

const themesMap = {
  // S1
  '.html-style-default': 'S1 Default',
  '.html-style-tabular-indent': 'S1 Tabular Indent',
  '.html-style-punquin-elegant': 'S1 Punquin Elegant',
  '.html-style-magazine': 'S1 Magazine',
  '.html-style-component': 'S1 Component', // ?
  '.html-style-generator': 'S1 Generator',
  '.html-style-notepad': 'S1 Notepad',
  '.html-style-refried-paper': 'S1 Refried Paper',

  // S2
  '.j-layer-air': 'S2 Air',
  '.asset-stream': 'S2 Expressive',
  '.layout-minimalism': 'S2 Minimalism',
  '.j-layout-chameleon': 'S2 Chameleon',
  '.j-e-nav-item': 'S2 Custom Chameleon',
  'div.entry ul.entryextra': 'S2 Variable Flow',
  '.header-journal-info': 'S2 Generator',
  '.pagefooterblock': 'S2 Smooth Sailing',

  '.lj-flexiblesquares': 'S2 Flexible Squares',
  'td.tabBg': 'S2 Component',
  'table.entry font .subjlink': 'S2 Notepad',
  'td.body div.entry font.author': 'S2 Refried Paper',
  'div.entry a.entry-footer__link': 'S2 Bloggish',

  'span.page_title': 'S2 Default',
  'table.standard': 'S2 Punquin Elegant',
  'div.H3Holder': 'S2 Magazine',

  '.html-s2-no-adaptive td#mainstuff': 'S2 Clean and Simple',
  'td#mainstuff': 'S1 Clean and Simple',
  '.html-s1': 'S1',

  'table#whole': 'S1?',
  'tr.entry': 'S1?',

};

const themesSelectors = Object.keys(themesMap);

const detectTheme = async (page) => {
  let theme = '(undefined)';
  let counter = 0;

  while(theme === '(undefined)' && counter < themesSelectors.length) {
    const selector = themesSelectors[counter];

    let match = await page.$$eval(selector, anchors => {
      return anchors.length;
    });

    if(match > 0) {
      theme = themesMap[selector];
    }

    counter++;
  }

  return theme;
};

const getDataFromPage = async ({page, dataToCollect}) => {
  const result = {};

  dataToCollect.forEach(async (item) => {
    if(item.name === 'theme') {
      const theme = await detectTheme(page);
      result.theme = theme;
    }
    else if(item.name === 'hrefFromSelector') {
      const hrefs = await getLinksFromPage({
        page,
        linksSelectorRestriction: item.selector
      });
      result.hrefs = hrefs;
    }
  });

  return result;
}

module.exports = getDataFromPage;
