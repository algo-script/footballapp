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

export default function PlayerDetailScreen({ params, pushScreen }) {
  const { theme: COLORS, styles } = useContext(ThemeContext);
  const { configData } = useContext(ConfigContext);
  const { playerId } = params;

  const [playerData, setPlayerData] = useState(null);
  const [playerExtraData, setPlayerExtraData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, career, stats, trophies, transfers

  const renderAdCard = (marginTop = 16, marginBottom = 0) => {
    const screenConfig = configData?.player_detail_screen || {};
    const masterEnable = configData?.show_ads?.enable !== false;
    const showAds = masterEnable && screenConfig.enable && Array.isArray(screenConfig.ads) && screenConfig.ads.length > 0;
    if (showAds) {
      const adItem = screenConfig.ads[Math.floor(Math.random() * screenConfig.ads.length)];
      return (
        <View style={{ marginTop, marginBottom }}>
          <AdCard ad={adItem} pushScreen={pushScreen} />
        </View>
      );
    }
    return null;
  };

  useEffect(() => {
    let isMounted = true;
    const loadPlayer = async () => {
      setIsLoading(true);
      const [data, extraData] = await Promise.all([
        api.fetchPlayerDetails(playerId),
        api.fetchPlayerExtraDetails(playerId)
      ]);
      if (isMounted) {
        setPlayerData(data);
        setPlayerExtraData(extraData);
        setIsLoading(false);
      }
    };
    loadPlayer();
    return () => { isMounted = false; };
  }, [playerId]);

  if (isLoading) {
    return (
      <View style={[styles.detailContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.accentGreen} />
      </View>
    );
  }

  if (!playerData) {
    return (
      <View style={[styles.detailContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: COLORS.text }}>Failed to load player details.</Text>
      </View>
    );
  }

  const positionMap = { 0: 'Goalkeeper', 1: 'Defender', 2: 'Midfielder', 3: 'Attacker' };
  const positionStr = positionMap[playerData.Position] || 'Unknown';

  return (
    <View style={styles.detailContainer}>
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[1]}>
        {/* Profile Header */}
        <View style={styles.playerProfileHeader}>
          <View style={{ position: 'relative' }}>
            <FotmobImage type="player" id={playerData.Id} style={styles.largePlayerAvatar} />
            {playerData.EaFcRating && (
              <View style={{ position: 'absolute', bottom: -5, right: -5, backgroundColor: COLORS.gold, borderRadius: 12, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 2, borderColor: COLORS.bg }}>
                <Text style={{ color: COLORS.bg, fontWeight: 'bold', fontSize: 10 }}>{playerData.EaFcRating}</Text>
              </View>
            )}
          </View>
          <Text style={styles.largePlayerName}>{playerData.Name}</Text>
          <Text style={styles.largePlayerTeam}>
            {playerData.Age} yrs • {positionStr} {playerData.ShirtNo > 0 ? `• #${playerData.ShirtNo}` : ''}
          </Text>
        </View>

        {/* Tab Navigator */}
        <View style={{ backgroundColor: COLORS.bg, zIndex: 10 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}>
            {[
              { id: 'overview', actionKey: 'player_tab_overview' },
              { id: 'career', actionKey: 'player_tab_career' },
              { id: 'stats', actionKey: 'player_tab_stats' },
              { id: 'trophies', actionKey: 'player_tab_trophies' },
              { id: 'transfers', actionKey: 'player_tab_transfers' }
            ].map((tab) => (
              <Pressable
                key={tab.id}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: activeTab === tab.id ? COLORS.accentGreen : COLORS.card,
                }}
                onPress={() => {
                  setActiveTab(tab.id);
                  const parentConfig = configData?.player_detail_screen;
                  const actionConfig = parentConfig?.content?.[tab.actionKey];
                  if (actionConfig) handleConfigAction(actionConfig, pushScreen, configData, parentConfig);
                }}
              >
                <Text style={{
                  color: activeTab === tab.id ? COLORS.bg : COLORS.text,
                  fontWeight: 'bold',
                  textTransform: 'capitalize'
                }}>{tab.id}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Tab Content */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 40 }}>
          {renderAdCard(0, 16)}

          {activeTab === 'overview' && (
            <PlayerOverviewTab player={playerData} extraData={playerExtraData} positionStr={positionStr} renderAdCard={renderAdCard} />
          )}
          {activeTab === 'career' && (
            <PlayerCareerTab career={playerExtraData?.career || []} renderAdCard={renderAdCard} />
          )}
          {activeTab === 'stats' && (
            <PlayerStatsTab stats={playerData.Stats || []} renderAdCard={renderAdCard} />
          )}
          {activeTab === 'trophies' && (
            <PlayerTrophiesTab trophies={playerData.Trophies?.PlayerTrophies || []} renderAdCard={renderAdCard} />
          )}
          {activeTab === 'transfers' && (
            <PlayerTransfersTab transfers={playerData.Transfers || []} renderAdCard={renderAdCard} />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function PlayerOverviewTab({ player, extraData, positionStr, renderAdCard }) {
  const { theme: COLORS, styles } = useContext(ThemeContext);
  const traits = player.Traits?.Items || [];

  return (
    <View>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Player Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Position</Text>
          <Text style={styles.infoValue}>{positionStr}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Age</Text>
          <Text style={styles.infoValue}>{player.Age}</Text>
        </View>
        {extraData && extraData.dateOfBirth && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date of Birth</Text>
            <Text style={styles.infoValue}>{new Date(extraData.dateOfBirth).toLocaleDateString()}</Text>
          </View>
        )}
        {extraData && extraData.countryName && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Country</Text>
            <Text style={styles.infoValue}>{extraData.countryName}</Text>
          </View>
        )}
        {extraData && extraData.gender && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Gender</Text>
            <Text style={styles.infoValue}>{extraData.gender.charAt(0).toUpperCase() + extraData.gender.slice(1)}</Text>
          </View>
        )}
      </View>
      {renderAdCard && renderAdCard(16, 0)}

      {traits.length > 0 && (
        <View style={[styles.infoCard, { marginTop: 16 }]}>
          <Text style={styles.infoTitle}>{player.Traits?.PositionSetTitle || 'Traits (Percentile Rank)'}</Text>
          {traits.map((trait, idx) => (
            <View key={idx} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ color: COLORS.text, fontSize: 13 }}>{trait.Title}</Text>
                <Text style={{ color: COLORS.textMuted, fontSize: 13, fontWeight: 'bold' }}>{Math.round(trait.PercentileRank * 100)}%</Text>
              </View>
              <View style={{ height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' }}>
                <View style={{ height: '100%', width: `${Math.round(trait.PercentileRank * 100)}%`, backgroundColor: COLORS.accentBlue, borderRadius: 3 }} />
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function PlayerCareerTab({ career, renderAdCard }) {
  const { theme: COLORS, styles } = useContext(ThemeContext);
  if (career.length === 0) {
    return <Text style={styles.emptyText}>No career history available.</Text>;
  }

  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoTitle}>Career History</Text>
      {career.map((entry, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && idx % 3 === 0 && renderAdCard && renderAdCard(16, 16)}
          <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          borderBottomWidth: idx === career.length - 1 ? 0 : 1,
          borderBottomColor: COLORS.border
        }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <FotmobImage type="team" id={entry.teamId} style={{ width: 32, height: 32, marginRight: 12 }} />
            <View>
              <Text style={{ color: COLORS.text, fontSize: 14, fontWeight: 'bold' }}>{entry.teamName}</Text>
              <Text style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 2 }}>
                {entry.startDate ? new Date(entry.startDate).getFullYear() : '?'} - {entry.endDate ? new Date(entry.endDate).getFullYear() : 'Present'}
                {entry.isYouth ? ' (Youth)' : ''}
              </Text>
            </View>
          </View>
          {entry.active && (
            <View style={{ backgroundColor: COLORS.accentGreen, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
              <Text style={{ color: COLORS.bg, fontSize: 10, fontWeight: 'bold' }}>ACTIVE</Text>
            </View>
          )}
        </View>
      </React.Fragment>
      ))}
    </View>
  );
}

function PlayerStatsTab({ stats, renderAdCard }) {
  const { theme: COLORS, styles } = useContext(ThemeContext);
  if (stats.length === 0) {
    return <Text style={styles.emptyText}>No statistics available.</Text>;
  }

  return (
    <View>
      {stats.map((season, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && idx % 3 === 0 && renderAdCard && renderAdCard(0, 12)}
          <View style={[styles.infoCard, { marginBottom: 12 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {season.TeamId > 0 && <FotmobImage type="team" id={season.TeamId} style={{ width: 20, height: 20 }} />}
              <Text style={{ color: COLORS.text, fontWeight: 'bold' }}>{season.TournamentName || 'Tournament'}</Text>
            </View>
            <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>{season.SeasonName}</Text>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <View style={{ width: '31%', backgroundColor: COLORS.cardLight, padding: 8, borderRadius: 6, alignItems: 'center' }}>
              <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>Matches</Text>
              <Text style={{ color: COLORS.text, fontWeight: 'bold', fontSize: 14 }}>{season.MatchesPlayed}</Text>
            </View>
            <View style={{ width: '31%', backgroundColor: COLORS.cardLight, padding: 8, borderRadius: 6, alignItems: 'center' }}>
              <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>Goals</Text>
              <Text style={{ color: COLORS.text, fontWeight: 'bold', fontSize: 14 }}>{season.GoalsScored}</Text>
            </View>
            <View style={{ width: '31%', backgroundColor: COLORS.cardLight, padding: 8, borderRadius: 6, alignItems: 'center' }}>
              <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>Assists</Text>
              <Text style={{ color: COLORS.text, fontWeight: 'bold', fontSize: 14 }}>{season.Assists}</Text>
            </View>
            <View style={{ width: '31%', backgroundColor: COLORS.cardLight, padding: 8, borderRadius: 6, alignItems: 'center' }}>
              <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>Rating</Text>
              <Text style={{ color: season.AverageRating >= 7 ? COLORS.accentGreen : COLORS.text, fontWeight: 'bold', fontSize: 14 }}>{season.AverageRating > 0 ? season.AverageRating.toFixed(2) : '-'}</Text>
            </View>
            <View style={{ width: '31%', backgroundColor: COLORS.cardLight, padding: 8, borderRadius: 6, alignItems: 'center' }}>
              <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>Mins</Text>
              <Text style={{ color: COLORS.text, fontWeight: 'bold', fontSize: 14 }}>{season.MinutesPlayed}</Text>
            </View>
            <View style={{ width: '31%', backgroundColor: COLORS.cardLight, padding: 8, borderRadius: 6, alignItems: 'center' }}>
              <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>Yellow/Red</Text>
              <Text style={{ color: COLORS.text, fontWeight: 'bold', fontSize: 14 }}>{season.YellowCards}/{season.RedCards}</Text>
            </View>
          </View>
        </View>
        </React.Fragment>
      ))}
    </View>
  );
}

function PlayerTrophiesTab({ trophies, renderAdCard }) {
  const { theme: COLORS, styles } = useContext(ThemeContext);
  if (trophies.length === 0) {
    return <Text style={styles.emptyText}>No trophies available.</Text>;
  }

  return (
    <View>
      {trophies.map((teamTrophy, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && idx % 2 === 0 && renderAdCard && renderAdCard(0, 12)}
          <View style={[styles.infoCard, { marginBottom: 12 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
            <FotmobImage type="team" id={teamTrophy.TeamId} style={{ width: 24, height: 24 }} />
            <Text style={{ color: COLORS.text, fontWeight: 'bold', fontSize: 16 }}>{teamTrophy.TeamName}</Text>
          </View>

          {teamTrophy.Tournaments?.map((tourn, tIdx) => (
            <View key={tIdx} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Text style={{ fontSize: 14 }}>🏆</Text>
                <Text style={{ color: COLORS.accentGreen, fontWeight: 'bold', fontSize: 14 }}>{tourn.CompetitionName}</Text>
              </View>

              {tourn.SeasonsWon?.length > 0 && (
                <Text style={{ color: COLORS.textMuted, fontSize: 12, marginLeft: 22 }}>
                  <Text style={{ color: COLORS.text }}>Winner:</Text> {tourn.SeasonsWon.join(', ')}
                </Text>
              )}
              {tourn.SeasonsRunnerUp?.length > 0 && (
                <Text style={{ color: COLORS.textMuted, fontSize: 12, marginLeft: 22, marginTop: 2 }}>
                  <Text style={{ color: COLORS.text }}>Runner-up:</Text> {tourn.SeasonsRunnerUp.join(', ')}
                </Text>
              )}
            </View>
          ))}
        </View>
        </React.Fragment>
      ))}
    </View>
  );
}

function PlayerTransfersTab({ transfers, renderAdCard }) {
  const { theme: COLORS, styles } = useContext(ThemeContext);
  if (transfers.length === 0) {
    return <Text style={styles.emptyText}>No transfer history available.</Text>;
  }

  return (
    <View style={styles.infoCard}>
      {transfers.map((transfer, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && idx % 3 === 0 && renderAdCard && renderAdCard(16, 16)}
          <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          borderBottomWidth: idx === transfers.length - 1 ? 0 : 1,
          borderBottomColor: COLORS.border
        }}>
          <View style={{ width: 50, alignItems: 'center' }}>
            <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>{transfer.Date.split('-')[0]}</Text>
          </View>

          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <FotmobImage type="team" id={transfer.FromTeamId} style={{ width: 28, height: 28, marginBottom: 4 }} />
              <Text style={{ color: COLORS.text, fontSize: 11, textAlign: 'center' }} numberOfLines={1}>{transfer.FromTeamName}</Text>
            </View>

            <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 4 }}>
              <Text style={{ color: COLORS.accentGreen, fontSize: 16 }}>→</Text>
              <Text style={{ color: COLORS.textMuted, fontSize: 9, textAlign: 'center' }}>
                {transfer.WasFreeTransfer ? 'Free' : (transfer.Amount ? `€${(transfer.Amount / 1000000).toFixed(1)}M` : 'Undisclosed')}
              </Text>
            </View>

            <View style={{ flex: 1, alignItems: 'center' }}>
              <FotmobImage type="team" id={transfer.ToTeamId} style={{ width: 28, height: 28, marginBottom: 4 }} />
              <Text style={{ color: COLORS.text, fontSize: 11, textAlign: 'center' }} numberOfLines={1}>{transfer.ToTeamName}</Text>
            </View>
          </View>
        </View>
        </React.Fragment>
      ))}
    </View>
  );
}
