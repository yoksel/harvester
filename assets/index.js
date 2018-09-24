const content = document.querySelector('.content');

const getChildrens = (items) => {
  const newItems = Object.assign({}, items);
  delete newItems.data;

  const childrensMarkupList = Object.keys(newItems).map(key => {
    const item = newItems[key].data;
    const childrenMarkup = getChildrens(newItems[key]);

    if(!item) {
      return `<li><h4>${key}</h4>
        ${childrenMarkup}</li>`;
    }

    let linkContent = item.title;

    if(item.linkText !== '' && item.linkText !== linkContent) {
      linkContent += ` (${item.linkText})`;
    }

    let img = '';
    if(showScreens === true) {
      img = `<img class="page-screen" src="${item.screenPath}"/>`;
      img = `<a href="${item.url}">${img}</a>`
    }

    return `<li class="pages-item">

      <a href="${item.url}">${linkContent}</a>

      ${img}

      ${childrenMarkup}
    </li>`;
  })

  if(childrensMarkupList.length > 0) {
    return `<ol class="pages-list">${childrensMarkupList.join('\n')}</ol>`;
  }

  return '';
}

console.log(data);

const keys = Object.keys(data);
let output = '';

const listMarkup = keys.map(key => {
  const itemData = data[key];
  const itemDef = itemData.data;

  let childrens = getChildrens(itemData);

  if(itemDef) {
    output += `<h3><a href="${itemDef.url}">${itemDef.title}</a></h3>`;
  }
  else {
    output += `<h3>${key}</h3>`;
  }

  output += childrens;
});

content.innerHTML = output;
