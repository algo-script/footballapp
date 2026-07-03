import React, { useState, useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Premium Obsidian-Indigo Dark Color Palette
export const DARK_COLORS = {
  bg: '#0A0D14',
  card: '#141923',
  cardLight: '#1E2536',
  border: '#222B3D',
  text: '#FFFFFF',
  textMuted: '#8F9CAE',
  accentGreen: '#00E676',
  accentBlue: '#00B0FF',
  accentRed: '#FF1744',
  accentOrange: '#FF9100',
  gold: '#FFD700',
};

export const LIGHT_COLORS = {
  bg: '#F5F7FA',
  card: '#FFFFFF',
  cardLight: '#F0F2F5',
  border: '#E2E8F0',
  text: '#0F172A',
  textMuted: '#64748B',
  accentGreen: '#10B981',
  accentBlue: '#3B82F6',
  accentRed: '#EF4444',
  accentOrange: '#F59E0B',
  gold: '#EAB308',
};

export const ThemeContext = React.createContext();

export const getStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
    marginTop: 30,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 1.5,
    flex: 1,
  },
  backButton: {
    marginRight: 16,
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  mainContent: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContentContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  sectionSubTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },

  /* Date Selector Row */
  dateSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  dateSelectorScroll: {
    marginBottom: 16,
    flexGrow: 0,
    height: 54,
  },
  dateSelectorContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  dateTabBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateTabScrollBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 110,
  },
  dateTabBtnActive: {
    borderColor: COLORS.accentGreen,
    backgroundColor: COLORS.cardLight,
  },
  emptyLiveContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyLiveText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontStyle: 'italic',
  },
  dateTabLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  dateTabLabelActive: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  calendarHeaderBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.cardLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
  },
  calendarHeaderBtnText: {
    color: COLORS.accentGreen,
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 13, 20, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarContainer: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.cardLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  calendarMonthTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  calendarWeekdaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCellEmpty: {
    width: '14.28%',
    height: 40,
  },
  dayCellBtn: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 4,
  },
  dayCellBtnActive: {
    backgroundColor: COLORS.accentGreen,
  },
  dayCellText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '500',
  },
  dayCellTextActive: {
    color: COLORS.bg,
    fontWeight: 'bold',
  },
  calendarFooter: {
    marginTop: 16,
    alignItems: 'center',
  },
  calendarCloseBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: COLORS.cardLight,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  calendarCloseBtnText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: 'bold',
  },

  /* Match Card Styles */
  matchCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
    backgroundColor: COLORS.cardLight,
  },
  matchCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  matchStage: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentRed,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginRight: 6,
  },
  liveLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  finishedLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
    backgroundColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  scheduledLabel: {
    color: COLORS.accentBlue,
    fontSize: 11,
    fontWeight: '600',
    backgroundColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  matchTeamsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  teamColumn: {
    flex: 1.2,
  },
  teamText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: 'bold',
  },
  scoreContainer: {
    flex: 0.8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.cardLight,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.accentGreen,
  },

  /* League List Styles */
  leagueListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  leagueLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    resizeMode: 'contain',
    backgroundColor: '#fff',
    padding: 4,
  },
  leagueListInfo: {
    flex: 1,
    marginLeft: 16,
  },
  leagueListName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  leagueListCountry: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  leagueListChevron: {
    fontSize: 16,
    color: COLORS.textMuted,
    fontWeight: 'bold',
  },

  /* Search Styles */
  searchInput: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    color: COLORS.text,
    fontSize: 15,
    marginBottom: 16,
  },
  playerCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    alignItems: 'center',
  },
  playerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.cardLight,
  },
  playerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  playerSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: 8,
  },
  statBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    fontSize: 11,
    color: COLORS.text,
    backgroundColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontWeight: '600',
  },

  /* News Styles */
  newsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    overflow: 'hidden',
  },
  newsImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  newsContent: {
    padding: 16,
  },
  newsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  newsSource: {
    color: COLORS.accentBlue,
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  newsTime: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  newsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
    lineHeight: 20,
  },

  /* Transfer Screen Styles */
  transferCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 10,
  },
  transferHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  transferPlayerName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  transferFee: {
    fontSize: 14,
    color: COLORS.accentGreen,
    fontWeight: 'bold',
  },
  transferDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  transferTeamLink: {
    color: COLORS.accentBlue,
    fontSize: 13,
    fontWeight: '600',
  },
  transferArrow: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  transferDate: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 6,
  },

  /* Match details Banner */
  matchDetailWrapper: {
    flex: 1,
  },
  matchDetailBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailBannerTeam: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailTeamName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 6,
  },
  detailBannerScore: {
    flex: 0.8,
    alignItems: 'center',
  },
  detailScoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.accentGreen,
    letterSpacing: 2,
  },
  matchStatusLabel: {
    marginTop: 4,
    fontSize: 11,
    color: COLORS.textMuted,
    backgroundColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  /* League Details Banner and Standings Table Styles */
  detailWrapper: {
    flex: 1,
  },
  detailContainer: {
    flex: 1,
  },
  leagueBanner: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  largeLeagueLogo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 6,
  },
  largeLeagueName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 10,
  },
  largeLeagueCountry: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  detailTabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailTabItem: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailTabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.accentGreen,
  },
  detailTabLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  detailTabLabelActive: {
    color: COLORS.accentGreen,
    fontWeight: 'bold',
  },
  detailScrollContent: {
    flex: 1,
  },

  /* Standings Tab Specific Styles */
  halfSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    backgroundColor: COLORS.bg,
  },
  halfBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  halfBtnActive: {
    borderColor: COLORS.accentGreen,
    backgroundColor: COLORS.cardLight,
  },
  halfLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  halfLabelActive: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerCell: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: 'bold',
  },
  tableBody: {
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
  },
  cellText: {
    color: COLORS.text,
    fontSize: 13,
  },
  cellRank: {
    width: 25,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cellTeam: {
    flex: 1,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cellNum: {
    width: 28,
    textAlign: 'center',
    color: COLORS.textMuted,
  },
  cellPts: {
    width: 32,
    textAlign: 'center',
    fontWeight: 'bold',
    color: COLORS.accentGreen,
  },

  /* Teams Tab Specific Styles */
  teamsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 8,
  },
  teamGridItem: {
    width: (width - 44) / 2, // 2-columns
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gridTeamLetter: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.accentBlue,
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 48,
    marginBottom: 10,
  },
  gridTeamName: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: 'bold',
  },

  /* Rounds Tab Specific Styles */
  roundsHorizontalList: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  roundSelectBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roundSelectBtnActive: {
    borderColor: COLORS.accentGreen,
    backgroundColor: COLORS.cardLight,
  },
  roundSelectLabel: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  roundSelectLabelActive: {
    color: COLORS.accentGreen,
    fontWeight: 'bold',
  },

  /* Stats Tab Specific Styles */
  statsSection: {
    padding: 16,
    paddingBottom: 30,
  },
  statsGroup: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 16,
  },
  statsGroupTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  statRow: {
    marginBottom: 14,
  },
  statValuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statValueText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    width: 60,
  },
  statLabelText: {
    fontSize: 13,
    color: COLORS.text,
    textAlign: 'center',
    flex: 1,
  },
  statBarWrapper: {
    height: 6,
    flexDirection: 'row',
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  statBarPart: {
    height: '100%',
  },

  /* Lineup Section Specific Styles */
  lineupSection: {
    padding: 16,
    paddingBottom: 30,
  },
  lineupColHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  lineupColTitle: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 12,
  },
  lineupListsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lineupListSide: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
  },
  subListHeader: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 6,
  },
  lineupPlayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  shirtNumberText: {
    width: 22,
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
  },
  lineupPlayerName: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
  },
  lineupPlayerRating: {
    fontSize: 10,
    backgroundColor: COLORS.border,
    color: COLORS.accentGreen,
    fontWeight: 'bold',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },

  /* Info Screen Specific Styles */
  infoSection: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  infoValue: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },

  /* Team of the Round Styles */
  totsPlayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 8,
  },
  totsPlayerInfo: {
    flex: 1,
  },
  totsPlayerName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  totsPlayerSub: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  totsRatingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  totsRatingText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: 'bold',
  },

  /* News Specific Styles */
  newsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  newsCardImage: {
    width: '100%',
    height: 160,
    backgroundColor: COLORS.cardLight,
  },
  newsCardContent: {
    padding: 14,
  },
  newsSourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  newsSourceIcon: {
    width: 14,
    height: 14,
    borderRadius: 2,
    marginRight: 6,
  },
  newsSourceText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.textMuted,
  },
  newsDot: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginHorizontal: 6,
  },
  newsTimeText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  newsCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    lineHeight: 20,
  },

  /* Head-To-Head Specific Styles */
  h2hRow: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 8,
  },
  h2hDate: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  h2hScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  h2hTeamName: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: 'bold',
    flex: 1.2,
  },
  h2hScoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.accentGreen,
    backgroundColor: COLORS.cardLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginHorizontal: 8,
  },

  /* Odds Poll Specific Styles */
  pollContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    alignItems: 'center',
  },
  pollQuestion: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  pollBarsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    alignItems: 'flex-end',
    height: 110,
  },
  pollOptionCol: {
    alignItems: 'center',
    width: '28%',
  },
  pollValueText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pollBarFill: {
    width: 24,
    borderRadius: 4,
  },
  pollLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
  },
  oddsRateRow: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  oddMarketTitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  oddsValues: {
    flexDirection: 'row',
    gap: 8,
  },
  oddRateBtn: {
    flex: 1,
    textAlign: 'center',
    backgroundColor: COLORS.cardLight,
    color: COLORS.accentBlue,
    fontSize: 13,
    fontWeight: 'bold',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  /* Video Highlights Play Card Styles */
  highlightImageWrapper: {
    position: 'relative',
    width: 80,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
  },
  highlightThumbnail: {
    width: '100%',
    height: '100%',
  },
  highlightPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightPlayOverlayIcon: {
    color: COLORS.accentGreen,
    fontSize: 18,
    fontWeight: 'bold',
  },
  highlightPlayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 10,
  },
  highlightPlayIcon: {
    fontSize: 22,
    color: COLORS.bg,
    backgroundColor: COLORS.accentGreen,
    width: 44,
    height: 44,
    borderRadius: 22,
    textAlign: 'center',
    lineHeight: 44,
    overflow: 'hidden',
    fontWeight: 'bold',
  },
  hlTextWrap: {
    flex: 1,
    marginLeft: 14,
  },
  highlightTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  highlightSource: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  highlightPlaceholderCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },

  /* Team Profile Avatar & Cards */
  teamBannerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.accentOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamBannerLetter: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
  },
  playerCardRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  playerCardAvatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.cardLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerStatListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 8,
  },
  rankText: {
    color: COLORS.accentOrange,
    fontWeight: 'bold',
    fontSize: 14,
  },
  pStatName: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 14,
  },
  pStatTeam: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  pStatValue: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 14,
  },
  trophyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    alignItems: 'center',
    gap: 6,
  },
  trophyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  trophyTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  trophyInfo: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  trophyListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  trophySmallIcon: {
    fontSize: 22,
  },
  trophySeason: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  trophyWinner: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 2,
  },

  /* Player Profile Specific Styles */
  playerProfileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  largePlayerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.cardLight,
  },
  largePlayerName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 12,
  },
  largePlayerTeam: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  /* Bottom Tab Navigation Bar */
  tabBar: {
    height: 60,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.card,
    paddingBottom: 4,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabItemActive: {
    borderTopWidth: 2,
    borderTopColor: COLORS.accentGreen,
  },
  tabIcon: {
    fontSize: 18,
    color: COLORS.textMuted,
  },
  tabLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.accentGreen,
  },
});

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('isDarkTheme');
        if (savedTheme !== null) {
          setIsDark(savedTheme === 'true');
        }
      } catch (err) {
        console.warn('Failed to load theme preference:', err);
      }
    };
    loadSavedTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      const newThemeVal = !isDark;
      setIsDark(newThemeVal);
      await AsyncStorage.setItem('isDarkTheme', String(newThemeVal));
    } catch (err) {
      console.warn('Failed to save theme preference:', err);
    }
  };

  const theme = isDark ? DARK_COLORS : LIGHT_COLORS;

  const styles = React.useMemo(() => getStyles(theme), [theme]);

  return (
    <ThemeContext.Provider value={{ theme, styles, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
