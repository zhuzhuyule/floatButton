const newFloat = require('./utils/floatButton');

const floatBtn = newFloat({
  buttonContent: (
    <vertical gravity="center" bg="#FFFFFF" padding="20">
      <horizontal>
        <button id="button1" text="按钮1" marginRight="10" />
        <button id="button2" text="按钮2" />
      </horizontal>
    </vertical>
  ),
  settingContent: (
    <vertical gravity="center" bg="#FFFFFF" padding="20"></vertical>
  ),
});

setTimeout(() => {}, 101000);
