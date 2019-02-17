const mustache = require('mustache');

const fillTemplates = ({data, template}) => {
  const renderedContent = mustache.render(template, data);

  return renderedContent;
};

module.exports = fillTemplates;
