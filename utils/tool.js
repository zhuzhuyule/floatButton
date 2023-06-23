const toastMsg = require('./toastMsg');

function onDialogBtnClick(dialog, id, action, notClose) {
  dialog.dialog[id].click(() => {
    if (!notClose) {
      dialog.hideDialog();
    }
    try {
      action();
    } catch (error) {
      toastMsg(`error: [${id}]:`, error);
    }
  });
}

function onDialogSeekBarChange(dialog, id, action) {
  dialog.dialog[id].setOnSeekBarChangeListener({
    onProgressChanged: function (seekbar, progress, fromUser) {
      try {
        action(progress);
      } catch (error) {
        toastMsg(`error: [${id}]:`, error);
      }
    },
  });
}

const threadList = {};
function safeThread(name, cb, timeout) {
  timeout = timeout || 30 * 1000;
  if (threadList[name]) {
    threadList[name].interrupt();
  }
  log(`开始进程[${name}]`);
  var thread = threads.start(() => {
    try {
      cb();
      threadList[name] = false;
    } catch (error) {
      toastMsg(`进程[${name}] 发生错误`, error);
      threadList[name] = false;
    }
  });
  setTimeout(() => {
    if (thread.isAlive()) {
      toastMsg(`执行进程[${name}]超时`);
      thread.interrupt();
      threadList[name] = false;
    }
  }, timeout);
  threadList[name] = thread;
  return threadList[name];
}

function findObject(selector, timeout) {
  timeout = timeout || 3 * 1000;
  const now = Date.now();
  let item = null;
  if (selector) {
    while (!item) {
      if (Date.now() - now > timeout) {
        break;
      }
      item = selector.findOnce();
    }
    if (item) {
      return Promise.resolve(item);
    }
  }
  return Promise.reject(null);
}

function waitObjectRemove(selector, timeout) {
  timeout = timeout || 3 * 1000;
  const now = Date.now();
  let isRemove = false;
  if (selector) {
    while (!isRemove) {
      if (!selector.findOnce()) {
        isRemove = true;
        break;
      }
      if (Date.now() - now > timeout) {
        break;
      }
    }
    if (isRemove) {
      return Promise.resolve(selector);
    }
  }
  return Promise.reject(null);
}

function waitAction(action, timeout) {
  timeout = timeout || 3 * 1000;
  const now = Date.now();
  let done = false;
  while (!done) {
    done = action();
    if (Date.now() - now > timeout) {
      break;
    }
  }
  if (done) {
    return Promise.resolve(true);
  }
  return Promise.reject(false);
}

module.exports = {
  waitAction,
  findObject,
  waitObjectRemove,
  safeThread,
  onDialogBtnClick,
  onDialogSeekBarChange,
};
