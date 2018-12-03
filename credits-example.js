module.exports = {
  beforeStart: {
    url: 'http://some-site.com',
    clickSelectors: [
      '.my-beautiful-button'
    ]
  },
  selectors: {
    username: '#user',
    password: '#pass',
    submit: '.loginform__submit',
    error: '.loginform__error',
    banner: '.my-lovely-banner',
    closeBanner: '.my-lovely-banner__close'
  },
  env: {
    prod: {
      loginUrl: 'https://www.example.com/login.bml',
      username: 'NICK',
      password: 'PASS'
    },
    dev: {
      loginUrl: 'https://another-site.com/login.bml',
      username: 'NICK',
      password: 'PASS'
    }
  }
};
