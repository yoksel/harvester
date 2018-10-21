const clearUrlProtocol = require('./clearUrlProtocol');
const clearUrlDomain = require('./clearUrlDomain');

let findMatchOnceList = {};

// ------------------------------

const findMatchOnce = (findOnce) => {
  return findOnce.map(item => {
    return {
      expr: item,
      wasMet: false
    }
  })
};

// ------------------------------

const findIgnoredMatches = ({
    findMatchOnceList,
    cleanedUrl
  }) => {
  const findIgnoredMatches = findMatchOnceList
    .some((matchObj, index) => {
      var regex = new RegExp(matchObj.expr);
      const result = cleanedUrl.match(regex);

      // Link was found
      if(result !== null) {
        if(matchObj.wasMet === true) {
          return true;
        }
        else {
          findMatchOnceList[index].wasMet = true;
          return false;
        }
      }

      return false;
    });

  return findIgnoredMatches;
}

// ------------------------------

const filterLinks = (params) => {
  const {
    logsEmit,
    task,
    links,
    visitedUrls,
    collectedUrls
  } = params;
  const {
    domainRestriction,
    ignoreStrings,
    findOnce
  } = task;

  findMatchOnceList = findMatchOnce(findOnce);
  const linksAtStart = links.length;

  const filtered = links.filter(link => {
    if(link.url) {
      const cleanedUrl = clearUrlProtocol(link.url);
      const urlKey = clearUrlDomain(link.url);

      // No visited or collected links
      if(visitedUrls[urlKey] || collectedUrls[urlKey]) {
        return false;
      }

      if(domainRestriction) {
        // No External link
        if(cleanedUrl.indexOf(domainRestriction) < 0) {
          return false;
        }
      }

      // Check ignored words
      if(ignoreStrings) {
        const findIgnored = ignoreStrings.some(str => {
          return cleanedUrl.indexOf(str) > -1
        });

        if(findIgnored === true) {
          return false
        }
      }

      const findIgnoredMatchesResult = findIgnoredMatches({
        findMatchOnceList,
        cleanedUrl
      });


      if(findIgnoredMatchesResult === true) {
        // Remove item from set
        return false
      }

      return link;
    }

    // No url
    return false;
  });

  // Switch it on if you need it for testing purposes
  // logsEmit({
  //   task: `Filter links in ${task.name}`,
  //   status: 'success',
  //   message: `Filttered ${linksAtStart} -> ${filtered.length}`
  // });

  return filtered;
};

// ------------------------------

module.exports = filterLinks;
