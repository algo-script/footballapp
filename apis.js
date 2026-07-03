// apis.js - Centralized API data for all JSON responses
// This module defines and exports all static JSON mock data mapped to proper API endpoint names
// along with real API fetch helper functions.

const { Platform } = require('react-native');
const axios = require('axios');

// Base URL configuration
const BASE_URL = "https://fifa.clustersofttech.com/api"
// (() => {
//   let host = 'localhost:3000';
//   if (Platform.OS === 'android') {
//     host = 'localhost:3000';
//   }
//   try {
//     const Constants = require('expo-constants').default;
//     const manifest = Constants.expoConfig || Constants.manifest || {};
//     const hostUri = manifest.hostUri;
//     if (hostUri) {
//       const ip = hostUri.split(':')[0];
//       host = `${ip}:3000`;
//     }
//   } catch (e) {
//     // Fallback to platform defaults
//   }
//   return `http://${host}/api`;
// })();

const getEuropeanOffset = (year, month, day) => {
  if (month > 3 && month < 10) return 2; // April to September: CEST (UTC+2)
  if (month === 3) {
    // March: DST starts last Sunday
    const lastSunday = 31 - (new Date(year, 2, 31).getDay());
    return day >= lastSunday ? 2 : 1;
  }
  if (month === 10) {
    // October: DST ends last Sunday
    const lastSunday = 31 - (new Date(year, 9, 31).getDay());
    return day < lastSunday ? 2 : 1;
  }
  return 1; // Nov, Dec, Jan, Feb: CET (UTC+1)
};

const parseCETTimeToLocal = (timeStr) => {
  if (!timeStr) return null;
  const parts = timeStr.split(' ');
  if (parts.length !== 2) return null;
  const [datePart, timePart] = parts;
  const [day, month, year] = datePart.split('.').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);

  if (isNaN(day) || isNaN(month) || isNaN(year) || isNaN(hours) || isNaN(minutes)) {
    return null;
  }

  const offset = getEuropeanOffset(year, month, day);
  return new Date(Date.UTC(year, month - 1, day, hours - offset, minutes));
};

const convertToAMPM = (timeStr) => {
  const localDate = parseCETTimeToLocal(timeStr);
  if (!localDate) return timeStr;

  const hours = localDate.getHours();
  const minutes = localDate.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayHoursStr = String(displayHours).padStart(2, '0');
  const displayMinutesStr = String(minutes).padStart(2, '0');
  return `${displayHoursStr}:${displayMinutesStr} ${ampm}`;
};

const formatTournamentStage = (stage) => {
  if (!stage) return '';
  const stageStr = String(stage).trim();
  switch (stageStr) {
    case '1/16':
      return 'Round of 32';
    case '1/8':
      return 'Round of 16';
    case '1/4':
      return 'Quarter-finals';
    case '1/2':
      return 'Semi-finals';
    case '1':
    case '1/1':
      return 'Final';
    default:
      if (/^\d+$/.test(stageStr)) {
        return `Round ${stageStr}`;
      }
      return stageStr;
  }
};
// Helper function to map API response to frontend structure
const mapApiResponseToLeagues = (data) => {
  const leaguesRaw = data?.live?.exmatches?.league || [];
  const leagues = Array.isArray(leaguesRaw) ? leaguesRaw : [leaguesRaw];

  const mappedLeagues = leagues
    .filter(league => league && league.name)
    .map((league) => {
      const matchesRaw = league.match || [];
      const matches = Array.isArray(matchesRaw) ? matchesRaw : [matchesRaw];

      return {
        id: league.id || Math.random().toString(),
        name: league.name,
        ccode: league.ccode || 'INT',
        matches: matches
          .filter(m => m && m.id)
          .map((m) => {
            const statusUpper = (m.Status || '').toUpperCase();
            const isLive = statusUpper === 'P' || statusUpper === 'LIVE' || statusUpper === 'I';
            const isFinished = statusUpper === 'F' || statusUpper === 'FT' || statusUpper === 'AET';
            const isStarted = isLive || isFinished;
            let scoreStr = isStarted ? `${m.hScore ?? '0'} - ${m.aScore ?? '0'}` : 'VS';

            // Check and process penalty shootout scores
            const hasPenalties = isStarted && m.pah !== undefined && m.paa !== undefined && m.pah !== null && m.pah !== '';
            let pahNum = undefined;
            let paaNum = undefined;
            if (hasPenalties) {
              pahNum = parseInt(m.pah, 10);
              paaNum = parseInt(m.paa, 10);
              if (!isNaN(pahNum) && !isNaN(paaNum)) {
                const regHome = (parseInt(m.hScore, 10) || 0) - pahNum;
                const regAway = (parseInt(m.aScore, 10) || 0) - paaNum;
                scoreStr = `${regHome} - ${regAway} (${pahNum} - ${paaNum} Pen)`;
              }
            }

            return {
              id: m.id,
              home: {
                id: m.hId,
                name: m.hTeam,
                score: isStarted ? m.hScore : undefined,
                regScore: hasPenalties ? (parseInt(m.hScore, 10) || 0) - (pahNum || 0) : m.hScore,
                penScore: hasPenalties ? pahNum : undefined,
              },
              away: {
                id: m.aId,
                name: m.aTeam,
                score: isStarted ? m.aScore : undefined,
                regScore: hasPenalties ? (parseInt(m.aScore, 10) || 0) - (paaNum || 0) : m.aScore,
                penScore: hasPenalties ? paaNum : undefined,
              },
              status: {
                ongoing: isLive,
                finished: isFinished,
                started: isStarted,
                scoreStr: scoreStr,
                hasPenalties,
                pah: pahNum,
                paa: paaNum,
              },
              time: m.time,
              tournamentStage: formatTournamentStage(m.stage),
            };
          }),
      };
    });

  // Sort leagues: Put World Cup at the top
  return mappedLeagues.sort((a, b) => {
    const aLower = (a.name || '').toLowerCase();
    const bLower = (b.name || '').toLowerCase();
    const aIsWorldCup = aLower.includes('world cup') || aLower.includes('worldcup');
    const bIsWorldCup = bLower.includes('world cup') || bLower.includes('worldcup');

    if (aIsWorldCup && !bIsWorldCup) return -1;
    if (!aIsWorldCup && bIsWorldCup) return 1;
    return 0;
  });
};

module.exports = {
  // Timezone & Formatting Helpers  // Timezone & Formatting Helpers
  getEuropeanOffset,
  parseCETTimeToLocal,
  convertToAMPM,
  formatTournamentStage,

  // Centralized async function to fetch matches by date using axios or fallback to mocks
  fetchMatchesByDate: async (matchDate, isMockMode) => {
    if (isMockMode) {
      return mocks['get-matches-by-date-and-league']?.response || [];
    }

    const apiDate = matchDate.replace(/-/g, '');
    let timezone = 'UTC';
    try {
      const resolved = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (resolved) {
        timezone = resolved;
      }
    } catch (e) {
      console.warn("Timezone resolution failed, fallback to UTC:", e);
    }

    const url = `${BASE_URL}/matches?date=${apiDate}&tz=${encodeURIComponent(timezone)}&tzone=${encodeURIComponent(timezone)}`;

    const res = await axios.get(url);
    return mapApiResponseToLeagues(res.data);
  },

  // Centralized async function to fetch match details/facts raw data
  fetchMatchDetails: async (matchId, isMockMode) => {
    if (isMockMode) {
      // return require('./testdata/apiresponses/raw_france_sweden.json');
    }
    const url = `${BASE_URL}/match/${matchId}`;
    const res = await axios.get(url);
    return res.data;
  },

  // Centralized async function to fetch leagues list from API
  fetchLeaguesList: async () => {
    const url = `${BASE_URL}/leagues`;
    const res = await axios.get(url);
    return res.data;
  },

  // Centralized async function to fetch player details
  fetchPlayerDetails: async (playerId) => {
    const url = `${BASE_URL}/player/${playerId}`;
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (e) {
      console.warn("Error fetching player details:", e);
      return null;
    }
  },

  // Centralized async function to fetch player extra details (career, dob, country)
  fetchPlayerExtraDetails: async (playerId) => {
    const url = `${BASE_URL}/player/${playerId}/details`;
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (e) {
      console.warn("Error fetching player extra details:", e);
      return null;
    }
  },

  // Centralized async function to fetch dynamic league details
  fetchLeagueDetails: async (leagueId) => {
    const url = `${BASE_URL}/league/${leagueId}`;
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (e) {
      console.warn(`Error fetching league details for ${leagueId}:`, e);
      return null;
    }
  },

  // Centralized async function to fetch league table
  fetchLeagueTable: async (leagueId) => {
    const url = `${BASE_URL}/league/${leagueId}/table`;
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (e) {
      console.warn(`Error fetching league table for ${leagueId}:`, e);
      return null;
    }
  },
  fetchLeagueFixtures: async (leagueId) => {
    const url = `${BASE_URL}/league/${leagueId}/fixtures`;
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (e) {
      console.warn(`Error fetching league fixtures for ${leagueId}:`, e);
      return null;
    }
  },
  fetchTeamDetails: async (teamId) => {
    const url = `${BASE_URL}/team/${teamId}`;
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (e) {
      console.warn(`Error fetching team details for ${teamId}:`, e);
      return null;
    }
  },
  fetchLiveRankLeagues: async () => {
    const url = `${BASE_URL}/leagues/live-rank`;
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (e) {
      console.warn(`Error fetching live rank leagues:`, e);
      return null;
    }
  }
};


