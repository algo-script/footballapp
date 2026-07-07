import * as WebBrowser from 'expo-web-browser';

export const handleConfigAction = async (actionConfig, pushScreen, configData, parentConfig = null) => {
  // Master Switch Check
  if (configData?.show_ads?.enable === false) return;

  // Parent Switch Check
  if (parentConfig && parentConfig.enable === false) return;

  if (actionConfig && actionConfig.enable && actionConfig.url) {
    try {
      if ((actionConfig.openurl === 'webview' || actionConfig.open_in === 'webview') && pushScreen) {
        pushScreen('webview', { url: actionConfig.url });
      } else {
        await WebBrowser.openBrowserAsync(actionConfig.url);
      }
    } catch (e) {
      console.warn("Failed to open ad action", e);
    }
  }
};
