import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { ConfigContext } from '../context/ConfigContext';
import FotmobImage from './FotmobImage';
import AdCard from './AdCard';
import { handleConfigAction } from '../utils/adAction';

const api = require('../apis.js');

export default function LeaguesTab({ onSelectLeague, pushScreen }) {
  const { theme: COLORS, styles } = useContext(ThemeContext);
  const { configData } = useContext(ConfigContext);
  const [leaguesData, setLeaguesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedCountries, setExpandedCountries] = useState({});

  useEffect(() => {
    const loadLeagues = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.fetchLeaguesList();
        setLeaguesData(data?.leagues || null);
      } catch (err) {
        console.error("Error loading leagues list:", err);
        setError(err.message || "Failed to load leagues data");
      } finally {
        setLoading(false);
      }
    };
    loadLeagues();
  }, []);

  const toggleExpand = (ccode) => {
    setExpandedCountries((prev) => ({
      ...prev,
      [ccode]: !prev[ccode]
    }));
    const parentConfig = configData?.leagues_tab;
                  const actionConfig = parentConfig?.content?.toggle_expand_country;
                  if (actionConfig) handleConfigAction(actionConfig, pushScreen, configData, parentConfig);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg, paddingVertical: 40 }}>
        <ActivityIndicator size="large" color={COLORS.accentGreen} />
      </View>
    );
  }

  if (error && !leaguesData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg, padding: 24 }}>
        <Text style={{ color: COLORS.textMuted, fontSize: 16, textAlign: 'center', marginBottom: 12 }}>{error}</Text>
      </View>
    );
  }

  const popularLeagues = leaguesData?.selected?.league || [];
  const countryGroups = leaguesData?.group || [];

  const adsConfig = configData?.leagues_tab_ads || {};
  const masterEnable = configData?.show_ads?.enable !== false;
  const showAds = masterEnable && adsConfig.enable && Array.isArray(adsConfig.url) && adsConfig.url.length > 0;
  const cardFreq = adsConfig.card || 1;
  let adCounter = 0;

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30, paddingHorizontal: 16, paddingTop: 16 }}>
      {/* 1. Popular Leagues */}
      <Text style={styles.sectionTitle}>⭐ Popular Leagues</Text>
      <View style={{ gap: 8, marginBottom: 24, marginTop: 8 }}>
        {popularLeagues.map((item, index) => {
          let adItem = null;
          if (showAds && (index + 1) % cardFreq === 0) {
            adItem = adsConfig.url[adCounter % adsConfig.url.length];
            adCounter++;
          }
          return (
            <React.Fragment key={item.id}>
              <Pressable
                style={styles.leagueListItem}
                onPress={() => {
                  onSelectLeague(item);
                  const parentConfig = configData?.leagues_tab;
                  const actionConfig = parentConfig?.content?.popular_league_click;
                  if (actionConfig) handleConfigAction(actionConfig, pushScreen, configData, parentConfig);
                }}
              >
                <FotmobImage
                  id={item.id}
                  type="league"
                  style={styles.leagueLogo}
                />
                <View style={styles.leagueListInfo}>
                  <Text style={styles.leagueListName}>{item.name}</Text>
                  <Text style={styles.leagueListCountry}>{item.lccode || 'INT'}</Text>
                </View>
                <Text style={styles.leagueListChevron}>→</Text>
              </Pressable>
              {adItem && <AdCard ad={adItem} pushScreen={pushScreen} />}
            </React.Fragment>
          );
        })}
      </View>

      {/* 2. Country Wise Leagues (Expandable) */}
      <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>🌍 Countries</Text>

      {countryGroups.map((group, index) => {
        const isExpanded = !!expandedCountries[group.ccode];
        const leaguesList = Array.isArray(group.league) ? group.league : (group.league ? [group.league] : []);

        let adItemCountry = null;
        if (showAds && (index + 1) % cardFreq === 0) {
          adItemCountry = adsConfig.url[adCounter % adsConfig.url.length];
          adCounter++;
        }

        return (
          <React.Fragment key={group.ccode}>
            <View style={{
            backgroundColor: COLORS.card,
            borderRadius: 12,
            marginBottom: 10,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: COLORS.border
          }}>
            {/* Country Header Row (Press to toggle) */}
            <Pressable
              onPress={() => toggleExpand(group.ccode)}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 14,
                paddingHorizontal: 16,
                backgroundColor: COLORS.cardLight
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ color: COLORS.text, fontWeight: 'bold', fontSize: 15 }}>
                  {group.cname}
                </Text>
                <Text style={{ color: COLORS.textMuted, fontSize: 11, fontWeight: 'bold' }}>
                  ({leaguesList.length})
                </Text>
              </View>
              <Text style={{ color: COLORS.accentGreen, fontSize: 16, fontWeight: 'bold' }}>
                {isExpanded ? '▼' : '▶'}
              </Text>
            </Pressable>

            {/* Expandable Leagues List */}
            {isExpanded && (
              <View style={{ padding: 10, backgroundColor: COLORS.card, gap: 8 }}>
                {leaguesList.map((item) => (
                  <Pressable
                    key={item.id}
                    style={[styles.leagueListItem, { backgroundColor: COLORS.cardLight, marginVertical: 2, marginBottom: 0 }]}
                    onPress={() => {
                      onSelectLeague(item);
                      const parentConfig = configData?.leagues_tab;
                  const actionConfig = parentConfig?.content?.country_league_click;
                  if (actionConfig) handleConfigAction(actionConfig, pushScreen, configData, parentConfig);
                    }}
                  >
                    <FotmobImage
                      id={item.id}
                      type="league"
                      style={styles.leagueLogo}
                    />
                    <View style={styles.leagueListInfo}>
                      <Text style={styles.leagueListName}>{item.name}</Text>
                    </View>
                    <Text style={styles.leagueListChevron}>→</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
          {adItemCountry && <AdCard ad={adItemCountry} pushScreen={pushScreen} />}
        </React.Fragment>
        );
      })}
    </ScrollView>
  );
}
