import React, { useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

export default function SettingsTab() {
  const { theme: COLORS, styles, toggleTheme, isDark } = useContext(ThemeContext);
  return (
    <ScrollView style={styles.tabContentContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Settings</Text>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Preferences</Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 }}>
          <Text style={{ color: COLORS.text, fontSize: 16 }}>Dark Theme</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: COLORS.accentGreen }}
            thumbColor="#fff"
          />
        </View>
      </View>
    </ScrollView>
  );
}
