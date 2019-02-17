const {
  fillTemplates
} = require('../../helpers');

const tabsIds = ['tab-1', 'tab-2'];
let checkedTab = tabsIds[0];

const setTab = (tab) => {
  checkedTab = tab;
};

const renderTabs = async ({treeList, visitedUrls, templates}) => {
  // Fill template with data
  const renderedTree = await fillTemplates({
    template: templates.treeListToplevel,
    data: {
      items: treeList,
    }
  });
  const renderedScreens = await fillTemplates({
    template: templates['screensList--lazyload'],
    data: {
      images: Object.values(visitedUrls)
    }
  });

  const renderedTabs = await fillTemplates({
    template: templates.tabs,
    data: {
      items: [
        {
          id: tabsIds[0],
          title: 'Links tree',
          content: renderedTree,
          checked: checkedTab === tabsIds[0] ? 'checked' : ''
        },
        {
          id: tabsIds[1],
          title: 'Screens',
          content: renderedScreens,
          checked: checkedTab === tabsIds[1] ? 'checked' : ''
        }
      ]
    }
  });

  return renderedTabs;
};

module.exports = {
  renderTabs,
  setTab
};
