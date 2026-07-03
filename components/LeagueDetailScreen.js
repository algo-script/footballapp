import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import FotmobImage from './FotmobImage';

const api = require('../apis.js');

const formatFee = (fee) => {
  if (!fee) return 'Undisclosed';
  if (typeof fee === 'object') {
    if (fee.value && typeof fee.value === 'number') {
      if (fee.value >= 1000000) {
        return `€${(fee.value / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
      } else if (fee.value >= 1000) {
        return `€${(fee.value / 1000).toFixed(1).replace(/\.0$/, '')}K`;
      }
      return `€${fee.value.toLocaleString()}`;
    }
    if (fee.feeText === 'fee') return 'Undisclosed';
    return fee.feeText || 'Undisclosed';
  }
  return fee;
};

export default function LeagueDetailScreen({ params, pushScreen }) {
  const { theme: COLORS, styles } = useContext(ThemeContext);
  const { league } = params;
  const [leagueTab, setLeagueTab] = useState('standings'); // 'standings', 'teams', 'rounds', 'stats', 'trophies', 'transfers', 'seasons', 'news'
  const [standingType, setStandingType] = useState('all'); // 'all', 'home', 'away'

  const [dynamicData, setDynamicData] = useState(null);
  const [dynamicTable, setDynamicTable] = useState(null);
  const [dynamicFixtures, setDynamicFixtures] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFixtures, setIsLoadingFixtures] = useState(false);

  // Load initial details & table
  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [detailsData, tableData] = await Promise.all([
          api.fetchLeagueDetails(league.id),
          api.fetchLeagueTable(league.id)
        ]);
        if (isMounted) {
          setDynamicData(detailsData);
          setDynamicTable(tableData);
        }
      } catch (err) {
        console.error("Error loading league details:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadInitialData();
    return () => { isMounted = false; };
  }, [league.id]);

  // Lazy load fixtures only when user visits the tab
  useEffect(() => {
    if (leagueTab === 'fixtures' && !dynamicFixtures && !isLoadingFixtures) {
      let isMounted = true;
      const loadFixtures = async () => {
        setIsLoadingFixtures(true);
        try {
          const fixturesData = await api.fetchLeagueFixtures(league.id);
          if (isMounted) {
            setDynamicFixtures(fixturesData);
          }
        } catch (err) {
          console.error("Error loading league fixtures:", err);
        } finally {
          if (isMounted) setIsLoadingFixtures(false);
        }
      };
      loadFixtures();
      return () => { isMounted = false; };
    }
  }, [leagueTab, league.id, dynamicFixtures]);

  const roundsList = api['get-all-rounds']?.response?.rounds || [];
  const [selectedRoundId, setSelectedRoundId] = useState(() => {
    return roundsList[0]?.roundId || null;
  });

  const leagueDetail = api['get-league-detail']?.response || {};
  const teamsList = api['get-list-all-team']?.response?.teams || [];

  const standingsAll = api['get-standing-all']?.response?.standing || [];
  const standingsHome = api['get-standing-home']?.response?.standing || [];
  const standingsAway = api['get-standing-away']?.response?.standing || [];
  const currentStandings = standingType === 'all' ? standingsAll : standingType === 'home' ? standingsHome : standingsAway;

  const roundPerformers = api['get-rounds-detail']?.response?.rounds || [];
  const roundMatches = api['get-all-matches-by-league']?.response?.matches || [];

  const topGoals = api['get-top-players-by-goals']?.response?.players || [];
  const topAssists = api['get-top-players-by-assists']?.response?.players || [];
  const topRatings = api['get-top-players-by-rating']?.response?.players || [];

  const trophiesList = api['get-trophies-all-seasons']?.response?.trophies || [];
  const leagueTransfers = api['get-league-transfers']?.response?.transfers || [];
  const leagueNews = api['get-league-news']?.response?.news || [];

  let dynamicTableGroups = [];
  if (dynamicTable?.table) {
    if (dynamicTable.table.subt) {
      dynamicTableGroups = Array.isArray(dynamicTable.table.subt)
        ? dynamicTable.table.subt
        : [dynamicTable.table.subt];
    } else if (dynamicTable.table.t) {
      dynamicTableGroups = [{ name: dynamicData?.Name || 'Standings', t: dynamicTable.table.t }];
    }
  }

  return (
    <View style={styles.detailWrapper}>
      {/* Banner */}
      <View style={styles.leagueBanner}>
        <FotmobImage id={league.id} type="league" style={styles.largeLeagueLogo} />
        <Text style={styles.largeLeagueName}>{dynamicData?.Name || league.name}</Text>
        <Text style={styles.largeLeagueCountry}>{dynamicData?.CountryCode || league.ccode || league.lccode || 'INT'} Football League • Season: {dynamicData?.Seasons?.[0]?.Name || leagueDetail.currentSeason || '2023/2024'}</Text>
      </View>

      {/* Tabs */}
      <View style={{ height: 48 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.detailTabBar}>
          {[
            { id: 'standings', label: 'Standings' },
            { id: 'seasons', label: 'Seasons' },
            { id: 'trophies', label: 'Trophies' },
            { id: 'fixtures', label: 'Fixtures' },
          ].map((tab) => (
            <Pressable
              key={tab.id}
              style={[styles.detailTabItem, leagueTab === tab.id && styles.detailTabItemActive]}
              onPress={() => setLeagueTab(tab.id)}
            >
              <Text style={[styles.detailTabLabel, leagueTab === tab.id && styles.detailTabLabelActive]}>{tab.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Tab Screen Contents */}
      <ScrollView style={styles.detailScrollContent} showsVerticalScrollIndicator={false}>
        {/* STANDINGS TAB */}
        {leagueTab === 'standings' && (
          <View>
            {isLoading ? (
              <ActivityIndicator size="large" color={COLORS.accentBlue} style={{ marginTop: 40 }} />
            ) : dynamicTableGroups.length === 0 ? (
              <View style={{ padding: 16 }}>
                <Text style={styles.emptyText}>No standings available for this league.</Text>
                <Text style={{ color: 'red', marginTop: 8, fontSize: 10 }}>
                  DEBUG: {dynamicTable ? JSON.stringify(dynamicTable).substring(0, 500) : 'null'}
                </Text>
              </View>
            ) : (
              dynamicTableGroups.map((group, groupIdx) => (
                <View key={groupIdx} style={{ marginBottom: 24 }}>
                  {dynamicTableGroups.length > 1 && (
                    <View style={{ backgroundColor: COLORS.card, paddingVertical: 8, paddingHorizontal: 16, borderLeftWidth: 4, borderLeftColor: COLORS.accentBlue, marginBottom: 8 }}>
                      <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: 'bold' }}>{group.name}</Text>
                    </View>
                  )}
                  <View style={styles.tableHeader}>
                    <Text style={[styles.headerCell, styles.cellRank]}>#</Text>
                    <Text style={[styles.headerCell, styles.cellTeam]}>Team</Text>
                    <Text style={[styles.headerCell, styles.cellNum]}>PL</Text>
                    <Text style={[styles.headerCell, styles.cellNum]}>W</Text>
                    <Text style={[styles.headerCell, styles.cellNum]}>D</Text>
                    <Text style={[styles.headerCell, styles.cellNum]}>L</Text>
                    <Text style={[styles.headerCell, styles.cellNum]}>GD</Text>
                    <Text style={[styles.headerCell, styles.cellPts]}>PTS</Text>
                  </View>
                  <View style={styles.tableBody}>
                    {group.t && group.t.map((item, index) => {
                      const played = parseInt(item.w || 0) + parseInt(item.d || 0) + parseInt(item.l || 0);
                      const gd = parseInt(item.g || 0) - parseInt(item.c || 0);
                      return (
                        <Pressable
                          key={item.id}
                          style={({ pressed }) => [
                            styles.tableRow,
                            index % 2 === 1 && { backgroundColor: COLORS.cardLight },
                            pressed && { backgroundColor: COLORS.border },
                          ]}
                          onPress={() => pushScreen('team', { teamId: item.id, teamName: item.name })}
                        >
                          <Text style={[styles.cellText, styles.cellRank]}>{index + 1}</Text>
                          <View style={[styles.cellTeam, { flexDirection: 'row', alignItems: 'center' }]}>
                            <FotmobImage id={item.id} type="team" style={{ width: 16, height: 16, marginRight: 6 }} />
                            <Text style={[styles.cellText, { flex: 1 }]} numberOfLines={1}>{item.name}</Text>
                          </View>
                          <Text style={[styles.cellText, styles.cellNum]}>{played}</Text>
                          <Text style={[styles.cellText, styles.cellNum]}>{item.w}</Text>
                          <Text style={[styles.cellText, styles.cellNum]}>{item.d}</Text>
                          <Text style={[styles.cellText, styles.cellNum]}>{item.l}</Text>
                          <Text style={[styles.cellText, styles.cellNum]}>{gd > 0 ? `+${gd}` : gd}</Text>
                          <Text style={[styles.cellText, styles.cellPts]}>{item.p}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))
            )}
          </View>
        )}


        {/* FIXTURES TAB */}
        {leagueTab === 'fixtures' && (
          <View style={styles.statsSection}>
            {isLoadingFixtures ? (
              <ActivityIndicator size="large" color={COLORS.accentBlue} style={{ marginTop: 40 }} />
            ) : !dynamicFixtures?.rounds || dynamicFixtures.rounds.length === 0 ? (
              <Text style={styles.emptyText}>No fixtures available for this league.</Text>
            ) : (
              dynamicFixtures.rounds.map((roundObj, rIndex) => (
                <View key={rIndex} style={{ marginBottom: 24 }}>
                  <View style={{ backgroundColor: COLORS.cardLight, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, marginBottom: 8 }}>
                    <Text style={{ color: COLORS.text, fontWeight: 'bold' }}>{roundObj.roundName}</Text>
                  </View>
                  {roundObj.matches.map((matchItem, mIndex) => {
                    const homeScore = matchItem.score?.home ?? '-';
                    const awayScore = matchItem.score?.away ?? '-';
                    const scoreStr = matchItem.status?.started ? `${homeScore} - ${awayScore}` : 'vs';
                    return (
                      <Pressable key={matchItem.matchId || mIndex} style={styles.h2hRow} onPress={() => pushScreen('match', { matchId: matchItem.matchId })}>
                        <View style={styles.h2hScoreRow}>
                          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <Text style={[styles.h2hTeamName, { textAlign: 'right', marginRight: 8 }]} numberOfLines={1}>{matchItem.homeTeam?.name || 'Home'}</Text>
                            <FotmobImage id={matchItem.homeTeam?.id} type="team" style={{ width: 16, height: 16 }} />
                          </View>

                          <Text style={[styles.h2hScoreText, { marginHorizontal: 12 }]}>{scoreStr}</Text>

                          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                            <FotmobImage id={matchItem.awayTeam?.id} type="team" style={{ width: 16, height: 16, marginRight: 8 }} />
                            <Text style={[styles.h2hTeamName, { textAlign: 'left' }]} numberOfLines={1}>{matchItem.awayTeam?.name || 'Away'}</Text>
                          </View>
                        </View>
                        <Text style={{ color: COLORS.textMuted, fontSize: 10, textAlign: 'center', marginTop: 4 }}>
                          {matchItem.status?.statusText || 'Scheduled'} {matchItem.date ? ` • ${new Date(matchItem.date).toLocaleDateString()}` : ''}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ))
            )}
          </View>
        )}


        {/* PLAYER STATS TAB */}
        {leagueTab === 'stats' && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionSubTitle}>Top Goalscorers</Text>
            {topGoals.length === 0 ? (
              <Text style={styles.emptyText}>No goalscoring statistics available.</Text>
            ) : (
              topGoals.slice(0, 5).map((p, idx) => (
                <Pressable
                  key={p.id || p.playerId || idx}
                  style={({ pressed }) => [
                    styles.playerStatListItem,
                    pressed && { backgroundColor: COLORS.cardLight }
                  ]}
                  onPress={() => pushScreen && pushScreen('player', { playerId: p.id || p.playerId || p.PlayerId })}
                >
                  <Text style={styles.rankText}>#{idx + 1}</Text>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.pStatName}>{p.name}</Text>
                    <Text style={styles.pStatTeam}>{p.teamName}</Text>
                  </View>
                  <Text style={styles.pStatValue}>{p.goals || 12} Goals</Text>
                </Pressable>
              ))
            )}

            <Text style={[styles.sectionSubTitle, { marginTop: 20 }]}>Top Playmakers (Assists)</Text>
            {topAssists.length === 0 ? (
              <Text style={styles.emptyText}>No assists statistics available.</Text>
            ) : (
              topAssists.slice(0, 5).map((p, idx) => (
                <Pressable
                  key={p.id || p.playerId || idx}
                  style={({ pressed }) => [
                    styles.playerStatListItem,
                    pressed && { backgroundColor: COLORS.cardLight }
                  ]}
                  onPress={() => pushScreen && pushScreen('player', { playerId: p.id || p.playerId || p.PlayerId })}
                >
                  <Text style={styles.rankText}>#{idx + 1}</Text>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.pStatName}>{p.name}</Text>
                    <Text style={styles.pStatTeam}>{p.teamName}</Text>
                  </View>
                  <Text style={styles.pStatValue}>{p.assists || 8} Assists</Text>
                </Pressable>
              ))
            )}

            <Text style={[styles.sectionSubTitle, { marginTop: 20 }]}>Highest Rated Players</Text>
            {topRatings.length === 0 ? (
              <Text style={styles.emptyText}>No ratings statistics available.</Text>
            ) : (
              topRatings.slice(0, 5).map((p, idx) => (
                <Pressable
                  key={p.id || p.playerId || idx}
                  style={({ pressed }) => [
                    styles.playerStatListItem,
                    pressed && { backgroundColor: COLORS.cardLight }
                  ]}
                  onPress={() => pushScreen && pushScreen('player', { playerId: p.id || p.playerId || p.PlayerId })}
                >
                  <Text style={styles.rankText}>#{idx + 1}</Text>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.pStatName}>{p.name}</Text>
                    <Text style={styles.pStatTeam}>{p.teamName}</Text>
                  </View>
                  <Text style={[styles.pStatValue, { color: COLORS.accentGreen }]}>
                    ★ {p.rating ? parseFloat(p.rating).toFixed(2) : '8.10'}
                  </Text>
                </Pressable>
              ))
            )}
          </View>
        )}

        {/* NEWS TAB */}
        {leagueTab === 'news' && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionSubTitle}>League News Feeds</Text>
            {!dynamicData?.Feeds || dynamicData.Feeds.length === 0 ? (
              <Text style={styles.emptyText}>No news feeds available for this league.</Text>
            ) : (
              dynamicData.Feeds.map((feed, index) => (
                <View key={index} style={[styles.newsCard, { padding: 16, flexDirection: 'row', alignItems: 'center' }]}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.accentBlue, justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                    <Text style={{ color: COLORS.bg, fontWeight: 'bold' }}>{feed.Language.toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: 'bold' }}>{feed.Title}</Text>
                    <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>Format: {feed.Format}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* SEASONS TAB */}
        {leagueTab === 'seasons' && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionSubTitle}>Historical Seasons</Text>
            {!dynamicData?.Seasons || dynamicData.Seasons.length === 0 ? (
              <Text style={styles.emptyText}>No historical seasons available.</Text>
            ) : (
              dynamicData.Seasons.map((s, index) => (
                <View key={index} style={[styles.infoCard, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }]}>
                  <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: 'bold' }}>{s.Name}</Text>
                  {s.Start && s.End && (
                    <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>
                      {new Date(parseInt(s.Start.match(/\d+/)[0])).getFullYear()} - {new Date(parseInt(s.End.match(/\d+/)[0])).getFullYear()}
                    </Text>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* TROPHIES TAB */}
        {leagueTab === 'trophies' && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionSubTitle}>League Trophy History</Text>
            {!dynamicData?.Trophies || dynamicData.Trophies.length === 0 ? (
              <Text style={styles.emptyText}>No trophy history available.</Text>
            ) : (
              dynamicData.Trophies.map((t, index) => (
                <View key={index} style={[styles.infoCard, { marginBottom: 12, flexDirection: 'row', alignItems: 'center' }]}>
                  <Text style={{ fontSize: 24, marginRight: 16 }}>{t.Position === 1 ? '🥇' : '🥈'}</Text>
                  <FotmobImage id={t.TeamId} type="team" style={{ width: 32, height: 32, marginRight: 16 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: 'bold' }}>{t.TeamName}</Text>
                    <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>{t.SeasonName}</Text>
                  </View>
                  <View style={{ backgroundColor: t.Position === 1 ? COLORS.gold : '#C0C0C0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                    <Text style={{ color: '#000', fontSize: 10, fontWeight: 'bold' }}>
                      {t.Position === 1 ? 'WINNER' : 'RUNNER-UP'}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* LEAGUE TRANSFERS TAB */}
        {leagueTab === 'transfers' && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionSubTitle}>Recent Transfers in League</Text>
            {leagueTransfers.length === 0 ? (
              <Text style={styles.emptyText}>No transfers on record for this league.</Text>
            ) : (
              leagueTransfers.map((item, idx) => {
                const dateStr = item.transferDate ? new Date(item.transferDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent';
                const fromClubName = item.fromClubFullName || item.fromClub || item.fromTeam || 'Unknown';
                const toClubName = item.toClubFullName || item.toClub || item.toTeam || 'Unknown';
                return (
                  <View key={idx} style={styles.transferCard}>
                    <View style={styles.transferHeader}>
                      <Text style={styles.transferPlayerName}>{item.name} {item.position?.label ? `(${item.position.label})` : ''}</Text>
                      <Text style={styles.transferFee}>{formatFee(item.fee)}</Text>
                    </View>
                    <View style={styles.transferDetailsRow}>
                      <Text style={styles.transferTeamLink}>From: {fromClubName}</Text>
                      <Text style={styles.transferArrow}>→</Text>
                      <Text style={styles.transferTeamLink}>To: {toClubName}</Text>
                    </View>
                    <Text style={styles.transferDate}>{dateStr}</Text>
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
