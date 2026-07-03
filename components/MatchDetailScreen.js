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

export default function MatchDetailScreen({ params, popScreen, pushScreen }) {
  const { theme: COLORS, styles } = useContext(ThemeContext);
  const { matchId } = params;
  const [matchTab, setMatchTab] = useState('facts');
  const [statsPeriod, setStatsPeriod] = useState('full'); // 'full', 'first', 'second'
  const [facts, setFacts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadFacts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.fetchMatchDetails(matchId, false);
        if (isMounted) setFacts(data);
      } catch (err) {
        console.error("Error loading match facts:", err);
        if (isMounted) setError(err.message || "Failed to load match facts");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadFacts();
    return () => { isMounted = false; };
  }, [matchId]);

  const getLocalMatchDateStr = (dateStr) => {
    if (!dateStr) return dateStr;
    const localDate = api.parseCETTimeToLocal(dateStr);
    if (!localDate) return dateStr;
    const d = String(localDate.getDate()).padStart(2, '0');
    const m = String(localDate.getMonth() + 1).padStart(2, '0');
    const y = localDate.getFullYear();
    let hrs = localDate.getHours();
    const mins = String(localDate.getMinutes()).padStart(2, '0');
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    hrs = hrs % 12 || 12;
    const formattedHrs = String(hrs).padStart(2, '0');

    if (dateStr.includes(':')) {
      return `${d}.${m}.${y} ${formattedHrs}:${mins} ${ampm}`;
    }
    return `${d}.${m}.${y}`;
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg }}>
        <ActivityIndicator size="large" color={COLORS.accentGreen} />
      </View>
    );
  }

  if (error || !facts) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg, padding: 24 }}>
        <Text style={{ color: COLORS.textMuted, fontSize: 16, textAlign: 'center', marginBottom: 16 }}>
          {error || "No match facts available for this match."}
        </Text>
        <Pressable onPress={popScreen} style={{ padding: 12, backgroundColor: COLORS.cardLight, borderRadius: 8 }}>
          <Text style={{ color: COLORS.text }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const getPlayerRating = (playerId) => {
    if (!facts?.detailedstats?.PlayerStats) return null;
    const pStats = facts.detailedstats.PlayerStats.find(ps => String(ps.PlayerId) === String(playerId));
    return pStats ? pStats.PlayerRating : null;
  };

  const getH2HStats = () => {
    if (!facts?.h2h || !Array.isArray(facts.h2h)) return null;
    let homeWins = 0;
    let awayWins = 0;
    let draws = 0;

    facts.h2h.forEach(m => {
      const hScore = parseInt(m.homeScore || 0);
      const aScore = parseInt(m.awayScore || 0);
      const isHome = parseInt(m.homeTeam?.id || m.homeTeamId) === parseInt(homeTeamId);

      if (hScore > aScore) {
        if (isHome) homeWins++;
        else awayWins++;
      } else if (hScore < aScore) {
        if (isHome) awayWins++;
        else homeWins++;
      } else {
        draws++;
      }
    });

    const total = homeWins + awayWins + draws;
    return { homeWins, awayWins, draws, total };
  };

  const matchObj = facts?.MATCH || facts?.general || {};
  const homeTeamName = matchObj?.homeTeam?.name || 'Home';
  const awayTeamName = matchObj?.awayTeam?.name || 'Away';
  const homeTeamId = matchObj?.homeTeam?.id;
  const awayTeamId = matchObj?.awayTeam?.id;

  const homeScore = matchObj?.homeScore ?? '-';
  const awayScore = matchObj?.awayScore ?? '-';

  const fifaRankHome = facts?.fifarank?.homeRank || matchObj?.homeTeam?.rank || null;
  const fifaRankAway = facts?.fifarank?.awayRank || matchObj?.awayTeam?.rank || null;

  let statusLabel = 'Scheduled';
  if (matchObj?.status) {
    if (matchObj.status.started && matchObj.status.finished) statusLabel = 'FT';
    else if (matchObj.status.started && !matchObj.status.finished) statusLabel = 'Live';
    else if (matchObj.status.cancelled) statusLabel = 'Cancelled';
  } else if (matchObj?.finished) {
    statusLabel = 'FT';
  } else if (matchObj?.started) {
    statusLabel = 'Live';
  }

  const coaches = facts?.COACH ? {
    home: facts.COACH.homeTeamCoach?.name,
    homeId: facts.COACH.homeTeamCoach?.id,
    away: facts.COACH.awayTeamCoach?.name,
    awayId: facts.COACH.awayTeamCoach?.id
  } : null;

  const getFormMatches = (formArr, teamId) => {
    if (!formArr || !Array.isArray(formArr)) return [];
    return formArr.slice(0, 5).map(m => {
      const isHome = parseInt(m.homeTeam?.id) === parseInt(teamId);
      const hScore = parseInt(m.homeScore || 0);
      const aScore = parseInt(m.awayScore || 0);
      let result = 'D';
      if (hScore > aScore) result = isHome ? 'W' : 'L';
      else if (hScore < aScore) result = isHome ? 'L' : 'W';
      return { ...m, result };
    });
  };
  const homeFormMatches = getFormMatches(facts?.form_ht, homeTeamId);
  const awayFormMatches = getFormMatches(facts?.form_at, awayTeamId);

  let homeTopPlayers = [];
  let awayTopPlayers = [];
  if (facts?.detailedstats?.PlayerStats) {
    const homePlayers = facts.detailedstats.PlayerStats.filter(p => p.PlaysOnHomeTeam).sort((a, b) => (b.PlayerRating || 0) - (a.PlayerRating || 0));
    const awayPlayers = facts.detailedstats.PlayerStats.filter(p => !p.PlaysOnHomeTeam).sort((a, b) => (b.PlayerRating || 0) - (a.PlayerRating || 0));
    homeTopPlayers = homePlayers.slice(0, 3);
    awayTopPlayers = awayPlayers.slice(0, 3);
  }

  return (
    <View style={styles.detailWrapper}>
      {/* Banner */}
      <View style={[styles.matchDetailBanner, { paddingVertical: 32 }]}>
        {/* Home Team */}
        <View style={styles.detailBannerTeam}>
          <FotmobImage id={homeTeamId} type="team" style={{ width: 56, height: 56 }} />
          <Text style={styles.detailTeamName} numberOfLines={2}>{homeTeamName}</Text>
          {fifaRankHome && (
            <Text style={{ color: COLORS.textMuted, fontSize: 10, marginTop: 4 }}>Rank: #{fifaRankHome}</Text>
          )}
        </View>

        {/* Score & Status */}
        <View style={styles.detailBannerScore}>
          <Text style={{ color: COLORS.textMuted, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', marginBottom: 6, letterSpacing: 0.5 }}>
            {matchObj?.leagueName || facts?.league?.name || 'Match Details'}
          </Text>
          <Text style={styles.detailScoreText}>{homeScore} - {awayScore}</Text>
          <View style={styles.matchStatusLabel}>
            <Text style={{ color: COLORS.textMuted, fontSize: 11, fontWeight: 'bold' }}>{statusLabel}</Text>
          </View>
        </View>

        {/* Away Team */}
        <View style={styles.detailBannerTeam}>
          <FotmobImage id={awayTeamId} type="team" style={{ width: 56, height: 56 }} />
          <Text style={styles.detailTeamName} numberOfLines={2}>{awayTeamName}</Text>
          {fifaRankAway && (
            <Text style={{ color: COLORS.textMuted, fontSize: 10, marginTop: 4 }}>Rank: #{fifaRankAway}</Text>
          )}
        </View>
      </View>

      {/* Match Nav Tabs */}
      <View style={{ borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 8 }}>
          {['facts', 'lineup', 'stats', 'h2h'].map(tab => (
            <Pressable key={tab} style={[styles.detailTabItem, matchTab === tab && styles.detailTabItemActive]} onPress={() => setMatchTab(tab)}>
              <Text style={[styles.detailTabLabel, matchTab === tab && styles.detailTabLabelActive]}>{tab.toUpperCase()}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView style={styles.detailScrollContent} showsVerticalScrollIndicator={false}>
        {/* FACTS TAB */}
        {matchTab === 'facts' && (
          <View style={styles.statsSection}>
            {/* Timeline */}
            {(() => {
              const isPlayerHome = (pName) => {
                if (!facts?.detailedstats?.PlayerStats) return true;
                const p = facts.detailedstats.PlayerStats.find(x => x.PlayerName === pName || x.PlayerId?.toString() === pName);
                return p ? p.PlaysOnHomeTeam : (facts?.LINEUP?.find(l => l.playerDisplayName === pName)?.teamId == homeTeamId);
              };

              let tlEvents = [];
              if (facts?.GD) {
                const gdGoals = facts.GD.filter(e => e.value5 === 7 || e.value5 === 8 || e.value5 === 9);
                const gdAssists = facts.GD.filter(e => e.value5 === 34);
                const gdYellow = facts.GD.filter(e => e.value5 === 14);
                const gdRed = facts.GD.filter(e => e.value5 === 16 || e.value5 === 15);

                gdGoals.forEach(g => {
                  const ast = gdAssists.find(a => a.minute === g.minute);
                  const pName = g.playerDisplayName || g.playerName;

                  let goalTypeLabel = "";
                  if (g.value5 === 8) goalTypeLabel = " (OG)";
                  else if (g.value5 === 9) goalTypeLabel = " (Pen)";

                  tlEvents.push({
                    minute: parseInt(g.minute),
                    type: 'goal',
                    playerName: pName + goalTypeLabel,
                    assistName: ast ? (ast.playerDisplayName || ast.playerName) : null,
                    playerId: g.playerId,
                    isHome: isPlayerHome(pName)
                  });
                });

                gdYellow.forEach(c => {
                  const pName = c.playerDisplayName || c.playerName;
                  tlEvents.push({
                    minute: parseInt(c.minute),
                    type: 'yellow',
                    playerName: pName,
                    playerId: c.playerId,
                    isHome: isPlayerHome(pName)
                  });
                });

                gdRed.forEach(c => {
                  const pName = c.playerDisplayName || c.playerName;
                  tlEvents.push({
                    minute: parseInt(c.minute),
                    type: 'red',
                    playerName: pName,
                    playerId: c.playerId,
                    isHome: isPlayerHome(pName)
                  });
                });
              }

              if (facts?.SUBST) {
                facts.SUBST.forEach(s => {
                  const pInName = s.playerInName;
                  const pInId = s.playerOutName;
                  const pOutName = s.playerInId;
                  const pOutId = s.playerOutId;

                  tlEvents.push({
                    minute: parseInt(s.minute),
                    type: 'sub',
                    playerName: pInName,
                    playerId: pInId,
                    subOutName: pOutName,
                    subOutId: pOutId,
                    isHome: isPlayerHome(pInName)
                  });
                });
              }

              tlEvents.sort((a, b) => a.minute - b.minute);

              if (tlEvents.length === 0) return null;

              return (
                <View style={styles.infoCard}>
                  <Text style={[styles.sectionSubTitle, { marginBottom: 12 }]}>Timeline</Text>

                  <View style={{ position: 'relative', marginVertical: 8 }}>
                    <View style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 2, backgroundColor: COLORS.border, marginLeft: -1 }} />

                    {tlEvents.map((event, idx) => (
                      <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, minHeight: 44 }}>
                        {/* Home Side */}
                        <View style={{ flex: 1, paddingRight: 12, alignItems: 'flex-end', justifyContent: 'center' }}>
                          {event.isHome && (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <Text style={{ fontSize: 16, marginRight: 8 }}>
                                {event.type === 'goal' ? '⚽' : event.type === 'red' ? '🟥' : event.type === 'yellow' ? '🟨' : '🔄'}
                              </Text>

                              {event.type === 'sub' ? (
                                <View style={{ alignItems: 'flex-end' }}>
                                  <Text style={{ color: COLORS.accentGreen, fontSize: 11, fontWeight: 'bold' }}>▲ {event.playerName}</Text>
                                  <Text style={{ color: COLORS.textMuted, fontSize: 9, marginTop: 1 }}>▼ {event.subOutName}</Text>
                                </View>
                              ) : (
                                <View style={{ alignItems: 'flex-end' }}>
                                  <Text style={{ color: COLORS.text, fontSize: 11, fontWeight: 'bold' }}>{event.playerName}</Text>
                                  {event.assistName && <Text style={{ color: COLORS.textMuted, fontSize: 9, marginTop: 1 }}>Ast: {event.assistName}</Text>}
                                </View>
                              )}
                            </View>
                          )}
                        </View>

                        {/* Center Circle */}
                        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.bg, borderWidth: 1.5, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
                          <Text style={{ color: COLORS.text, fontSize: 10, fontWeight: 'bold' }}>{event.minute}'</Text>
                        </View>

                        {/* Away Side */}
                        <View style={{ flex: 1, paddingLeft: 12, alignItems: 'flex-start', justifyContent: 'center' }}>
                          {!event.isHome && (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              {event.type === 'sub' ? (
                                <View style={{ alignItems: 'flex-start' }}>
                                  <Text style={{ color: COLORS.accentGreen, fontSize: 11, fontWeight: 'bold' }}>▲ {event.playerName}</Text>
                                  <Text style={{ color: COLORS.textMuted, fontSize: 9, marginTop: 1 }}>▼ {event.subOutName}</Text>
                                </View>
                              ) : (
                                <View style={{ alignItems: 'flex-start' }}>
                                  <Text style={{ color: COLORS.text, fontSize: 11, fontWeight: 'bold' }}>{event.playerName}</Text>
                                  {event.assistName && <Text style={{ color: COLORS.textMuted, fontSize: 9, marginTop: 1 }}>Ast: {event.assistName}</Text>}
                                </View>
                              )}

                              <Text style={{ fontSize: 16, marginLeft: 8 }}>
                                {event.type === 'goal' ? '⚽' : event.type === 'red' ? '🟥' : event.type === 'yellow' ? '🟨' : '🔄'}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })()}

            {/* Match Information */}
            <View style={[styles.infoCard, { marginTop: 16 }]}>
              <Text style={styles.sectionSubTitle}>Match Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tournament</Text>
                <Text style={styles.infoValue}>{facts?.ln || matchObj?.leagueName || facts?.league?.name || 'N/A'}</Text>
              </View>
              {matchObj?.date && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Date</Text>
                  <Text style={styles.infoValue}>{getLocalMatchDateStr(matchObj.date)}</Text>
                </View>
              )}
              {(facts?.vn || matchObj?.stadium) && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Venue</Text>
                  <Text style={styles.infoValue}>{facts?.vn || matchObj.stadium}</Text>
                </View>
              )}
              {matchObj?.referee?.name && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Referee</Text>
                  <Text style={styles.infoValue}>{matchObj.referee.name}</Text>
                </View>
              )}
            </View>

            {/* Teams Form */}
            {(homeFormMatches.length > 0 || awayFormMatches.length > 0) && (
              <View style={[styles.infoCard, { marginTop: 16 }]}>
                <Text style={[styles.sectionSubTitle, { marginBottom: 12 }]}>Team Form</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  {/* Home Form */}
                  <View style={{ flex: 1, paddingRight: 4 }}>
                    {homeFormMatches.map((m, i) => (
                      <Pressable
                        key={m.matchId || m.id || i}
                        style={({ pressed }) => [
                          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8, paddingVertical: 4, borderRadius: 6 },
                          pressed && { backgroundColor: COLORS.cardLight }
                        ]}
                        onPress={() => pushScreen && pushScreen('match', { matchId: m.matchId || m.id })}
                      >
                        <FotmobImage id={m.homeTeam?.id} type="team" style={{ width: 24, height: 24 }} />
                        <View style={{ backgroundColor: m.result === 'W' ? COLORS.accentGreen : m.result === 'L' ? COLORS.accentRed : COLORS.textMuted, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginHorizontal: 8, minWidth: 44, alignItems: 'center' }}>
                          <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{m.homeScore} - {m.awayScore}</Text>
                        </View>
                        <FotmobImage id={m.awayTeam?.id} type="team" style={{ width: 24, height: 24 }} />
                      </Pressable>
                    ))}
                  </View>

                  <View style={{ width: 1, backgroundColor: COLORS.border }} />

                  {/* Away Form */}
                  <View style={{ flex: 1, paddingLeft: 4 }}>
                    {awayFormMatches.map((m, i) => (
                      <Pressable
                        key={m.matchId || m.id || i}
                        style={({ pressed }) => [
                          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8, paddingVertical: 4, borderRadius: 6 },
                          pressed && { backgroundColor: COLORS.cardLight }
                        ]}
                        onPress={() => pushScreen && pushScreen('match', { matchId: m.matchId || m.id })}
                      >
                        <FotmobImage id={m.homeTeam?.id} type="team" style={{ width: 24, height: 24 }} />
                        <View style={{ backgroundColor: m.result === 'W' ? COLORS.accentGreen : m.result === 'L' ? COLORS.accentRed : COLORS.textMuted, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginHorizontal: 8, minWidth: 44, alignItems: 'center' }}>
                          <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{m.homeScore} - {m.awayScore}</Text>
                        </View>
                        <FotmobImage id={m.awayTeam?.id} type="team" style={{ width: 24, height: 24 }} />
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* Coaches / Managers */}
            {coaches && (coaches.home || coaches.away) && (
              <View style={[styles.infoCard, { marginTop: 16 }]}>
                <Text style={[styles.sectionSubTitle, { marginBottom: 12 }]}>Managers</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <FotmobImage id={coaches.homeId} type="coach" style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#333' }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: COLORS.text, fontWeight: 'bold', fontSize: 14 }}>{coaches.home || 'N/A'}</Text>
                      <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>{homeTeamName}</Text>
                    </View>
                  </View>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <View style={{ flex: 1, alignItems: 'flex-end', marginRight: 12 }}>
                      <Text style={{ color: COLORS.text, fontWeight: 'bold', fontSize: 14 }}>{coaches.away || 'N/A'}</Text>
                      <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>{awayTeamName}</Text>
                    </View>
                    <FotmobImage id={coaches.awayId} type="coach" style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#333' }} />
                  </View>
                </View>
              </View>
            )}

            {/* Top Rating Players */}
            {(homeTopPlayers.length > 0 || awayTopPlayers.length > 0) && (
              <View style={[styles.infoCard, { marginTop: 16 }]}>
                <Text style={[styles.sectionSubTitle, { marginBottom: 12 }]}>Top Rated Players</Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    {homeTopPlayers.map((p, idx) => (
                      <Pressable
                        key={p.PlayerId || idx}
                        style={({ pressed }) => [
                          { flexDirection: 'row', alignItems: 'center', marginBottom: 10, paddingVertical: 4, borderRadius: 6 },
                          pressed && { backgroundColor: COLORS.cardLight }
                        ]}
                        onPress={() => pushScreen && pushScreen('player', { playerId: p.PlayerId })}
                      >
                        <FotmobImage id={p.PlayerId} type="player" style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8, backgroundColor: '#333' }} />
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: COLORS.text, fontSize: 13, fontWeight: '500' }} numberOfLines={1}>{p.PlayerName}</Text>
                        </View>
                        <View style={{ backgroundColor: COLORS.accentGreen, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>{p.PlayerRating?.toFixed(1) || '-'}</Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                  <View style={{ width: 1, backgroundColor: COLORS.border, marginHorizontal: 4 }} />
                  <View style={{ flex: 1, paddingLeft: 8 }}>
                    {awayTopPlayers.map((p, idx) => (
                      <Pressable
                        key={p.PlayerId || idx}
                        style={({ pressed }) => [
                          { flexDirection: 'row', alignItems: 'center', marginBottom: 10, paddingVertical: 4, borderRadius: 6 },
                          pressed && { backgroundColor: COLORS.cardLight }
                        ]}
                        onPress={() => pushScreen && pushScreen('player', { playerId: p.PlayerId })}
                      >
                        <View style={{ backgroundColor: COLORS.accentGreen, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>{p.PlayerRating?.toFixed(1) || '-'}</Text>
                        </View>
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                          <Text style={{ color: COLORS.text, fontSize: 13, fontWeight: '500' }} numberOfLines={1}>{p.PlayerName}</Text>
                        </View>
                        <FotmobImage id={p.PlayerId} type="player" style={{ width: 32, height: 32, borderRadius: 16, marginLeft: 8, backgroundColor: '#333' }} />
                        <View style={{ width: 20, textAlign: 'right', fontSize: 12 }} />
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* STATS TAB */}
        {matchTab === 'stats' && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionSubTitle}>Match Statistics</Text>

            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 16 }}>
              {['first', 'second', 'full'].map(period => (
                <Pressable key={period} onPress={() => setStatsPeriod(period)} style={{
                  paddingHorizontal: 16, paddingVertical: 8, marginHorizontal: 4, borderRadius: 20,
                  backgroundColor: statsPeriod === period ? COLORS.accentGreen : COLORS.cardLight
                }}>
                  <Text style={{ color: statsPeriod === period ? '#fff' : COLORS.text, fontSize: 12, fontWeight: 'bold' }}>
                    {period === 'first' ? '1ST HALF' : period === 'second' ? '2ND HALF' : 'FULL TIME'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.infoCard}>
              {facts?.period_stats?.HomeTeamPeriodStats ? (
                ['Possession', 'TotalPasses', 'ShotsOnTarget', 'ShotsOffTarget', 'Corners', 'TotalCrosses', 'Fouls', 'YellowCards', 'RedCards', 'Offsides'].map((statKey) => {
                  let homeVal = 0, awayVal = 0;
                  if (statsPeriod === 'full') {
                    homeVal = (facts.period_stats.HomeTeamPeriodStats.FirstHalf?.[statKey] || 0) + (facts.period_stats.HomeTeamPeriodStats.SecondHalf?.[statKey] || 0);
                    awayVal = (facts.period_stats.AwayTeamPeriodStats.FirstHalf?.[statKey] || 0) + (facts.period_stats.AwayTeamPeriodStats.SecondHalf?.[statKey] || 0);
                  } else if (statsPeriod === 'first') {
                    homeVal = facts.period_stats.HomeTeamPeriodStats.FirstHalf?.[statKey] || 0;
                    awayVal = facts.period_stats.AwayTeamPeriodStats.FirstHalf?.[statKey] || 0;
                  } else if (statsPeriod === 'second') {
                    homeVal = facts.period_stats.HomeTeamPeriodStats.SecondHalf?.[statKey] || 0;
                    awayVal = facts.period_stats.AwayTeamPeriodStats.SecondHalf?.[statKey] || 0;
                  }

                  if (homeVal === 0 && awayVal === 0) return null;
                  return (
                    <View key={statKey} style={{ marginBottom: 16 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                        <Text style={{ color: COLORS.text, fontWeight: 'bold' }}>{homeVal}</Text>
                        <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>{statKey.replace(/([A-Z])/g, ' $1').trim()}</Text>
                        <Text style={{ color: COLORS.text, fontWeight: 'bold' }}>{awayVal}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                        <View style={{ flex: homeVal, backgroundColor: COLORS.accentGreen }} />
                        <View style={{ flex: awayVal, backgroundColor: '#444' }} />
                      </View>
                    </View>
                  )
                })
              ) : (
                <Text style={styles.emptyText}>Statistics will appear here during/after the match.</Text>
              )}
            </View>
          </View>
        )}

        {/* LINEUPS TAB */}
        {matchTab === 'lineup' && (
          <View style={styles.statsSection}>
            {facts?.LINEUP && facts.LINEUP.length > 0 ? (
              <>
                <Text style={styles.sectionSubTitle}>Starting Lineup</Text>
                <View style={[styles.infoCard, { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }]}>
                  <View style={{ flex: 1, paddingRight: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                      <FotmobImage id={homeTeamId} type="team" style={{ width: 24, height: 24, marginRight: 8 }} />
                      <Text style={{ color: COLORS.text, fontWeight: 'bold', flex: 1 }} numberOfLines={1}>{homeTeamName}</Text>
                    </View>
                    {facts.LINEUP.filter(p => parseInt(p.teamId) === parseInt(homeTeamId) && p.positionId !== 0).map((p, idx) => {
                      const rating = getPlayerRating(p.playerId);
                      return (
                        <Pressable
                          key={p.playerId || idx}
                          style={({ pressed }) => [
                            { flexDirection: 'row', alignItems: 'center', marginBottom: 10, paddingVertical: 4, borderRadius: 6 },
                            pressed && { backgroundColor: COLORS.cardLight }
                          ]}
                          onPress={() => pushScreen && pushScreen('player', { playerId: p.playerId })}
                        >
                          <Text style={{ color: COLORS.textMuted, width: 20, fontSize: 12 }}>{p.shirtNr}</Text>
                          <FotmobImage id={p.playerId} type="player" style={{ width: 24, height: 24, borderRadius: 12, marginRight: 8, backgroundColor: '#333' }} />
                          <Text style={{ color: COLORS.text, flex: 1, fontSize: 13 }} numberOfLines={1}>{p.playerDisplayName || p.name}</Text>
                          {rating !== null && rating !== undefined && rating > 0 && (
                            <View style={{ backgroundColor: COLORS.accentGreen, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3, marginLeft: 4 }}>
                              <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{rating.toFixed(1)}</Text>
                            </View>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                  <View style={{ width: 1, backgroundColor: COLORS.border, marginHorizontal: 4 }} />
                  <View style={{ flex: 1, paddingLeft: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, justifyContent: 'flex-end' }}>
                      <Text style={{ color: COLORS.text, fontWeight: 'bold', flex: 1, textAlign: 'right' }} numberOfLines={1}>{awayTeamName}</Text>
                      <FotmobImage id={awayTeamId} type="team" style={{ width: 24, height: 24, marginLeft: 8 }} />
                    </View>
                    {facts.LINEUP.filter(p => parseInt(p.teamId) === parseInt(awayTeamId) && p.positionId !== 0).map((p, idx) => {
                      const rating = getPlayerRating(p.playerId);
                      return (
                        <Pressable
                          key={p.playerId || idx}
                          style={({ pressed }) => [
                            { flexDirection: 'row', alignItems: 'center', marginBottom: 10, justifyContent: 'flex-end', paddingVertical: 4, borderRadius: 6 },
                            pressed && { backgroundColor: COLORS.cardLight }
                          ]}
                          onPress={() => pushScreen && pushScreen('player', { playerId: p.playerId })}
                        >
                          {rating !== null && rating !== undefined && rating > 0 && (
                            <View style={{ backgroundColor: COLORS.accentGreen, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3, marginRight: 4 }}>
                              <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{rating.toFixed(1)}</Text>
                            </View>
                          )}
                          <Text style={{ color: COLORS.text, flex: 1, textAlign: 'right', fontSize: 13 }} numberOfLines={1}>{p.playerDisplayName || p.name}</Text>
                          <FotmobImage id={p.playerId} type="player" style={{ width: 24, height: 24, borderRadius: 12, marginLeft: 8, backgroundColor: '#333' }} />
                          <Text style={{ color: COLORS.textMuted, width: 20, textAlign: 'right', fontSize: 12 }}>{p.shirtNr}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <Text style={styles.sectionSubTitle}>Substitutes</Text>
                <View style={[styles.infoCard, { flexDirection: 'row', justifyContent: 'space-between' }]}>
                  <View style={{ flex: 1, paddingRight: 4 }}>
                    {facts.LINEUP.filter(p => parseInt(p.teamId) === parseInt(homeTeamId) && p.positionId === 0).map((p, idx) => {
                      const rating = getPlayerRating(p.playerId);
                      return (
                        <Pressable
                          key={p.playerId || idx}
                          style={({ pressed }) => [
                            { flexDirection: 'row', alignItems: 'center', marginBottom: 10, paddingVertical: 4, borderRadius: 6 },
                            pressed && { backgroundColor: COLORS.cardLight }
                          ]}
                          onPress={() => pushScreen && pushScreen('player', { playerId: p.playerId })}
                        >
                          <Text style={{ color: COLORS.textMuted, width: 20, fontSize: 12 }}>{p.shirtNr}</Text>
                          <FotmobImage id={p.playerId} type="player" style={{ width: 24, height: 24, borderRadius: 12, marginRight: 8, backgroundColor: '#333' }} />
                          <Text style={{ color: COLORS.text, flex: 1, fontSize: 13 }} numberOfLines={1}>{p.playerDisplayName || p.name}</Text>
                          {rating !== null && rating !== undefined && rating > 0 && (
                            <View style={{ backgroundColor: COLORS.accentGreen, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3, marginLeft: 4 }}>
                              <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{rating.toFixed(1)}</Text>
                            </View>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                  <View style={{ width: 1, backgroundColor: COLORS.border, marginHorizontal: 4 }} />
                  <View style={{ flex: 1, paddingLeft: 4 }}>
                    {facts.LINEUP.filter(p => parseInt(p.teamId) === parseInt(awayTeamId) && p.positionId === 0).map((p, idx) => {
                      const rating = getPlayerRating(p.playerId);
                      return (
                        <Pressable
                          key={p.playerId || idx}
                          style={({ pressed }) => [
                            { flexDirection: 'row', alignItems: 'center', marginBottom: 10, justifyContent: 'flex-end', paddingVertical: 4, borderRadius: 6 },
                            pressed && { backgroundColor: COLORS.cardLight }
                          ]}
                          onPress={() => pushScreen && pushScreen('player', { playerId: p.playerId })}
                        >
                          {rating !== null && rating !== undefined && rating > 0 && (
                            <View style={{ backgroundColor: COLORS.accentGreen, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3, marginRight: 4 }}>
                              <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{rating.toFixed(1)}</Text>
                            </View>
                          )}
                          <Text style={{ color: COLORS.text, flex: 1, textAlign: 'right', fontSize: 13 }} numberOfLines={1}>{p.playerDisplayName || p.name}</Text>
                          <FotmobImage id={p.playerId} type="player" style={{ width: 24, height: 24, borderRadius: 12, marginLeft: 8, backgroundColor: '#333' }} />
                          <Text style={{ color: COLORS.textMuted, width: 20, textAlign: 'right', fontSize: 12 }}>{p.shirtNr}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.infoCard}>
                <Text style={styles.emptyText}>Lineups are usually announced 1 hour before kick-off.</Text>
              </View>
            )}
          </View>
        )}

        {/* H2H TAB */}
        {matchTab === 'h2h' && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionSubTitle}>Head to Head Summary</Text>
            {(() => {
              const h2h = getH2HStats();
              if (!h2h || h2h.total === 0) {
                return (
                  <View style={styles.infoCard}>
                    <Text style={styles.emptyText}>No recent Head to Head statistics found.</Text>
                  </View>
                );
              }
              return (
                <View style={[styles.infoCard, { marginBottom: 16 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <View style={{ flex: 1, alignItems: 'flex-start' }}>
                      <Text style={{ color: COLORS.text, fontWeight: 'bold', fontSize: 13 }} numberOfLines={1}>{homeTeamName}</Text>
                      <Text style={{ color: COLORS.accentGreen, fontSize: 18, fontWeight: 'bold', marginTop: 2 }}>{h2h.homeWins} Wins</Text>
                    </View>
                    <View style={{ flex: 0.6, alignItems: 'center' }}>
                      <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>Draws</Text>
                      <Text style={{ color: COLORS.textMuted, fontSize: 18, fontWeight: 'bold', marginTop: 2 }}>{h2h.draws}</Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Text style={{ color: COLORS.text, fontWeight: 'bold', fontSize: 13 }} numberOfLines={1}>{awayTeamName}</Text>
                      <Text style={{ color: COLORS.accentBlue, fontSize: 18, fontWeight: 'bold', marginTop: 2 }}>{h2h.awayWins} Wins</Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', backgroundColor: COLORS.border, marginVertical: 4 }}>
                    <View style={{ flex: h2h.homeWins || 1, backgroundColor: h2h.homeWins > 0 ? COLORS.accentGreen : COLORS.border }} />
                    <View style={{ flex: h2h.draws || 1, backgroundColor: h2h.draws > 0 ? COLORS.textMuted : COLORS.border }} />
                    <View style={{ flex: h2h.awayWins || 1, backgroundColor: h2h.awayWins > 0 ? COLORS.accentBlue : COLORS.border }} />
                  </View>

                  <Text style={{ color: COLORS.textMuted, fontSize: 11, textAlign: 'center', marginTop: 8 }}>Total Head to Head Matches: {h2h.total}</Text>
                </View>
              );
            })()}

            <Text style={styles.sectionSubTitle}>Recent Matches</Text>
            {facts?.h2h && facts.h2h.length > 0 ? (
              facts.h2h.map((matchItem, idx) => {
                const hScore = parseInt(matchItem.homeScore || 0);
                const aScore = parseInt(matchItem.awayScore || 0);
                const isHomeWin = hScore > aScore;
                const isAwayWin = aScore > hScore;
                const isDraw = hScore === aScore;

                return (
                  <Pressable
                    key={matchItem.id || matchItem.matchId || idx}
                    style={({ pressed }) => [
                      styles.infoCard,
                      { marginBottom: 12, paddingVertical: 12, paddingHorizontal: 12 },
                      pressed && { opacity: 0.9, backgroundColor: COLORS.cardLight }
                    ]}
                    onPress={() => pushScreen && pushScreen('match', { matchId: matchItem.id || matchItem.matchId })}
                  >
                    <View style={{ alignItems: 'center', marginBottom: 12 }}>
                      <Text style={{ color: COLORS.textMuted, fontSize: 11, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {getLocalMatchDateStr(matchItem.date) || matchItem.season}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <Text
                          style={{
                            color: isHomeWin || isDraw ? COLORS.text : COLORS.textMuted,
                            marginRight: 8,
                            fontSize: 13,
                            fontWeight: isHomeWin ? 'bold' : 'normal',
                            textAlign: 'right',
                            flexShrink: 1
                          }}
                          numberOfLines={2}
                        >
                          {matchItem.homeTeam?.name || matchItem.homeTeamName || (parseInt(matchItem.homeTeam?.id || matchItem.homeTeamId) === parseInt(homeTeamId) ? homeTeamName : (parseInt(matchItem.homeTeam?.id || matchItem.homeTeamId) === parseInt(awayTeamId) ? awayTeamName : 'Home'))}
                        </Text>
                        <FotmobImage id={matchItem.homeTeam?.id || matchItem.homeTeamId} type="team" style={{ width: 24, height: 24 }} />
                      </View>

                      <View style={{ width: 64, alignItems: 'center', justifyContent: 'center', marginHorizontal: 8 }}>
                        <View style={{ backgroundColor: COLORS.bg, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: COLORS.border, width: '100%', alignItems: 'center' }}>
                          <Text style={{ color: COLORS.text, fontWeight: 'bold', fontSize: 14 }}>
                            {matchItem.homeScore} - {matchItem.awayScore}
                          </Text>
                        </View>
                      </View>

                      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                        <FotmobImage id={matchItem.awayTeam?.id || matchItem.awayTeamId} type="team" style={{ width: 24, height: 24, marginRight: 8 }} />
                        <Text
                          style={{
                            color: isAwayWin || isDraw ? COLORS.text : COLORS.textMuted,
                            fontSize: 13,
                            fontWeight: isAwayWin ? 'bold' : 'normal',
                            textAlign: 'left',
                            flexShrink: 1
                          }}
                          numberOfLines={2}
                        >
                          {matchItem.awayTeam?.name || matchItem.awayTeamName || (parseInt(matchItem.awayTeam?.id || matchItem.awayTeamId) === parseInt(homeTeamId) ? homeTeamName : (parseInt(matchItem.awayTeam?.id || matchItem.awayTeamId) === parseInt(awayTeamId) ? awayTeamName : 'Away'))}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })
            ) : (
              <View style={styles.infoCard}>
                <Text style={styles.emptyText}>No recent Head to Head matches found.</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
