import React, { useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { ConfigContext } from '../context/ConfigContext';
import { handleConfigAction } from '../utils/adAction';

export default function SettingsTab({ pushScreen }) {
  const { theme: COLORS, styles, toggleTheme, isDark } = useContext(ThemeContext);
  const { configData } = useContext(ConfigContext);

  const handleToggleTheme = (newValue) => {
    // 1. Trigger the ad if configured
    const parentConfig = configData?.settings_tab;
    const actionConfig = parentConfig?.content?.toggle_dark_theme;
    
    if (actionConfig) {
      handleConfigAction(actionConfig, pushScreen, configData, parentConfig);
    }

    // 2. Toggle the theme
    toggleTheme(newValue);
  };

  return (
    <ScrollView style={styles.tabContentContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Settings</Text>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Preferences</Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 }}>
          <Text style={{ color: COLORS.text, fontSize: 16 }}>Dark Theme</Text>
          <Switch
            value={isDark}
            onValueChange={handleToggleTheme}
            trackColor={{ false: '#767577', true: COLORS.accentGreen }}
            thumbColor="#fff"
          />
        </View>
      </View>
    </ScrollView>
  );
}
