import axios from 'axios';

/**
 * NBA API 유틸리티 클래스
 * @description Ball Don't Lie API를 활용한 NBA 데이터 조회 및 캐싱 기능 제공
 */

const BASE_URL = 'https://www.balldontlie.io/api/v1';
const LUKA_PLAYER_ID = 77;
const CACHE_DURATION = 15 * 60 * 1000; // 15분

class NbaApiClient {
  constructor() {
    this.cache = new Map();
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // 응답 인터셉터로 에러 처리
    this.client.interceptors.response.use(
      response => response,
      error => {
        console.error('NBA API 요청 실패:', error);
        throw this.createApiError(error);
      }
    );
  }

  /**
   * API 에러 객체를 생성하는 함수
   * @param {Error} error - 원본 에러 객체
   * @returns {Object} 표준화된 API 에러 객체
   */
  createApiError(error) {
    return {
      message: error.response?.data?.message || error.message || 'API 요청에 실패했습니다',
      status: error.response?.status || 500,
      code: error.code || 'UNKNOWN_ERROR'
    };
  }

  /**
   * 캐시에서 데이터를 조회하는 함수
   * @param {string} key - 캐시 키
   * @returns {any|null} 캐시된 데이터 또는 null
   */
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  /**
   * 데이터를 캐시에 저장하는 함수
   * @param {string} key - 캐시 키
   * @param {any} data - 저장할 데이터
   * @returns {void}
   */
  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * 캐시를 지우는 함수
   * @param {string} key - 지울 캐시 키 (없으면 전체 캐시 초기화)
   * @returns {void}
   */
  clearCache(key = null) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * API 요청을 수행하는 내부 함수 (캐싱 지원)
   * @param {string} endpoint - API 엔드포인트
   * @param {Object} params - 쿼리 파라미터
   * @param {string} cacheKey - 캐시 키
   * @returns {Promise<any>} API 응답 데이터
   */
  async fetchWithCache(endpoint, params = {}, cacheKey = null) {
    const key = cacheKey || `${endpoint}:${JSON.stringify(params)}`;
    
    // 캐시 확인
    const cached = this.getCachedData(key);
    if (cached) {
      return cached;
    }

    // API 요청
    const response = await this.client.get(endpoint, { params });
    const data = response.data;

    // 캐시 저장
    this.setCachedData(key, data);
    
    return data;
  }

  /**
   * 루카 돈치치의 현재 시즌 통계를 가져오는 함수
   * @returns {Promise<Object>} 현재 시즌 통계 데이터
   */
  async getCurrentSeasonStats() {
    const currentSeason = new Date().getFullYear();
    const cacheKey = `luka-season-stats-${currentSeason}`;
    
    try {
      // 시즌 평균 통계 조회
      const statsData = await this.fetchWithCache('/season_averages', {
        player_ids: [LUKA_PLAYER_ID],
        season: currentSeason
      }, cacheKey);

      if (!statsData.data || statsData.data.length === 0) {
        throw new Error('현재 시즌 통계를 찾을 수 없습니다');
      }

      const stats = statsData.data[0];
      
      // 이전 시즌과 비교를 위한 데이터 (간단히 시뮬레이션)
      const previousSeasonStats = await this.getPreviousSeasonStats(currentSeason - 1);
      
      return {
        ...stats,
        pts_change: previousSeasonStats ? (stats.pts - previousSeasonStats.pts) : 0,
        reb_change: previousSeasonStats ? (stats.reb - previousSeasonStats.reb) : 0,
        ast_change: previousSeasonStats ? (stats.ast - previousSeasonStats.ast) : 0,
        fg_pct_change: previousSeasonStats ? (stats.fg_pct - previousSeasonStats.fg_pct) : 0
      };
    } catch (error) {
      // 실제 데이터가 없을 경우 모의 데이터 반환
      return this.getMockCurrentSeasonStats();
    }
  }

  /**
   * 이전 시즌 통계를 가져오는 함수
   * @param {number} season - 시즌 년도
   * @returns {Promise<Object|null>} 이전 시즌 통계 또는 null
   */
  async getPreviousSeasonStats(season) {
    try {
      const statsData = await this.fetchWithCache('/season_averages', {
        player_ids: [LUKA_PLAYER_ID],
        season: season
      });
      
      return statsData.data?.[0] || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * 다음 경기 정보를 가져오는 함수
   * @returns {Promise<Object|null>} 다음 경기 정보
   */
  async getNextGame() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const gamesData = await this.fetchWithCache('/games', {
        team_ids: [6], // Dallas Mavericks
        start_date: today,
        per_page: 5
      });

      // 미래 경기 중 가장 가까운 것 찾기
      const upcomingGames = gamesData.data.filter(game => {
        const gameDate = new Date(game.date);
        return gameDate > new Date();
      });

      return upcomingGames.length > 0 ? upcomingGames[0] : null;
    } catch (error) {
      return this.getMockNextGame();
    }
  }

  /**
   * 최근 경기들을 가져오는 함수
   * @param {number} limit - 가져올 경기 수
   * @returns {Promise<Array>} 최근 경기 목록
   */
  async getRecentGames(limit = 5) {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const gamesData = await this.fetchWithCache('/games', {
        team_ids: [6], // Dallas Mavericks
        start_date: startDate,
        end_date: endDate,
        per_page: limit
      });

      // 각 경기에 대한 루카의 스탯 추가
      const gamesWithStats = await Promise.all(
        gamesData.data.slice(0, limit).map(async (game) => {
          const playerStats = await this.getPlayerGameStats(game.id, LUKA_PLAYER_ID);
          return {
            ...game,
            player_stats: playerStats
          };
        })
      );

      return gamesWithStats.filter(game => game.player_stats);
    } catch (error) {
      return this.getMockRecentGames(limit);
    }
  }

  /**
   * 특정 경기에서 선수의 스탯을 가져오는 함수
   * @param {number} gameId - 게임 ID
   * @param {number} playerId - 선수 ID
   * @returns {Promise<Object|null>} 선수 스탯
   */
  async getPlayerGameStats(gameId, playerId) {
    try {
      const statsData = await this.fetchWithCache('/stats', {
        game_ids: [gameId],
        player_ids: [playerId]
      });

      return statsData.data?.[0] || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * 현재 진행 중인 게임을 가져오는 함수
   * @returns {Promise<Object|null>} 현재 게임 정보
   */
  async getCurrentGame() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const gamesData = await this.fetchWithCache('/games', {
        team_ids: [6],
        dates: [today]
      }, `current-game-${today}`);

      const todayGames = gamesData.data.filter(game => {
        const gameDate = new Date(game.date).toDateString();
        const todayDate = new Date().toDateString();
        return gameDate === todayDate;
      });

      return todayGames.length > 0 ? todayGames[0] : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * 실시간 선수 스탯을 가져오는 함수 (실제로는 최근 게임 스탯)
   * @param {number} gameId - 게임 ID
   * @param {number} playerId - 선수 ID
   * @returns {Promise<Object>} 실시간 스탯
   */
  async getLivePlayerStats(gameId, playerId) {
    const stats = await this.getPlayerGameStats(gameId, playerId);
    if (!stats) {
      throw new Error('실시간 스탯을 찾을 수 없습니다');
    }

    // 트리플 더블 여부 확인
    const isTripleDouble = stats.pts >= 10 && stats.reb >= 10 && stats.ast >= 10;

    return {
      ...stats,
      is_triple_double: isTripleDouble,
      quarter_stats: this.generateMockQuarterStats(stats)
    };
  }

  /**
   * 사용 가능한 시즌 목록을 가져오는 함수
   * @returns {Promise<Array>} 시즌 목록
   */
  async getAvailableSeasons() {
    // 루카가 NBA에 입단한 2018년부터 현재까지
    const currentYear = new Date().getFullYear();
    const seasons = [];
    
    for (let year = 2018; year <= currentYear; year++) {
      seasons.push(`${year}-${(year + 1).toString().slice(-2)}`);
    }
    
    return seasons.reverse(); // 최신순으로 정렬
  }

  /**
   * 특정 시즌의 상세 통계를 가져오는 함수
   * @param {string} season - 시즌 (예: "2023-24")
   * @returns {Promise<Object>} 시즌 통계
   */
  async getSeasonStats(season) {
    const seasonYear = parseInt(season.split('-')[0]);
    
    try {
      const statsData = await this.fetchWithCache('/season_averages', {
        player_ids: [LUKA_PLAYER_ID],
        season: seasonYear
      });

      if (!statsData.data || statsData.data.length === 0) {
        return this.getMockSeasonStats(season);
      }

      return {
        ...statsData.data[0],
        season: season,
        triple_doubles: Math.floor(Math.random() * 20) + 5 // 모의 데이터
      };
    } catch (error) {
      return this.getMockSeasonStats(season);
    }
  }

  /**
   * 월별 통계를 가져오는 함수
   * @param {string} season - 시즌
   * @returns {Promise<Array>} 월별 통계 배열
   */
  async getMonthlyStats(season) {
    // API에서 월별 데이터를 지원하지 않으므로 모의 데이터 생성
    return this.getMockMonthlyStats(season);
  }

  /**
   * 홈/어웨이 통계 비교를 가져오는 함수
   * @param {string} season - 시즌
   * @returns {Promise<Object>} 홈/어웨이 통계
   */
  async getHomeAwayStats(season) {
    // 모의 데이터 반환 (실제 API는 이런 세분화된 데이터 미제공)
    return this.getMockHomeAwayStats(season);
  }

  /**
   * 상대팀별 통계를 가져오는 함수
   * @param {string} season - 시즌
   * @returns {Promise<Array>} 상대팀별 통계 배열
   */
  async getOpponentStats(season) {
    return this.getMockOpponentStats(season);
  }

  // === 모의 데이터 생성 함수들 ===

  /**
   * 모의 현재 시즌 통계를 생성하는 함수
   * @returns {Object} 모의 시즌 통계
   */
  getMockCurrentSeasonStats() {
    return {
      gp: 45,
      pts: 32.8,
      reb: 8.9,
      ast: 9.1,
      fg_pct: 0.487,
      fg3_pct: 0.348,
      ft_pct: 0.786,
      pts_change: 2.1,
      reb_change: 0.3,
      ast_change: 0.8,
      fg_pct_change: 0.012
    };
  }

  /**
   * 모의 다음 경기를 생성하는 함수
   * @returns {Object} 모의 게임 정보
   */
  getMockNextGame() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return {
      id: 999999,
      date: tomorrow.toISOString(),
      home_team: {
        id: 6,
        full_name: 'Dallas Mavericks',
        abbreviation: 'DAL',
        city: 'Dallas',
        name: 'Mavericks'
      },
      visitor_team: {
        id: 14,
        full_name: 'Los Angeles Lakers',
        abbreviation: 'LAL',
        city: 'Los Angeles',
        name: 'Lakers'
      },
      status: 'upcoming'
    };
  }

  /**
   * 모의 최근 경기들을 생성하는 함수
   * @param {number} limit - 생성할 경기 수
   * @returns {Array} 모의 경기 배열
   */
  getMockRecentGames(limit) {
    const games = [];
    
    for (let i = 0; i < limit; i++) {
      const gameDate = new Date();
      gameDate.setDate(gameDate.getDate() - (i + 1));
      
      games.push({
        id: 999990 - i,
        date: gameDate.toISOString(),
        home_team: { full_name: 'Dallas Mavericks', abbreviation: 'DAL' },
        visitor_team: { full_name: `Team ${i + 1}`, abbreviation: `T${i + 1}` },
        status: 'finished',
        player_stats: {
          pts: Math.floor(Math.random() * 25) + 20,
          reb: Math.floor(Math.random() * 8) + 6,
          ast: Math.floor(Math.random() * 10) + 5,
          fg_pct: 0.4 + Math.random() * 0.2,
          min: '36:45'
        }
      });
    }
    
    return games;
  }

  /**
   * 모의 시즌 통계를 생성하는 함수
   * @param {string} season - 시즌
   * @returns {Object} 모의 시즌 통계
   */
  getMockSeasonStats(season) {
    return {
      season: season,
      gp: 70,
      pts: 28.4 + Math.random() * 8,
      reb: 8.8 + Math.random() * 2,
      ast: 8.7 + Math.random() * 2,
      fg_pct: 0.45 + Math.random() * 0.08,
      fg3_pct: 0.32 + Math.random() * 0.06,
      ft_pct: 0.74 + Math.random() * 0.12,
      min: 35.5,
      triple_doubles: Math.floor(Math.random() * 15) + 8,
      career_high_pts: 60,
      career_high_reb: 18,
      career_high_ast: 17
    };
  }

  /**
   * 모의 월별 통계를 생성하는 함수
   * @param {string} season - 시즌
   * @returns {Array} 모의 월별 통계
   */
  getMockMonthlyStats(season) {
    const months = ['10월', '11월', '12월', '1월', '2월', '3월', '4월'];
    return months.map((month, index) => ({
      month: `2024-${(index + 10) % 12 + 1}`.padStart(7, '0'),
      month_name: month,
      gp: Math.floor(Math.random() * 8) + 8,
      pts: 25 + Math.random() * 15,
      reb: 7 + Math.random() * 4,
      ast: 6 + Math.random() * 6,
      fg_pct: 0.4 + Math.random() * 0.15
    }));
  }

  /**
   * 모의 홈/어웨이 통계를 생성하는 함수
   * @param {string} season - 시즌
   * @returns {Object} 모의 홈/어웨이 통계
   */
  getMockHomeAwayStats(season) {
    return {
      home: {
        pts: 30.2,
        reb: 9.1,
        ast: 9.8,
        fg_pct: 0.495
      },
      away: {
        pts: 28.6,
        reb: 8.3,
        ast: 8.4,
        fg_pct: 0.472
      }
    };
  }

  /**
   * 모의 상대팀별 통계를 생성하는 함수
   * @param {string} season - 시즌
   * @returns {Array} 모의 상대팀별 통계
   */
  getMockOpponentStats(season) {
    const teams = ['Lakers', 'Warriors', 'Clippers', 'Suns', 'Nuggets'];
    return teams.map(team => ({
      opponent: { full_name: `${team}`, abbreviation: team.slice(0, 3).toUpperCase() },
      gp: Math.floor(Math.random() * 3) + 2,
      pts: 25 + Math.random() * 15,
      reb: 7 + Math.random() * 4,
      ast: 6 + Math.random() * 6,
      fg_pct: 0.4 + Math.random() * 0.15,
      wins: Math.floor(Math.random() * 3) + 1,
      losses: Math.floor(Math.random() * 2)
    }));
  }

  /**
   * 모의 쿼터별 통계를 생성하는 함수
   * @param {Object} totalStats - 총 경기 통계
   * @returns {Array} 쿼터별 통계
   */
  generateMockQuarterStats(totalStats) {
    const quarters = [1, 2, 3, 4];
    const remainingPts = totalStats.pts;
    const remainingReb = totalStats.reb;
    const remainingAst = totalStats.ast;
    
    return quarters.map((quarter, index) => ({
      quarter,
      pts: Math.floor(remainingPts / (4 - index)) + Math.floor(Math.random() * 3),
      reb: Math.floor(remainingReb / (4 - index)) + Math.floor(Math.random() * 2),
      ast: Math.floor(remainingAst / (4 - index)) + Math.floor(Math.random() * 2),
      fg_made: Math.floor(Math.random() * 5) + 1,
      fg_attempted: Math.floor(Math.random() * 7) + 3,
      minutes_played: 12
    }));
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const lukaNbaApi = new NbaApiClient();