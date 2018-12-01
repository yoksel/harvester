const tasks = {};

const subscribe = (name, func) => {
  if(!tasks[name]) {
    tasks[name] = [];
  }

  tasks[name].push(func);
}

const unsubscribe = (name, func) => {
  if(!tasks[name]) {
    tasks[name] = [];
  }

  tasks[name] = tasks[name].filter(func => func !== func);
}

const emit = (name) => {
  if(!tasks[name]) {
    return;
  }

  tasks[name].forEach(func => {
    func();
  })
};

module.exports = {
  subscribe,
  unsubscribe,
  emit
};
