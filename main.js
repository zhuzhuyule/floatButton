const newFloat = require('./utils/floatButton');
const toastMsg = require('./utils/toastMsg');
const tools = require('./utils/tool');

const findObject = tools.findObject;
const safeThread = tools.safeThread;
const waitAction = tools.waitAction;
const onDialogBtnClick = tools.onDialogBtnClick;
const waitObjectRemove = tools.waitObjectRemove;

const package = 'com.mygithub0.tvbox0.osdX';
const detailActivity = 'com.github.tvbox.osc.ui.activity.DetailActivity';

const floatBtn = newFloat({
  buttonContent: (
    <vertical gravity="center" bg="#FFFFFF" padding="20">
      <button id="reopen" text="继续播放" />
      <button id="playNext" text="下一集" />
      <button id="back" text="返回" />
    </vertical>
  ),
  settingContent: (
    <vertical gravity="center" bg="#FFFFFF" padding="20"></vertical>
  ),
  onDoubleClick: () => {
    back();
  },
});

const buttonDialog = floatBtn.buttonDialog;

let startTimer = 0;
let fullScreenTimer = 0;
let isRunning = false;
let count = 0;
function retry() {
  isRunning = false;
  if (count < 3) {
    startFromHome();
  } else {
    count = 0;
  }
}

onDialogBtnClick(buttonDialog, 'reopen', () => {
  setTimeout(() => {
    safeThread(
      '继续播放',
      () => {
        reopenVideo();
        setTimeout(() => {
          count = 0;
          if (getId('tvHistory').findOnce() || getId('tvDelAll').findOnce()) {
            startFromHome();
          } else {
            findObject(getId('subtitle_view'))
              .then((selector) => {
                if (selector.bounds().left !== 0) {
                  findObject(getId('tvPlay'))
                    .then((item) => item.click())
                    .catch();
                }
              })
              .catch(() => {
                back();
                startFromHome();
              });
          }
        }, 800);
      },
      60 * 1000
    );
  }, 200);
});

onDialogBtnClick(buttonDialog, 'playNext', () => {
  setTimeout(() => {
    safeThread('播放下一集', () => {
      if (getId('previewPlayerPlace').findOnce()) {
        if (!getId('curr_time').findOnce()) {
          click(400, 400);
        }

        findObject(getId('total_time'))
          .then(() =>
            findObject(getId('play_next')).then((selector) => selector.click())
          )
          .catch();
      }
    });
  }, 200);
});

onDialogBtnClick(buttonDialog, 'back', () => {
  back();
});

function getId(key) {
  const name = `${package}:id/${key}`;
  return id(name);
}

events.observeToast();
events.onToast(function (toast) {
  log('Toast内容: ' + toast.getText() + ' 包名: ' + toast.getPackageName());
  var text = toast.getText();
  var name = toast.getPackageName();
  if (
    text === null &&
    name === package &&
    currentActivity() === detailActivity
  ) {
    // startFromHome();
  }
});

function startPage(page) {
  events.broadcast.emit('start-page', page);
}

events.broadcast.on('start-page', function (page) {
  app.startActivity({
    packageName: package,
    className: `com.github.tvbox.osc.ui.activity.${page}Activity`,
    root: page !== 'Home',
  });
});

function reopenVideo() {
  swipe(
    device.width - 10,
    (device.height / 3) * 2,
    device.width / 2,
    (device.height / 3) * 2,
    600
  );
}

function startFromHome() {
  if (isRunning) {
    return;
  }
  count++;
  log(`第${count}次执行重载操作`);
  isRunning = true;
  if (startTimer) {
    clearTimeout(startTimer);
    startTimer = 0;
  }
  if (fullScreenTimer) {
    clearTimeout(fullScreenTimer);
    fullScreenTimer = 0;
  }

  if (getId('tvDelAll').findOne(1000)) {
    back();
  } else if (getId('tvHistory').findOne(1000)) {
    startPage('Home');
  }
  setTimeout(() => {
    waitObjectRemove(className('Progressbar'), 6000)
      .catch()
      .finally(() => {
        findObject(getId('tvName'))
          .then(() => {
            setTimeout(() => {
              getId('tvHistory').findOne(2000).click();
              startTimer = setTimeout(() => {
                click(150, 250);
                findObject(getId('ivThumb'), 1000)
                  .then((item) => {
                    item.parent().click();
                    startTimer = 0;
                    findObject(getId('subtitle_view'), 5000)
                      .then((selector) => {
                        fullScreenTimer = setTimeout(() => {
                          if (selector.bounds().left !== 0) {
                            findObject(getId('tvPlay'))
                              .then((item) => item.click())
                              .catch();
                          }
                          isRunning = false;
                          count = 0;
                          fullScreenTimer = 0;
                        }, 1000);
                      })
                      .catch(() => {
                        back();
                        retry();
                      });
                  })
                  .catch(retry);
              }, 5000);
            }, 4000);
          })
          .catch(retry);
      });
  }, 2000);
}
