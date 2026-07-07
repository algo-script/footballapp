import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Platform,
  BackHandler,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { ArrowLeft } from 'lucide-react-native';

// Context
import { ThemeContext, ThemeProvider } from './context/ThemeContext';
import { ConfigContext, ConfigProvider } from './context/ConfigContext';

// Components
import MatchesTab from './components/MatchesTab';
import LeaguesTab from './components/LeaguesTab';
import SettingsTab from './components/SettingsTab';
import MatchDetailScreen from './components/MatchDetailScreen';
import LeagueDetailScreen from './components/LeagueDetailScreen';
import TeamDetailScreen from './components/TeamDetailScreen';
import PlayerDetailScreen from './components/PlayerDetailScreen';
import WebViewScreen from './components/WebViewScreen';
import * as WebBrowser from 'expo-web-browser';
import { handleConfigAction } from './utils/adAction';

function MainApp() {
  const { theme: COLORS, styles, isDark } = useContext(ThemeContext);
  const { configData } = useContext(ConfigContext);
  const [activeTab, setActiveTab] = useState('matches'); // 'matches', 'leagues', 'settings'
  const [navigationStack, setNavigationStack] = useState([{ screen: 'home', params: {} }]);
  const [splashState, setSplashState] = useState('waiting_for_config'); // 'waiting_for_config', 'showing_splash', 'done'

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync(isDark ? COLORS.card : COLORS.cardLight);
      NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');
    }
  }, [isDark, COLORS]);

  // Handle Splash Screen and Initial Startup Ads
  useEffect(() => {
    if (splashState === 'waiting_for_config' && configData) {
      const masterEnable = configData?.show_ads?.enable !== false;
      if (configData.splashscreen && configData.splashscreen.enable) {
        setSplashState('showing_splash');
      } else {
        setSplashState('done');
        // Fallback for older show_ads config
        if (masterEnable && configData.show_ads && configData.show_ads.enable && configData.show_ads.url) {
          const adUrl = configData.show_ads.url;
          if (configData.show_ads.openurl === 'webview') {
             pushScreen('webview', { url: adUrl });
          } else {
             WebBrowser.openBrowserAsync(adUrl).catch(err => console.warn(err));
          }
        }
      }
    }
  }, [configData, splashState]);

  useEffect(() => {
    let timer;
    if (splashState === 'showing_splash') {
      timer = setTimeout(async () => {
        setSplashState('done');
        const masterEnable = configData?.show_ads?.enable !== false;
        const splashConfig = configData.splashscreen;
        const splashAdsEnable = splashConfig?.ads_enable !== false;
        
        if (masterEnable && splashConfig && splashConfig.ads_url && splashAdsEnable) {
          try {
            if (splashConfig.open_in === 'webview') {
              pushScreen('webview', { url: splashConfig.ads_url });
            } else {
              await WebBrowser.openBrowserAsync(splashConfig.ads_url);
            }
          } catch (error) {
            console.warn('Error opening splash ad:', error);
          }
        }
      }, 3000); // Display splash screen for 3 seconds
    }
    return () => clearTimeout(timer);
  }, [splashState, configData]);

  // Fallback if config takes too long
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (splashState === 'waiting_for_config') {
        setSplashState('done');
      }
    }, 6000); // 6 seconds timeout for internet
    return () => clearTimeout(fallbackTimer);
  }, [splashState]);

  const isMockMode = false;
  const [loading, setLoading] = useState(false);

  const pushScreen = (screen, params = {}, skipScreenAd = false) => {
    setNavigationStack(prev => [...prev, { screen, params }]);
    
    if (skipScreenAd) return;
    
    let screenConfigKey = null;
    if (screen === 'match') screenConfigKey = 'match_detail_screen';
    else if (screen === 'league') screenConfigKey = 'league_detail_screen';
    else if (screen === 'team') screenConfigKey = 'team_detail_screen';
    else if (screen === 'player') screenConfigKey = 'player_detail_screen';

    if (screenConfigKey && configData?.[screenConfigKey]) {
      handleConfigAction(
        configData[screenConfigKey], 
        (s, p) => setNavigationStack(prev => [...prev, { screen: s, params: p }]), 
        configData
      );
    }
  };

  const popScreen = () => {
    if (navigationStack.length > 1) {
      setNavigationStack(navigationStack.slice(0, -1));
    }
  };

  const handleBackNavigation = () => {
    if (navigationStack.length > 1) {
      const currentScreen = navigationStack[navigationStack.length - 1].screen;
      // Create new stack internally so state updates correctly
      setNavigationStack(prevStack => prevStack.slice(0, -1));
      
      let specificBackConfig = null;
      if (currentScreen === 'match') specificBackConfig = configData?.match_detail_screen?.content?.back_button;

      if (configData?.backscreen?.enable !== false) {
        if (specificBackConfig) {
          handleConfigAction(specificBackConfig, pushScreen, configData, configData?.match_detail_screen);
        } else if (configData?.backscreen) {
          handleConfigAction(configData.backscreen, pushScreen, configData);
        } else {
          const parentConfig = configData?.main_navigation;
          const actionConfig = parentConfig?.content?.header_back_button;
          if (actionConfig) handleConfigAction(actionConfig, pushScreen, configData, parentConfig);
        }
      }
      return true; // Prevent default
    }
    return false; // Allow default (exit app)
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackNavigation);
    return () => backHandler.remove();
  }, [navigationStack, configData]);

  const current = navigationStack[navigationStack.length - 1];

  if (splashState === 'showing_splash' && configData?.splashscreen?.url) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.card }}>
        <StatusBar style="light" translucent={true} />
        <Image 
          source={{ uri: configData.splashscreen.url }} 
          style={{ flex: 1, width: '100%', height: '100%' }} 
          resizeMode="cover"
        />
      </View>
    );
  }

  if (splashState === 'waiting_for_config') {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: COLORS.card }]}>
        <StatusBar style="light" translucent={true} />
        <ActivityIndicator size="large" color={COLORS.accentGreen} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent={true} />

      {/* Header */}
      {current.screen !== 'webview' && (
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {navigationStack.length > 1 && (
            <Pressable onPress={handleBackNavigation} style={styles.backButton}>
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
                    : current.screen === 'webview'
                      ? 'Browser'
                      : 'GOALSPHERE'}
          </Text>
        </View>
      </View>
      )}

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
                <MatchesTab isMockMode={isMockMode} onSelectMatch={(id) => pushScreen('match', { matchId: id }, true)} pushScreen={pushScreen} />
              )}
              {activeTab === 'leagues' && (
                <LeaguesTab onSelectLeague={(league) => pushScreen('league', { league }, true)} pushScreen={pushScreen} />
              )}
              {activeTab === 'settings' && (
                <SettingsTab pushScreen={pushScreen} />
              )}
            </>
          ) : current.screen === 'match' ? (
            <MatchDetailScreen params={current.params} popScreen={handleBackNavigation} pushScreen={pushScreen} />
          ) : current.screen === 'league' ? (
            <LeagueDetailScreen params={current.params} pushScreen={pushScreen} />
          ) : current.screen === 'team' ? (
            <TeamDetailScreen params={current.params} pushScreen={pushScreen} />
          ) : current.screen === 'player' ? (
            <PlayerDetailScreen params={current.params} />
          ) : current.screen === 'webview' ? (
            <WebViewScreen url={current.params.url} />
          ) : null}
        </View>
      )}

      {/* Bottom Navigation (Only on Home Screen) */}
      {current.screen === 'home' && (
        <View style={styles.tabBar}>
          <Pressable style={[styles.tabItem, activeTab === 'matches' && styles.tabItemActive]} onPress={() => {
            setActiveTab('matches');
            const parentConfig = configData?.main_navigation;
                  const actionConfig = parentConfig?.content?.tab_matches;
                  if (actionConfig) handleConfigAction(actionConfig, pushScreen, configData, parentConfig);
          }}>
            <Text style={[styles.tabIcon, activeTab === 'matches' && styles.tabTextActive]}>📅</Text>
            <Text style={[styles.tabLabel, activeTab === 'matches' && styles.tabTextActive]}>Matches</Text>
          </Pressable>

          <Pressable style={[styles.tabItem, activeTab === 'leagues' && styles.tabItemActive]} onPress={() => {
            setActiveTab('leagues');
            const parentConfig = configData?.main_navigation;
                  const actionConfig = parentConfig?.content?.tab_leagues;
                  if (actionConfig) handleConfigAction(actionConfig, pushScreen, configData, parentConfig);
          }}>
            <Text style={[styles.tabIcon, activeTab === 'leagues' && styles.tabTextActive]}>🏆</Text>
            <Text style={[styles.tabLabel, activeTab === 'leagues' && styles.tabTextActive]}>Leagues</Text>
          </Pressable>

          <Pressable style={[styles.tabItem, activeTab === 'settings' && styles.tabItemActive]} onPress={() => {
            setActiveTab('settings');
            const parentConfig = configData?.main_navigation;
                  const actionConfig = parentConfig?.content?.tab_settings;
                  if (actionConfig) handleConfigAction(actionConfig, pushScreen, configData, parentConfig);
          }}>
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
    <ConfigProvider>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </ConfigProvider>
  );
}
