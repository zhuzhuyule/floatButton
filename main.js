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
      <button id="skip" text="跳过" />
      <button id="fullscreen" text="全屏" />
    </vertical>
  ),
  settingContent: (
    <vertical gravity="center" bg="#FFFFFF" padding="20"></vertical>
  ),
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
                ivThumb;
                findObject(getId('ivThumb'), 1000)
                  .then((item) => {
                    item.parent().click();
                    startTimer = 0;
                    findObject(getId('previewPlayerPlace'), 5000)
                      .then(() => {
                        findObject(textContains('全屏'))
                          .then((item) => item.click())
                          .catch();
                        isRunning = false;
                        count = 0;
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

onDialogBtnClick(buttonDialog, 'reopen', () => {
  setTimeout(() => {
    safeThread(
      '继续播放',
      () => {
        count = 0;
        if (getId('tvHistory').findOnce() || getId('tvDelAll').findOnce()) {
          startFromHome();
        } else {
          startPage('Detail');
          findObject(getId('previewPlayerPlace'), 3000).catch(() => {
            back();
            startFromHome();
          });
        }
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

onDialogBtnClick(buttonDialog, 'skip', () => {
  setTimeout(() => {
    safeThread('跳过前序', () => {
      if (getId('previewPlayerPlace').findOnce()) {
        if (!getId('curr_time').exists()) {
          click(400, 400);
        }

        findObject(getId('total_time'))
          .then((item) => {
            if (item) {
              let current = 0;
              let total = 0;
              return waitAction(() => {
                current = getId('curr_time').findOne().text().split(':');
                total = getId('total_time').findOne().text().split(':');

                current = current[0] * 60 + current[1];
                total = total[0] * 60 + total[1];

                return total > 0;
              }, 5000)
                .then(() => {
                  if (total > 0) {
                    toastMsg('执行跳过');
                    var rect = getId('seekBar').findOne().bounds();
                    var pointX = rect.left + 52; //rect.width * 10 / 100;
                    var pointY = rect.centerY();
                    click(pointX, pointY);
                  }
                })
                .catch();
            }
          })
          .catch();
      }
    });
  }, 200);
});

onDialogBtnClick(buttonDialog, 'fullscreen', () => {
  if (getId('subtitle_view').exists()) {
    findObject(getId('subtitle_view')).then((selector) => {
      if (selector.bounds().left !== 0) {
        findObject(textContains('全屏'))
          .then((item) => item.click())
          .catch();
      }
    });
  }
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
    root: true,
  });
});
