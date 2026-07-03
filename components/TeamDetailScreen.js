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

export default function TeamDetailScreen({ params, pushScreen }) {
  const { theme: COLORS, styles } = useContext(ThemeContext);
  const { teamId, teamName } = params;
  const [teamTab, setTeamTab] = useState('fixtures'); // 'fixtures', 'squad', 'tournaments', 'trophies'
  const [dynamicTeamData, setDynamicTeamData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadTeamData = async () => {
      setIsLoading(true);
      const data = await api.fetchTeamDetails(teamId);
      if (isMounted) {
        setDynamicTeamData(data);
        setIsLoading(false);
      }
    };
    loadTeamData();
    return () => { isMounted = false; };
  }, [teamId]);

  const teamRoot = dynamicTeamData?.team || {};
  const fixtures = teamRoot.matches?.match || [];
  const squadPlayers = teamRoot.squad?.player || [];
  const tournaments = teamRoot.tournaments?.tournament || [];
  const trophies = teamRoot.trophy?.comp || [];

  const getSquadGroups = (players) => {
    if (!Array.isArray(players)) return [];
    const groups = { keeper: [], defender: [], midfielder: [], forward: [] };
    groups.keeper = [];
    groups.defender = [];
    groups.midfielder = [];
    groups.forward = [];

    players.forEach(p => {
      if (groups[p.positionDesc]) groups[p.positionDesc].push(p);
      else groups.forward.push(p); // fallback
    });
    return [
      { title: 'Goalkeepers', members: groups.keeper },
      { title: 'Defenders', members: groups.defender },
      { title: 'Midfielders', members: groups.midfielder },
      { title: 'Forwards', members: groups.forward }
    ].filter(g => g.members.length > 0);
  };
  const squadGroups = getSquadGroups(squadPlayers);

  return (
    <View style={styles.detailWrapper}>
      {/* Banner */}
      <View style={styles.leagueBanner}>
        <View style={styles.teamBannerAvatar}>
          <FotmobImage id={teamId} type="team" style={{ width: 48, height: 48 }} />
        </View>
        <Text style={styles.largeLeagueName}>{teamName || 'Football Club'}</Text>
        <Text style={styles.largeLeagueCountry}>Official Team Hub</Text>
        {teamRoot.coach && (
          <Text style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 4 }}>Coach: {teamRoot.coach.name}</Text>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.detailTabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['fixtures', 'squad', 'tournaments', 'trophies'].map((tab) => (
            <Pressable key={tab} style={[styles.detailTabItem, teamTab === tab && styles.detailTabItemActive]} onPress={() => setTeamTab(tab)}>
              <Text style={[styles.detailTabLabel, teamTab === tab && styles.detailTabLabelActive, { textTransform: 'capitalize' }]}>{tab}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView style={styles.detailScrollContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.accentBlue} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* FIXTURES TAB */}
            {teamTab === 'fixtures' && (
              <View style={styles.statsSection}>
                <Text style={styles.sectionSubTitle}>Team Fixtures</Text>
                {fixtures.length === 0 ? (
                  <Text style={styles.emptyText}>No fixtures available for this team.</Text>
                ) : (
                  fixtures.map((matchItem, index) => {
                    const homeScore = matchItem.hScore ?? '-';
                    const awayScore = matchItem.aScore ?? '-';
                    const scoreStr = matchItem.status === 'F' ? `${homeScore} - ${awayScore}` : 'vs';
                    return (
                      <Pressable key={matchItem.id || index} style={styles.h2hRow} onPress={() => pushScreen('match', { matchId: matchItem.id })}>
                        <View style={{ backgroundColor: COLORS.cardLight, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4, marginBottom: 8, alignSelf: 'flex-start' }}>
                          <Text style={{ color: COLORS.text, fontSize: 10, fontWeight: 'bold' }}>{matchItem.lname || 'League'}</Text>
                        </View>
                        <View style={styles.h2hScoreRow}>
                          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <Text style={[styles.h2hTeamName, { textAlign: 'right', marginRight: 8 }]} numberOfLines={1}>{matchItem.hTeam || 'Home'}</Text>
                            <FotmobImage id={matchItem.hId} type="team" style={{ width: 16, height: 16 }} />
                          </View>

                          <Text style={[styles.h2hScoreText, { marginHorizontal: 12 }]}>{scoreStr}</Text>

                          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                            <FotmobImage id={matchItem.aId} type="team" style={{ width: 16, height: 16, marginRight: 8 }} />
                            <Text style={[styles.h2hTeamName, { textAlign: 'left' }]} numberOfLines={1}>{matchItem.aTeam || 'Away'}</Text>
                          </View>
                        </View>
                        <Text style={{ color: COLORS.textMuted, fontSize: 10, textAlign: 'center', marginTop: 4 }}>
                          {matchItem.time || 'Scheduled'}
                        </Text>
                      </Pressable>
                    );
                  })
                )}
              </View>
            )}

            {/* SQUAD TAB */}
            {teamTab === 'squad' && (
              <View style={styles.statsSection}>
                {squadGroups.length === 0 ? (
                  <Text style={styles.emptyText}>No squad data available for this team.</Text>
                ) : (
                  squadGroups.map((section, sIdx) => (
                    <View key={sIdx} style={{ marginBottom: 16 }}>
                      <Text style={[styles.sectionSubTitle, { textTransform: 'capitalize', marginBottom: 8 }]}>
                        {section.title}
                      </Text>
                      {section.members?.map((p) => (
                        <Pressable key={p.id} style={styles.playerCardRow} onPress={() => pushScreen('player', { playerId: p.id })}>
                          <View style={styles.playerCardAvatarSmall}>
                            <FotmobImage id={p.id} type="player" style={{ width: 36, height: 36, borderRadius: 18 }} />
                          </View>
                          <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.pStatName}>{p.name}</Text>
                            <Text style={styles.pStatTeam}>
                              {p.cname || 'Player'} {p.shirtNo > 0 ? `• #${p.shirtNo}` : ''}
                            </Text>
                          </View>
                          {p.averageRating !== "0" && (
                            <Text style={[styles.badge, { backgroundColor: COLORS.accentGreen, color: COLORS.bg, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }]}>
                              ★ {p.averageRating}
                            </Text>
                          )}
                        </Pressable>
                      ))}
                    </View>
                  ))
                )}
              </View>
            )}

            {/* TOURNAMENTS TAB */}
            {teamTab === 'tournaments' && (
              <View style={styles.statsSection}>
                <Text style={styles.sectionSubTitle}>Participating Tournaments</Text>
                {tournaments.length === 0 ? (
                  <Text style={styles.emptyText}>No tournaments found.</Text>
                ) : (
                  tournaments.map((t, idx) => (
                    <Pressable key={idx} style={[styles.infoCard, { marginBottom: 12, flexDirection: 'row', alignItems: 'center' }]} onPress={() => pushScreen('league', { league: { id: t.template_id, name: t.name } })}>
                      <FotmobImage id={t.template_id} type="league" style={{ width: 32, height: 32, marginRight: 16 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: 'bold' }}>{t.name}</Text>
                        <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>Season: {t.season}</Text>
                      </View>
                    </Pressable>
                  ))
                )}
              </View>
            )}

            {/* TROPHIES TAB */}
            {teamTab === 'trophies' && (
              <View style={styles.statsSection}>
                <Text style={styles.sectionSubTitle}>Trophy History</Text>
                {trophies.length === 0 ? (
                  <Text style={styles.emptyText}>No trophy history found.</Text>
                ) : (
                  trophies.map((t, idx) => (
                    <View key={idx} style={[styles.infoCard, { marginBottom: 12 }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <FotmobImage id={t.tournamentTemplateId} type="league" style={{ width: 24, height: 24, marginRight: 12 }} />
                        <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: 'bold' }}>{t.name}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: COLORS.cardLight, padding: 8, borderRadius: 6 }}>
                        <View style={{ alignItems: 'center' }}>
                          <Text style={{ color: COLORS.gold, fontWeight: 'bold', fontSize: 16 }}>🥇 {t.won}</Text>
                          <Text style={{ color: COLORS.textMuted, fontSize: 10, marginTop: 2 }}>WON</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                          <Text style={{ color: '#C0C0C0', fontWeight: 'bold', fontSize: 16 }}>🥈 {t.runnerup}</Text>
                          <Text style={{ color: COLORS.textMuted, fontSize: 10, marginTop: 2 }}>RUNNER-UP</Text>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
