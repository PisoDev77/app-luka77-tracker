import axios from 'axios';

/**
 * Ball Don't Lie API 무료 버전 클라이언트
 * @description 무료 플랜 제한사항에 맞춘 NBA 데이터 조회
 */

const BASE_URL = 'https://api.balldontlie.io/v1';
const LUKA_PLAYER_ID = 77; // 또는 1629029
const LAKERS_TEAM_ID = 14; // Los Angeles Lakers
const CACHE_DURATION = 2 * 60 * 1000; // 2분 (API 제한 고려)

class FreeNbaApiClient {
  constructor() {
    this.cache = new Map();
    this.requestCount = 0;
    this.lastMinute = Date.now();
    
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        // API 키는 환경변수에서 로드 (브라우저에서는 VITE_ 접두사 필요)
        'Authorization': import.meta.env.VITE_BALLDONTLIE_API_KEY || ''
      }
    });

    // 요청 인터셉터로 Rate Limiting 처리
    this.client.interceptors.request.use(
      (config) => {
        const now = Date.now();
        
        // 1분마다 요청 카운터 리셋
        if (now - this.lastMinute > 60000) {
          this.requestCount = 0;
          this.lastMinute = now;
        }
        
        // 무료 플랜: 분당 5회 제한
        if (this.requestCount >= 5) {
          return Promise.reject(new Error('Rate limit exceeded: 5 requests per minute'));
        }
        
        this.requestCount++;
        console.log(`API 요청 ${this.requestCount}/5`);
        
        return config;
      },
      (error) => Promise.reject(error)
    );

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
   * API 에러 객체 생성
   * @param {Error} error - 원본 에러
   * @returns {Object} 표준화된 에러 객체
   */
  createApiError(error) {
    return {
      message: error.response?.data?.message || error.message || 'API 요청에 실패했습니다',
      status: error.response?.status || 500,
      code: error.code || 'UNKNOWN_ERROR',
      isRateLimit: error.message?.includes('Rate limit')
    };
  }

  /**
   * 캐시 확인 및 반환
   * @param {string} key - 캐시 키
   * @returns {any|null} 캐시된 데이터 또는 null
   */
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`캐시에서 반환: ${key}`);
      return cached.data;
    }
    return null;
  }

  /**
   * 데이터 캐시 저장
   * @param {string} key - 캐시 키
   * @param {any} data - 저장할 데이터
   */
  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * 캐싱과 함께 API 요청 수행
   * @param {string} endpoint - API 엔드포인트
   * @param {Object} params - 쿼리 파라미터
   * @returns {Promise<any>} API 응답 데이터
   */
  async fetchWithCache(endpoint, params = {}) {
    const cacheKey = `${endpoint}:${JSON.stringify(params)}`;
    
    // 캐시 확인
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // API 요청
      const response = await this.client.get(endpoint, { params });
      const data = response.data;

      // 캐시 저장
      this.setCachedData(cacheKey, data);
      
      return data;
    } catch (error) {
      // Rate limit 에러인 경우 캐시된 데이터라도 반환
      if (error.isRateLimit) {
        console.warn('Rate limit에 걸렸습니다. 캐시된 데이터를 확인합니다.');
        const staleCache = this.cache.get(cacheKey);
        if (staleCache) {
          console.log('오래된 캐시 데이터를 반환합니다.');
          return staleCache.data;
        }
      }
      throw error;
    }
  }

  // === 무료 플랜 사용 가능한 엔드포인트들 ===

  /**
   * 모든 팀 정보 조회
   * @returns {Promise<Array>} 팀 목록
   */
  async getTeams() {
    try {
      const data = await this.fetchWithCache('/teams');
      return data.data || [];
    } catch (error) {
      console.error('팀 정보 조회 실패:', error);
      return this.getMockTeams();
    }
  }

  /**
   * LA 레이커스 정보 조회
   * @returns {Promise<Object>} 팀 정보
   */
  async getLakersInfo() {
    try {
      const teams = await this.getTeams();
      const lakers = teams.find(team => team.id === LAKERS_TEAM_ID);
      return lakers || this.getMockLakers();
    } catch (error) {
      console.error('레이커스 정보 조회 실패:', error);
      return this.getMockLakers();
    }
  }

  /**
   * 팀 소속 선수들 조회
   * @param {number} teamId - 팀 ID (기본값: 레이커스)
   * @returns {Promise<Array>} 선수 목록
   */
  async getTeamPlayers(teamId = LAKERS_TEAM_ID) {
    try {
      // 무료 버전에서는 team players 엔드포인트가 제한될 수 있음
      const data = await this.fetchWithCache('/players', {
        team_ids: [teamId],
        per_page: 100
      });
      return data.data || [];
    } catch (error) {
      console.error('팀 선수 조회 실패:', error);
      return this.getMockLakersPlayers();
    }
  }

  /**
   * 루카 돈치치 기본 정보 조회
   * @returns {Promise<Object>} 루카 선수 정보
   */
  async getLukaInfo() {
    try {
      const players = await this.getTeamPlayers();
      const luka = players.find(player => 
        player.id === LUKA_PLAYER_ID || 
        player.first_name === 'Luka' && player.last_name === 'Doncic'
      );
      return luka || this.getMockLuka();
    } catch (error) {
      console.error('루카 정보 조회 실패:', error);
      return this.getMockLuka();
    }
  }

  /**
   * 팀 순위 조회
   * @returns {Promise<Array>} 팀 순위 목록
   */
  async getTeamStandings() {
    try {
      // 무료 버전에서 standings 엔드포인트 사용 가능
      const data = await this.fetchWithCache('/standings');
      return data.data || [];
    } catch (error) {
      console.error('팀 순위 조회 실패:', error);
      return this.getMockStandings();
    }
  }

  /**
   * 레이커스 현재 순위 조회
   * @returns {Promise<Object>} 레이커스 순위 정보
   */
  async getLakersStanding() {
    try {
      const standings = await this.getTeamStandings();
      const mavs = standings.find(team => team.team.id === LAKERS_TEAM_ID);
      return mavs || this.getMockLakersStanding();
    } catch (error) {
      console.error('레이커스 순위 조회 실패:', error);
      return this.getMockLakersStanding();
    }
  }

  /**
   * 게임 정보 조회
   * @param {Object} options - 옵션 (날짜, 팀 등)
   * @returns {Promise<Array>} 게임 목록
   */
  async getGames(options = {}) {
    try {
      const params = {
        team_ids: [LAKERS_TEAM_ID],
        per_page: options.limit || 10,
        ...options
      };
      
      const data = await this.fetchWithCache('/games', params);
      return data.data || [];
    } catch (error) {
      console.error('게임 정보 조회 실패:', error);
      return this.getMockGames();
    }
  }

  /**
   * 다음 경기 조회
   * @returns {Promise<Object|null>} 다음 경기 정보
   */
  async getNextGame() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const games = await this.getGames({
        start_date: today,
        end_date: this.getDateString(30) // 30일 후까지
      });
      
      const upcomingGames = games.filter(game => new Date(game.date) > new Date());
      return upcomingGames.length > 0 ? upcomingGames[0] : null;
    } catch (error) {
      console.error('다음 경기 조회 실패:', error);
      return this.getMockNextGame();
    }
  }

  /**
   * 최근 경기 조회
   * @param {number} limit - 조회할 경기 수
   * @returns {Promise<Array>} 최근 경기 목록
   */
  async getRecentGames(limit = 5) {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = this.getDateString(-30); // 30일 전부터
      
      const games = await this.getGames({
        start_date: startDate,
        end_date: endDate,
        limit: limit
      });
      
      return games
        .filter(game => new Date(game.date) <= new Date())
        .slice(0, limit);
    } catch (error) {
      console.error('최근 경기 조회 실패:', error);
      return this.getMockRecentGames(limit);
    }
  }

  /**
   * 현재 진행중인 경기 조회
   * @returns {Promise<Object|null>} 현재 경기 정보
   */
  async getCurrentGame() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const games = await this.getGames({
        dates: [today]
      });
      
      // 오늘 경기 중 진행중인 것 찾기
      const todayGame = games.find(game => {
        const gameDate = new Date(game.date).toDateString();
        const todayDate = new Date().toDateString();
        return gameDate === todayDate;
      });
      
      return todayGame || null;
    } catch (error) {
      console.error('현재 경기 조회 실패:', error);
      return null;
    }
  }

  // === 유틸리티 함수들 ===

  /**
   * 날짜 문자열 생성
   * @param {number} daysFromNow - 현재로부터 며칠 후/전
   * @returns {string} YYYY-MM-DD 형식 날짜
   */
  getDateString(daysFromNow) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
  }

  // === 모의 데이터 (Fallback) ===

  getMockTeams() {
    return [
      { id: 6, full_name: 'Dallas Lakers', abbreviation: 'DAL', city: 'Dallas', name: 'Lakers' }
    ];
  }

  getMockLakers() {
    return {
      id: 6,
      full_name: 'Dallas Lakers',
      abbreviation: 'DAL',
      city: 'Dallas',
      name: 'Lakers',
      conference: 'West',
      division: 'Southwest'
    };
  }

  getMockLuka() {
    return {
      id: 77,
      first_name: 'Luka',
      last_name: 'Doncic',
      position: 'PG-SG',
      height_feet: 6,
      height_inches: 7,
      weight_pounds: 230,
      team: this.getMockLakers()
    };
  }

  getMockLakersPlayers() {
    return [
      this.getMockLuka(),
      { id: 2, first_name: 'Kyrie', last_name: 'Irving', position: 'PG' },
      { id: 3, first_name: 'Tim', last_name: 'Hardaway Jr.', position: 'SG' }
    ];
  }

  getMockStandings() {
    return [
      {
        team: this.getMockLakers(),
        wins: 35,
        losses: 25,
        win_percentage: 0.583,
        conference_rank: 7
      }
    ];
  }

  getMockLakersStanding() {
    return {
      team: this.getMockLakers(),
      wins: 35,
      losses: 25,
      win_percentage: 0.583,
      conference_rank: 7,
      games_behind: 5.5
    };
  }

  getMockGames() {
    return [
      {
        id: 1,
        date: new Date().toISOString(),
        home_team: this.getMockLakers(),
        visitor_team: { id: 14, full_name: 'Los Angeles Lakers', abbreviation: 'LAL' },
        home_team_score: 115,
        visitor_team_score: 110,
        status: 'Final'
      }
    ];
  }

  getMockNextGame() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return {
      id: 999,
      date: tomorrow.toISOString(),
      home_team: { id: 14, full_name: 'Los Angeles Lakers', abbreviation: 'LAL' },
      visitor_team: this.getMockLakers(),
      status: 'Scheduled'
    };
  }

  getMockRecentGames(limit) {
    const games = [];
    for (let i = 1; i <= limit; i++) {
      const gameDate = new Date();
      gameDate.setDate(gameDate.getDate() - i);
      
      games.push({
        id: i,
        date: gameDate.toISOString(),
        home_team: i % 2 === 0 ? this.getMockLakers() : { id: 10 + i, full_name: `Team ${i}`, abbreviation: `T${i}` },
        visitor_team: i % 2 === 1 ? this.getMockLakers() : { id: 20 + i, full_name: `Team ${i}`, abbreviation: `T${i}` },
        home_team_score: 100 + Math.floor(Math.random() * 30),
        visitor_team_score: 100 + Math.floor(Math.random() * 30),
        status: 'Final'
      });
    }
    return games;
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const freeNbaApi = new FreeNbaApiClient();