const {
  deepClone,
  fillTemplates
} = require('../../helpers');

const valuesToList = ({tree, templates}) => {
  const values = Object.values(tree);

  if (values.length === 0) {
    return [];
  }

  const newList = values.map(item => {
    const url = item.data ? item.data.url : '';
    if (!item.data) {
      item.data = {
        title: '(no title)',
        pathname: item.name
      };
    }

    if (Object.keys(item.children).length > 0) {
      item.children = valuesToList({tree: item.children, templates});
      item.markup = fillTemplates({
        template: templates.treeList,
        data: {
          data: item.data,
          items: item.children
        }
      });
    } else {
      if (item.data.url) {
        item.markup = fillTemplates({
          template: templates.treeItem,
          data: {
            data: item.data
          }
        });
      }
    }

    return item;
  });

  return newList;
};

const treeToList = ({tree, templates}) => {
  const treeCopy = deepClone(tree);
  const result = valuesToList({tree: treeCopy, templates});

  return result;
};

module.exports = treeToList;
