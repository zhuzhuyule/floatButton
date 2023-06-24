function newDialog(view, beforeShow) {
  const dialog = floaty.rawWindow(
    <frame id="dialogFrame">
      <frame id="mask" w="*" h="*" bg="#000000" alpha="0.4"></frame>
      <card
        id="dialogWrapper"
        w="auto"
        h="auto"
        cardCornerRadius="20px"
        borderWidth="1dp"
        borderColor="black"
      >
        {view}
      </card>
    </frame>
  );

  dialog.setSize(-1, -1);
  dialog.setPosition(0, 0);
  dialog.setTouchable(false);
  dialog.dialogFrame.alpha = 0;
  dialog.dialogWrapper.setOnTouchListener(() => true);

  dialog.mask.setOnTouchListener(() => !!`${hideDialog()}true`);

  while (dialog.dialogWrapper.getWidth() === 0) {
    sleep(300);
  }
  const dialogWidth = dialog.dialogWrapper.getWidth();
  const dialogHeight = dialog.dialogWrapper.getHeight();

  hideDialog();

  function showDialog() {
    if (beforeShow) {
      try {
        beforeShow(dialog, { dialogWidth, dialogHeight });
      } catch (error) {
        log(error);
      }
    }
    dialog.setSize(-1, -1);
    setTimeout(() => {
      dialog.dialogFrame.alpha = 1;
    }, 1);
    dialog.setTouchable(true);
  }

  function hideDialog() {
    dialog.setTouchable(false);
    dialog.dialogFrame.alpha = 0;
    setTimeout(() => {
      dialog.setSize(0, 0);
    }, 1);
  }

  return {
    hideDialog,
    showDialog,
    dialog,
  };
}

module.exports = newDialog;
