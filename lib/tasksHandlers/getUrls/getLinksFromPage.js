const getLinksFromPage = async ({page, linksSelectorRestriction}) => {
  return page.$$eval(linksSelectorRestriction, anchors => {
    return anchors.map(anchor => {
      return {
        url: anchor.href,
        linkText: anchor.textContent
          .replace(/\\n/g,'')
          .trim()
      };
    });
  })
}

module.exports = getLinksFromPage;
