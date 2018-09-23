const content = document.querySelector('.content');

const getChildrens = (items) => {
  const newItems = Object.assign({}, items);
  delete newItems.data;

  const childrensMarkupList = Object.keys(newItems).map(key => {
    const item = newItems[key].data;
    const childrenMarkup = getChildrens(newItems[key]);

    if(!item) {
      return childrenMarkup;
    }

    console.log('\nitem', item);

    let linkText = item.title;
    if(item.linkText !== '' && item.linkText !== linkText) {
      linkText += ` (${item.linkText})`;
    }
    return `<li>
      <a href="${item.url}">${linkText}</a>

      ${childrenMarkup}
    </li>`
  })

  if(childrensMarkupList.length > 0) {
    return `<ul>${childrensMarkupList.join('\n')}</ul>`;
  }

  return '';
}

console.log(data);

const keys = Object.keys(data);
let output = '';

const listMarkup = keys.map(key => {
  const itemData = data[key];
  const itemDef = itemData.data;

  const childrens = getChildrens(itemData);

  if(itemDef) {
    output += `<h3><a href="${itemDef.url}">${itemDef.title}</a></h3>`;
  }
  else {
    output += `<h3>${key}</h3>`;
  }

  output += childrens;

  // console.log(itemDef);
  // console.log(childrens);
  console.log('---------');

})

content.innerHTML = output;
