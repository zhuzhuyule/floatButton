const toastMsg = require('./toastMsg');

function onDialogBtnClick(dialog, id, action) {
  dialog.dialog[id].click(() => {
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

module.exports = {
  onDialogBtnClick,
  onDialogSeekBarChange,
};
