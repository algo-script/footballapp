import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
  Platform
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { ConfigContext } from '../context/ConfigContext';
import FotmobImage from './FotmobImage';
import AdCard from './AdCard';
import { handleConfigAction } from '../utils/adAction';

const api = require('../apis.js');

const formatDateToKey = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const formatDateToDisplay = (date, isToday) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const dayNum = date.getDate();
  if (isToday) {
    return `Today (${monthName} ${dayNum})`;
  }
  return `${dayName}, ${monthName} ${dayNum}`;
};

const formatDateToHeader = (date) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

const formatDateToDDMMYYYY = (date) => {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
};

export default function MatchesTab({ isMockMode, onSelectMatch, pushScreen }) {
  const { theme: COLORS, styles } = useContext(ThemeContext);
  const { configData } = useContext(ConfigContext);
  const [matchDate, setMatchDate] = useState(() => {
    const today = new Date();
    return formatDateToKey(today);
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const [responseData, setResponseData] = useState([]);
  const [liveRanks, setLiveRanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const today = new Date();
  const dateList = [];
  for (let i = -2; i <= 2; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);
    dateList.push({
      key: formatDateToKey(d),
      label: formatDateToDisplay(d, i === 0),
      headerLabel: formatDateToHeader(d),
      dateObject: d,
    });
  }

  const customDateSelected = !dateList.some((d) => d.key === matchDate);
  if (customDateSelected) {
    const [yyyy, mm, dd] = matchDate.split('-').map(Number);
    const d = new Date(yyyy, mm - 1, dd);
    dateList.push({
      key: matchDate,
      label: formatDateToDisplay(d, false),
      headerLabel: formatDateToHeader(d),
      dateObject: d,
    });
  }

  const selectedDateObj = dateList.find((d) => d.key === matchDate);

  useEffect(() => {
    let isMounted = true;

    const fetchMatches = async (isBackground = false) => {
      if (!isBackground) {
        setLoading(true);
      }
      try {
        const [parsed, rankData] = await Promise.all([
          api.fetchMatchesByDate(matchDate, isMockMode),
          api.fetchLiveRankLeagues()
        ]);
        if (isMounted) {
          setResponseData(parsed);
          if (rankData && rankData.rankedLeaguesForLive) {
            setLiveRanks(rankData.rankedLeaguesForLive);
          }
          setLoading(false);
          setError(null);
        }
      } catch (err) {
        console.error("API Fetch Error:", err);
        if (isMounted) {
          setError(err.message || "Failed to fetch matches data");
          setLoading(false);
          if (!isBackground) {
            setResponseData([]);
            setLiveRanks([]);
          }
        }
      }
    };

    fetchMatches(false);

    let intervalId = null;
    const todayKey = formatDateToKey(new Date());

    if (matchDate === todayKey) {
      intervalId = setInterval(() => {
        fetchMatches(true);
      }, 30000);
    }

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [matchDate, isMockMode]);

  const calendarYear = calendarMonth.getFullYear();
  const calendarMonthIndex = calendarMonth.getMonth();

  const firstDayOfWeek = new Date(calendarYear, calendarMonthIndex, 1).getDay();
  const daysInMonth = new Date(calendarYear, calendarMonthIndex + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  const prevMonth = () => {
    setCalendarMonth(new Date(calendarYear, calendarMonthIndex - 1, 1));
    const parentConfig = configData?.matches_tab;
    const actionConfig = parentConfig?.content?.prev_month;
    if (actionConfig) handleConfigAction(actionConfig, pushScreen, configData, parentConfig);
  };

  const nextMonth = () => {
    setCalendarMonth(new Date(calendarYear, calendarMonthIndex + 1, 1));
    const parentConfig = configData?.matches_tab;
    const actionConfig = parentConfig?.content?.next_month;
    if (actionConfig) handleConfigAction(actionConfig, pushScreen, configData, parentConfig);
  };

  const selectCalendarDate = (dayNum) => {
    const mmStr = String(calendarMonthIndex + 1).padStart(2, '0');
    const ddStr = String(dayNum).padStart(2, '0');
    const newDateKey = `${calendarYear}-${mmStr}-${ddStr}`;
    setMatchDate(newDateKey);
    setShowCalendar(false);
    const parentConfig = configData?.matches_tab;
    const actionConfig = parentConfig?.content?.select_calendar_day;
    if (actionConfig) handleConfigAction(actionConfig, pushScreen, configData, parentConfig);
  };

  return (
    <View style={styles.tabContentContainer}>
      <Modal
        visible={showCalendar}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeaderRow}>
              <Pressable onPress={prevMonth} style={styles.arrowBtn}>
                <Text style={styles.arrowText}>←</Text>
              </Pressable>
              <Text style={styles.calendarMonthTitle}>
                {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
              <Pressable onPress={nextMonth} style={styles.arrowBtn}>
                <Text style={styles.arrowText}>→</Text>
              </Pressable>
            </View>

            <View style={styles.calendarWeekdaysRow}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <Text key={d} style={styles.weekdayCell}>{d}</Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarDays.map((dayNum, index) => {
                if (dayNum === null) {
                  return <View key={`empty-${index}`} style={styles.dayCellEmpty} />;
                }

                const mmStr = String(calendarMonthIndex + 1).padStart(2, '0');
                const ddStr = String(dayNum).padStart(2, '0');
                const cellDateKey = `${calendarYear}-${mmStr}-${ddStr}`;
                const isCellSelected = matchDate === cellDateKey;

                return (
                  <Pressable
                    key={`day-${dayNum}`}
                    style={[styles.dayCellBtn, isCellSelected && styles.dayCellBtnActive]}
                    onPress={() => selectCalendarDate(dayNum)}
                  >
                    <Text style={[styles.dayCellText, isCellSelected && styles.dayCellTextActive]}>
                      {dayNum}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.calendarFooter}>
              <Pressable style={styles.calendarCloseBtn} onPress={() => {
                setShowCalendar(false);
                const parentConfig = configData?.matches_tab;
                const actionConfig = parentConfig?.content?.close_calendar;
                if (actionConfig) handleConfigAction(actionConfig, pushScreen, configData, parentConfig);
              }}>
                <Text style={styles.calendarCloseBtnText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 12 }}>
        <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>📅 Fixtures & Schedule</Text>
        <Pressable style={styles.calendarHeaderBtn} onPress={() => {
          setShowCalendar(true);
          const parentConfig = configData?.matches_tab;
          const actionConfig = parentConfig?.content?.selectdate;
          if (actionConfig) handleConfigAction(actionConfig, pushScreen, configData, parentConfig);
        }}>
          <Text style={styles.calendarHeaderBtnText}>📅 Select Date</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dateSelectorScroll}
        contentContainerStyle={styles.dateSelectorContainer}
      >
        {dateList.map((dateInfo) => (
          <Pressable
            key={dateInfo.key}
            style={[styles.dateTabScrollBtn, matchDate === dateInfo.key && styles.dateTabBtnActive]}
            onPress={() => {
              setMatchDate(dateInfo.key);
              const parentConfig = configData?.matches_tab;
              const actionConfig = parentConfig?.content?.date_tab_click;
              if (actionConfig) handleConfigAction(actionConfig, pushScreen, configData, parentConfig);
            }}
          >
            <Text
              numberOfLines={1}
              style={[styles.dateTabLabel, matchDate === dateInfo.key && styles.dateTabLabelActive]}
            >
              {dateInfo.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
          <ActivityIndicator size="large" color={COLORS.accentGreen} />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          <Text style={[styles.sectionSubTitle, { marginBottom: 8 }]}>
            Matches on {selectedDateObj ? selectedDateObj.headerLabel : ''}
          </Text>

          {responseData.length === 0 ? (
            <Text style={[styles.emptyText, { marginTop: 24, textAlign: 'center' }]}>
              {error ? `Failed to load matches: ${error}` : 'No matches scheduled for this date.'}
            </Text>
          ) : (
            (() => {
              const sortedLeagues = [...responseData].sort((a, b) => {
                const rankA = liveRanks.find(r => String(r.leagueId) === String(a.id))?.rank || 999999;
                const rankB = liveRanks.find(r => String(r.leagueId) === String(b.id))?.rank || 999999;
                return rankA - rankB;
              });

              const adsConfig = configData?.matches_tab_ads || {};
              const masterEnable = configData?.show_ads?.enable !== false;
              const showAds = masterEnable && adsConfig.enable && Array.isArray(adsConfig.url) && adsConfig.url.length > 0;
              const cardFreq = adsConfig.card || 1;
              let matchGlobalIndex = 0;
              let matchAdCounter = 0;

              return sortedLeagues.map((league, index) => {
                const isWorldCup = league.name && (league.name.toLowerCase().includes('world cup') || league.name.toLowerCase().includes('worldcup'));

                return (
                  <View key={league.id} style={{ marginBottom: 16 }}>
                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      backgroundColor: COLORS.cardLight,
                      borderRadius: 8,
                      marginBottom: 8,
                      marginTop: 8
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {isWorldCup ? (
                          <Text style={{ fontSize: 16, marginRight: 6 }}>🏆</Text>
                        ) : (
                          <FotmobImage
                            id={league.id}
                            type="league"
                            style={{ width: 18, height: 18, marginRight: 8 }}
                          />
                        )}
                        <Text style={{
                          color: isWorldCup ? COLORS.gold : COLORS.text,
                          fontWeight: 'bold',
                          fontSize: 13
                        }}>{league.name}</Text>
                      </View>
                      <Text style={{ color: isWorldCup ? COLORS.gold : COLORS.textMuted, fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' }}>{league.ccode}</Text>
                    </View>

                    {(league.matches || []).map((matchItem) => {
                      matchGlobalIndex++;
                      let matchAdItem = null;
                      if (showAds && matchGlobalIndex % cardFreq === 0) {
                        matchAdItem = adsConfig.url[matchAdCounter % adsConfig.url.length];
                        matchAdCounter++;
                      }

                      const isLive = matchItem.status?.ongoing || false;
                      const isFinished = matchItem.status?.finished || false;
                      const isStarted = isLive || isFinished || matchItem.status?.started;
                      const scoreStr = isStarted
                        ? (matchItem.status?.scoreStr || `${matchItem.home?.score ?? '0'} - ${matchItem.away?.score ?? '0'}`)
                        : 'VS';

                      let matchTime = matchItem.status?.liveTime?.short || matchItem.time || '';

                      if (matchItem.time && selectedDateObj) {
                        const parts = matchItem.time.split(' ');
                        if (parts.length === 2) {
                          const timePart = parts[1];
                          matchTime = `${formatDateToDDMMYYYY(selectedDateObj.dateObject)} ${timePart}`;
                        }
                      }

                      return (
                        <React.Fragment key={matchItem.id}>
                          <Pressable
                            style={({ pressed }) => [styles.matchCard, pressed && styles.cardPressed, { marginBottom: 8 }]}
                            onPress={() => {
                              onSelectMatch(matchItem.id);
                              const parentConfig = configData?.matches_tab;
                              const actionConfig = parentConfig?.content?.match_card_click;
                              if (actionConfig) handleConfigAction(actionConfig, pushScreen, configData, parentConfig);
                            }}
                          >
                            <View style={styles.matchCardHeader}>
                              <Text style={styles.matchStage}>{api.formatTournamentStage(matchItem.tournamentStage) || 'Match'}</Text>
                              {isLive && (
                                <View style={styles.liveIndicator}>
                                  <View style={styles.pulseDot} />
                                  <Text style={styles.liveLabel}>{matchTime || 'LIVE'}</Text>
                                </View>
                              )}
                              {!isLive && !isFinished && <Text style={styles.scheduledLabel}>{api.convertToAMPM(matchItem.time) || 'Scheduled'}</Text>}
                            </View>

                            <View style={styles.matchTeamsRow}>
                              <View style={[styles.teamColumn, { flexDirection: 'column', alignItems: 'center', gap: 6 }]}>
                                <FotmobImage
                                  id={matchItem.home?.id}
                                  type="team"
                                  style={{ width: 28, height: 28 }}
                                />
                                <Text style={[styles.teamText, { textAlign: 'center', fontSize: 12 }]} numberOfLines={1}>
                                  {matchItem.home?.name || 'Home'}
                                </Text>
                              </View>
                              <View style={[styles.scoreContainer, { paddingHorizontal: 12, borderRadius: 6 }]}>
                                <Text style={styles.scoreText}>{scoreStr}</Text>
                              </View>
                              <View style={[styles.teamColumn, { flexDirection: 'column', alignItems: 'center', gap: 6 }]}>
                                <FotmobImage
                                  id={matchItem.away?.id}
                                  type="team"
                                  style={{ width: 28, height: 28 }}
                                />
                                <Text style={[styles.teamText, { textAlign: 'center', fontSize: 12 }]} numberOfLines={1}>
                                  {matchItem.away?.name || 'Away'}
                                </Text>
                              </View>
                            </View>
                          </Pressable>
                          {matchAdItem && <AdCard ad={matchAdItem} pushScreen={pushScreen} />}
                        </React.Fragment>
                      );
                    })}
                  </View>
                );
              });
            })()
          )}
        </ScrollView>
      )}
    </View>
  );
}
