const toastMsg = require('./toastMsg');
const newDialog = require('./dialog');
const tools = require('./tool');

function newFloatButton(config) {
  const cacheKey = config.cacheKey || 'zhuzhuyule:float-button';
  const buttonContent = config.buttonContent;
  const settingContent = config.settingContent;

  // storages.remove(cacheKey);
  const floatBtnStorage = storages.create(cacheKey);

  const screenWidth = device.width;
  const screenHeight = device.height;

  let buttonSize = floatBtnStorage.get('size', 60);
  let buttonAlpha = floatBtnStorage.get('alpha', 0.8);
  let buttonColor = floatBtnStorage.get('color', '#ffffff');

  const floatBtn = floaty.rawWindow(
    <card
      id="button"
      w="*"
      h="*"
      alpha="0"
      cardBackgroundColor="#ffffff"
      cardCornerRadius="0px"
      borderWidth="1dp"
      borderColor="black"
    />
  );

  floatBtn.setSize(buttonSize, buttonSize);
  floatBtn.setPosition(
    floatBtnStorage.get('left', 0),
    floatBtnStorage.get('top', screenHeight / 2)
  );

  while (floatBtn.button.getWidth() === 0) {
    sleep(300);
  }

  floatBtn.button.alpha = buttonAlpha;
  floatBtn.button.setRadius(buttonSize / 2);
  floatBtn.button.setCardBackgroundColor(
    android.graphics.Color.parseColor(buttonColor)
  );

  const buttonDialog = newDialog(
    buttonContent,
    function onDialogShow(dialog, params) {
      const dialogWidth = params.dialogWidth;
      const dialogHeight = params.dialogHeight;
      const buttonWidth = floatBtn.getWidth();
      const buttonHeight = floatBtn.getHeight();
      const buttonLeft = floatBtn.getX();
      const showRightSide =
        buttonLeft + buttonWidth + dialogWidth < screenWidth;
      const minTop = 0;
      const maxTop = screenHeight - dialogHeight;
      const minLeft = showRightSide ? buttonWidth : 0;
      const maxLeft = showRightSide ? screenWidth - buttonWidth : buttonLeft;

      const newLeft = showRightSide
        ? buttonLeft + buttonWidth
        : buttonLeft - dialogWidth;
      const newTop = floatBtn.getY() + buttonHeight / 2 - dialogHeight / 2;

      const left =
        newLeft > maxLeft ? maxLeft : newLeft < minLeft ? minLeft : newLeft;
      const top = newTop > maxTop ? maxTop : newTop < minTop ? minTop : newTop;
      dialog.dialogWrapper.setTranslationX(left);
      dialog.dialogWrapper.setTranslationY(top);

      floatBtnStorage.put('left', left);
      floatBtnStorage.put('top', top);
    }
  );

  const settingDialog = newDialog(
    <vertical w="*" h="auto" gravity="center" bg="#FFFFFF" padding="20">
      <vertical w="*">
        <text text="Button大小" />
        <seekbar id="buttonSize" w="*" max="40" />
      </vertical>
      <vertical w="*">
        <text text="Button透明度" />
        <seekbar id="buttonAlpha" w="*" max="80" />
      </vertical>
      <vertical w="*">
        <text text="Button颜色" />
        <seekbar id="buttonColor" w="*" max="16777215" />
      </vertical>
      {settingContent}
    </vertical>,
    function onDialogShow(dialog, params) {
      dialog.buttonSize.setProgress(buttonSize - 40);
      dialog.buttonAlpha.setProgress(buttonAlpha * 100 - 20);
      dialog.buttonColor.setProgress(parseInt(buttonColor.slice(1), 16));

      const layout = dialog.dialogWrapper.getLayoutParams();
      layout.width = Math.round(screenWidth * 0.8);
      dialog.dialogWrapper.setLayoutParams(layout);

      dialog.dialogWrapper.setTranslationX((screenWidth - layout.width) / 2);
      dialog.dialogWrapper.setTranslationY(
        (screenHeight - params.dialogHeight) / 2
      );
    }
  );

  var touchX = 0; //记录按键被按下时的触摸坐标
  var touchY = 0; //记录按键被按下时的触摸坐标
  var buttonX, buttonY; //记录按键被按下时的悬浮窗位置
  var downTime; //记录按键被按下的时间以便判断长按等动作
  var isMoved;
  var longPressTimer = 0;
  floatBtn.button.setOnTouchListener(function (view, event) {
    const action = event.getAction();
    switch (action) {
      case event.ACTION_DOWN:
        touchX = event.getRawX();
        touchY = event.getRawY();
        buttonX = floatBtn.getX();
        buttonY = floatBtn.getY();
        downTime = Date.now();
        isMoved = false;
        longPressTimer = setTimeout(() => {
          longPressTimer = 0;
          settingDialog.showDialog();
        }, 500);
        return true;
      case event.ACTION_MOVE:
      case event.ACTION_UP:
        offsetX = event.getRawX() - touchX;
        offsetY = event.getRawY() - touchY;
        if (isMoved || Math.abs(offsetX) + Math.abs(offsetY) > 20) {
          isMoved = true;
          if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = 0;
          }
          floatBtn.setPosition(
            Math.max(buttonX + offsetX, -floatBtn.getWidth() / 2),
            Math.max(buttonY + offsetY, -floatBtn.getHeight() / 2)
          );
        }
        if (!isMoved && action === event.ACTION_UP) {
          if (Date.now() - downTime < 300) {
            if (longPressTimer) {
              clearTimeout(longPressTimer);
              longPressTimer = 0;
            }
            buttonDialog.showDialog();
          }
        }
        return true;
    }
    return true;
  });

  // setting dialog events
  tools.onDialogSeekBarChange(settingDialog, 'buttonSize', function (progress) {
    buttonSize = progress + 40;
    floatBtn.setSize(buttonSize, buttonSize);
    floatBtn.button.setRadius(buttonSize / 2);
    floatBtnStorage.put('size', buttonSize);
  });

  tools.onDialogSeekBarChange(
    settingDialog,
    'buttonAlpha',
    function (progress) {
      buttonAlpha = (progress + 20) / 100;
      floatBtn.button.alpha = buttonAlpha;
      floatBtnStorage.put('alpha', buttonAlpha);
    }
  );

  tools.onDialogSeekBarChange(
    settingDialog,
    'buttonColor',
    function (progress) {
      buttonColor = `#${progress.toString(16).padStart(6, '0')}`;
      floatBtn.button.setCardBackgroundColor(
        android.graphics.Color.parseColor(buttonColor)
      );
      floatBtnStorage.put('color', buttonColor);
    }
  );

  return {
    floatBtn,
    buttonDialog,
    settingDialog,
    floatBtnStorage,
  };
}

module.exports = newFloatButton;
