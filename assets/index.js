const content = document.querySelector('.content');

// Single image wrapped with link
const getImageMarkup = (item) => {
  if (!item) {
    return '';
  }

  let screens = item.screenPath;

  if (!Array.isArray(screens)) {
    screens = [screens];
  }

  const results = screens.map(screen => {
    const img = `<img
      class="page-screen__img"
      src="${screen}"
      alt="${item.title}"
      title="${item.title}"/>`;
    let content = `${img}`;
    content += `<a
      class="page-screen__link page-screen__link--url"
      href="${item.url}">Link</a>`;
    content += `<a
      class="page-screen__link page-screen__link--img"
      href="${screen}">Img</a>`;
    content = `<div class="page-screen">${content}</div>`;

    return content;
  });

  return results.join('\n');
};

// Screenshots list
const getScreens = (items) => {
  const screens = items.map(item => getImageMarkup(item));
  return screens.join('\n');
};

// Links list
const getChildrens = (items) => {
  const newItems = Object.assign({}, items);
  delete newItems.data;

  const childrensMarkupList = Object.keys(newItems)
    .map(key => {
      const item = newItems[key].data;
      const childrenMarkup = getChildrens(newItems[key]);

      if (!item) {
        return `<li><h4>${key}</h4>
          ${childrenMarkup}</li>`;
      }

      let linkTitle = item.title;
      let linkText = '';

      if (item.linkText !== '' && item.linkText !== undefined && item.linkText !== linkTitle) {
        linkText = ` <span>(${item.linkText.trim()})</span>`;
      }

      return `<li class="pages-item">

        <a href="${item.url}">${linkTitle}</a> ${linkText}
        ${childrenMarkup}
      </li>`;
    });

  if (childrensMarkupList.length > 0) {
    return `<ol class="pages-list">${childrensMarkupList.join('\n')}</ol>`;
  }

  return '';
};

const sortByUrl = (a, b) => {
  const aUrl = a.url;
  const bUrl = b.url;

  if (aUrl > bUrl) {
    return 1;
  }
  if (aUrl < bUrl) {
    return -1;
  }

  return 0;
};

const keys = Object.keys(data);
let output = '';

if (showScreens) {
  // Screens
  const screensData = Object.values(data);
  screensData.sort(sortByUrl);
  output += getScreens(screensData);
  document.body.classList.add('page--showScreens');
} else {
  // Links list
  const listMarkup = keys.map(key => {
    const itemData = data[key];
    const itemDef = itemData.data;

    let childrens = getChildrens(itemData);

    if (itemDef) {
      output += `<h3><a href="${itemDef.url}">${itemDef.title}</a></h3>`;
    } else {
      output += `<h3>${key}</h3>`;
    }

    output += childrens;
  });

}

content.innerHTML = output;
