import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { ArrowLeft } from 'lucide-react-native';

// Context
import { ThemeContext, ThemeProvider } from './context/ThemeContext';

// Components
import MatchesTab from './components/MatchesTab';
import LeaguesTab from './components/LeaguesTab';
import SettingsTab from './components/SettingsTab';
import MatchDetailScreen from './components/MatchDetailScreen';
import LeagueDetailScreen from './components/LeagueDetailScreen';
import TeamDetailScreen from './components/TeamDetailScreen';
import PlayerDetailScreen from './components/PlayerDetailScreen';

function MainApp() {
  const { theme: COLORS, styles, isDark } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState('matches'); // 'matches', 'leagues', 'settings'
  const [navigationStack, setNavigationStack] = useState([{ screen: 'home', params: {} }]);

  useEffect(() => {
    const configureNavBar = async () => {
      if (Platform.OS === 'android') {
        try {
          await NavigationBar.setBehaviorAsync("sticky-immersive");
          await NavigationBar.setVisibilityAsync("hidden");
          await NavigationBar.setButtonStyleAsync(isDark ? "light" : "dark");
          await NavigationBar.setBackgroundColorAsync(isDark ? "#0A0D14" : "#F5F7FA");
        } catch (err) {
          console.warn("Failed to configure navigation bar:", err);
        }
      }
    };
    configureNavBar();
  }, [isDark]);

  const isMockMode = false;
  const [loading, setLoading] = useState(false);

  const pushScreen = (screen, params = {}) => {
    setNavigationStack([...navigationStack, { screen, params }]);
  };

  const popScreen = () => {
    if (navigationStack.length > 1) {
      setNavigationStack(navigationStack.slice(0, -1));
    }
  };

  const current = navigationStack[navigationStack.length - 1];

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent={true} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {navigationStack.length > 1 && (
            <Pressable onPress={popScreen} style={styles.backButton}>
              <ArrowLeft size={18} color={COLORS.text} />
            </Pressable>
          )}
          <Text style={styles.headerTitle} numberOfLines={1}>
            {current.screen === 'match'
              ? 'Match Details'
              : current.screen === 'league'
                ? 'League Dashboard'
                : current.screen === 'team'
                  ? 'Team Hub'
                  : current.screen === 'player'
                    ? 'Player Profile'
                    : 'GOALSPHERE'}
          </Text>
        </View>
      </View>

      {/* Main Content Router */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.accentGreen} />
        </View>
      ) : (
        <View style={styles.mainContent}>
          {current.screen === 'home' ? (
            /* Tab rendering */
            <>
              {activeTab === 'matches' && (
                <MatchesTab isMockMode={isMockMode} onSelectMatch={(id) => pushScreen('match', { matchId: id })} />
              )}
              {activeTab === 'leagues' && (
                <LeaguesTab onSelectLeague={(league) => pushScreen('league', { league })} />
              )}
              {activeTab === 'settings' && (
                <SettingsTab />
              )}
            </>
          ) : current.screen === 'match' ? (
            <MatchDetailScreen params={current.params} popScreen={popScreen} pushScreen={pushScreen} />
          ) : current.screen === 'league' ? (
            <LeagueDetailScreen params={current.params} pushScreen={pushScreen} />
          ) : current.screen === 'team' ? (
            <TeamDetailScreen params={current.params} pushScreen={pushScreen} />
          ) : current.screen === 'player' ? (
            <PlayerDetailScreen params={current.params} />
          ) : null}
        </View>
      )}

      {/* Bottom Navigation (Only on Home Screen) */}
      {current.screen === 'home' && (
        <View style={styles.tabBar}>
          <Pressable style={[styles.tabItem, activeTab === 'matches' && styles.tabItemActive]} onPress={() => setActiveTab('matches')}>
            <Text style={[styles.tabIcon, activeTab === 'matches' && styles.tabTextActive]}>📅</Text>
            <Text style={[styles.tabLabel, activeTab === 'matches' && styles.tabTextActive]}>Matches</Text>
          </Pressable>

          <Pressable style={[styles.tabItem, activeTab === 'leagues' && styles.tabItemActive]} onPress={() => setActiveTab('leagues')}>
            <Text style={[styles.tabIcon, activeTab === 'leagues' && styles.tabTextActive]}>🏆</Text>
            <Text style={[styles.tabLabel, activeTab === 'leagues' && styles.tabTextActive]}>Leagues</Text>
          </Pressable>

          <Pressable style={[styles.tabItem, activeTab === 'settings' && styles.tabItemActive]} onPress={() => setActiveTab('settings')}>
            <Text style={[styles.tabIcon, activeTab === 'settings' && styles.tabTextActive]}>⚙️</Text>
            <Text style={[styles.tabLabel, activeTab === 'settings' && styles.tabTextActive]}>Settings</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
