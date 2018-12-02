const tasks = {};

const subscribe = (name, func) => {
  if (!tasks[name]) {
    tasks[name] = [];
  }

  tasks[name].push(func);
};

const unsubscribe = (name, func) => {
  if (!tasks[name]) {
    tasks[name] = [];
  }

  tasks[name] = tasks[name].filter(item => func !== item);
};

const emit = (name, payload = null) => {
  if (!tasks[name]) {
    return;
  }

  tasks[name].forEach(func => {
    func(payload);
  });
};

module.exports = {
  subscribe,
  unsubscribe,
  emit
};
