importClass(android.widget.Toast);

let toastAndLog = (function () {
  let toast = null;
  function showText(msg) {
    if (!toast) {
      toast = Toast.makeText(context, msg, Toast.LENGTH_SHORT);
    } else {
      toast.setText(msg);
    }
    toast.show();
    log(msg);
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
  toastAndLog(msg);
}

module.exports = toastMsg;
