module.exports = {
  selectors: {
    username: '#user',
    password: '#lj_loginwidget_password',
    submit: '.lj_login_form .b-loginform-btn--auth',
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
