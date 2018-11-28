const listId = 'snippets';
const listTitle = 'Snippets';

const tasks = [
  {
    id: 'collect-bins-urls',
    // This subtask just collect snippets urls to given file
    subtask: 'get-snippets-urls',
    name: 'Collect bins urls',
    creditsEnv: 'none',
    linksSelectorRestriction: '.someclass',
    snippetsListFilePath: 'data/collectedSnippetsLinks.json',
    urls: [
      'http://mysite.com'
    ]
  },
  {
    id: 'collect-bins-codes',
    // This subtask will go to snippets urls and get code from page
    subtask: 'get-snippets-code',
    name: 'Collect bins code',
    creditsEnv: 'none',
    snippetsListFilePath: 'data/collectedSnippetsLinks.json',
    codeSelector: '.CodeMirror',
    // this will be stripped from filenames of snippets
    dropUrlPart: '/demo',
    urls: []
  }
];

module.exports = {
  listId,
  listTitle,
  tasks
};
