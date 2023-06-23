importClass(android.widget.Toast);

let toastAndLog = (function () {
  let toast = null;
  function showText(msg) {
    if (!toast) {
      toast = Toast.makeText(context, msg, Toast.LENGTH_SHORT);
    } else {
      toast.setText(msg);
    }
    log(msg);
    toast.show();
  }
  return showText;
})();

function toastMsg() {
  let msg = '';
  for (var i = 0; i < arguments.length; i++) {
    msg += JSON.stringify(arguments[i]);
    if (i < arguments.length - 1) {
      msg += `\t`;
    }
  }
  events.broadcast.emit('toast-message', msg);
}

events.broadcast.on('toast-message', function (msg) {
  toastAndLog(msg);
});

module.exports = toastMsg;
