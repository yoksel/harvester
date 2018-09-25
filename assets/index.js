const content = document.querySelector('.content');

// Single image wrapped with link
const getImageMarkup = (item) => {
  if(!item) {
    return '';
  }

  let img = `<img class="page-screen"
    src="${item.screenPath}"
    alt="${item.title}"
    title="${item.title}"/>`;
  img = `<a href="${item.url}">${img}</a>`;

  return img;
}

// Screenshots list
const getScreens = (items) => {
  const newItems = Object.assign({}, items);
  delete newItems.data;

  const childrensMarkupList = Object.keys(newItems)
    .map(key => {
      const item = newItems[key].data;
      const childrenMarkup = getScreens(newItems[key]);

      if(!item) {
        return childrenMarkup;
      }

      let img = getImageMarkup(item);

      return `${img} ${childrenMarkup}`;

    });

  if(childrensMarkupList.length > 0) {
    return childrensMarkupList.join('\n');
  }

  return '';
}

// Links list
const getChildrens = (items) => {
  const newItems = Object.assign({}, items);
  delete newItems.data;

  const childrensMarkupList = Object.keys(newItems)
    .map(key => {
      const item = newItems[key].data;
      const childrenMarkup = getChildrens(newItems[key]);

      if(!item) {
        return `<li><h4>${key}</h4>
          ${childrenMarkup}</li>`;
      }

      let linkTitle = item.title;
      let linkText = '';

      if(item.linkText !== '' && item.linkText !== undefined && item.linkText !== linkTitle) {
        linkText = ` <span>(${item.linkText.trim()})</span>`;
      }

      return `<li class="pages-item">

        <a href="${item.url}">${linkTitle}</a> ${linkText}
        ${childrenMarkup}
      </li>`;
    });

  if(childrensMarkupList.length > 0) {
    return `<ol class="pages-list">${childrensMarkupList.join('\n')}</ol>`;
  }

  return '';
}

const keys = Object.keys(data);
let output = '';

const listMarkup = keys.map(key => {
  const itemData = data[key];
  const itemDef = itemData.data;

  let childrens = '';

  if(showScreens) {
    childrens = getScreens(itemData);
    let img = getImageMarkup(itemDef);

    output += img;
    output += childrens;

    document.body.classList.add('page--showScreens')

    return;
  }
  else {
    childrens = getChildrens(itemData);
  }

  if(itemDef) {
    output += `<h3><a href="${itemDef.url}">${itemDef.title}</a></h3>`;
  }
  else {
    output += `<h3>${key}</h3>`;
  }

  output += childrens;
});

content.innerHTML = output;
