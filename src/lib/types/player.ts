/**
 * NBA 선수 및 게임 관련 타입 정의
 * @description Ball Don't Lie API 응답 구조에 맞춘 TypeScript 타입들
 */

/**
 * NBA 팀 정보 타입
 * @interface Team
 */
export interface Team {
  id: number;
  abbreviation: string;
  city: string;
  conference: 'East' | 'West';
  division: string;
  full_name: string;
  name: string;
}

/**
 * NBA 선수 정보 타입
 * @interface Player
 */
export interface Player {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
  height_feet?: number;
  height_inches?: number;
  weight_pounds?: number;
  team: Team;
}

/**
 * NBA 경기 정보 타입
 * @interface Game
 */
export interface Game {
  id: number;
  date: string;
  home_team: Team;
  visitor_team: Team;
  home_team_score: number;
  visitor_team_score: number;
  period: number;
  postseason: boolean;
  season: number;
  status: 'upcoming' | 'live' | 'finished';
  time?: string;
}

/**
 * 선수 경기 통계 타입
 * @interface PlayerStats
 */
export interface PlayerStats {
  id: number;
  ast: number;          // 어시스트
  blk: number;          // 블록
  dreb: number;         // 수비 리바운드
  fg3_pct: number;      // 3점 성공률
  fg3a: number;         // 3점 시도
  fg3m: number;         // 3점 성공
  fg_pct: number;       // 야투 성공률
  fga: number;          // 야투 시도
  fgm: number;          // 야투 성공
  ft_pct: number;       // 자유투 성공률
  fta: number;          // 자유투 시도
  ftm: number;          // 자유투 성공
  game: Game;
  min: string;          // 출전시간 (MM:SS 형식)
  oreb: number;         // 공격 리바운드
  pf: number;           // 개인파울
  player: Player;
  pts: number;          // 득점
  reb: number;          // 총 리바운드
  stl: number;          // 스틸
  turnover: number;     // 턴오버
}

/**
 * 시즌 통계 집계 타입
 * @interface SeasonStats
 */
export interface SeasonStats {
  season: string;
  gp: number;           // 출전 경기 수
  pts: number;          // 평균 득점
  reb: number;          // 평균 리바운드
  ast: number;          // 평균 어시스트
  stl: number;          // 평균 스틸
  blk: number;          // 평균 블록
  fg_pct: number;       // 야투 성공률
  fg3_pct: number;      // 3점 성공률
  ft_pct: number;       // 자유투 성공률
  min: number;          // 평균 출전시간
  turnover: number;     // 평균 턴오버
  pf: number;           // 평균 개인파울
  
  // 추가 계산 필드
  pts_change?: number;  // 이전 시즌 대비 변화
  reb_change?: number;
  ast_change?: number;
  fg_pct_change?: number;
  
  // 시즌 최고 기록
  career_high_pts?: number;
  career_high_reb?: number;
  career_high_ast?: number;
  triple_doubles?: number;
}

/**
 * 월별 통계 타입
 * @interface MonthlyStats
 */
export interface MonthlyStats {
  month: string;        // 'YYYY-MM' 형식
  month_name: string;   // '1월', '2월' 등
  gp: number;
  pts: number;
  reb: number;
  ast: number;
  fg_pct: number;
}

/**
 * 홈/어웨이 통계 비교 타입
 * @interface HomeAwayStats
 */
export interface HomeAwayStats {
  home: SeasonStats;
  away: SeasonStats;
}

/**
 * 상대팀별 통계 타입
 * @interface OpponentStats
 */
export interface OpponentStats {
  opponent: Team;
  gp: number;
  pts: number;
  reb: number;
  ast: number;
  fg_pct: number;
  wins: number;
  losses: number;
}

/**
 * 실시간 게임 통계 타입
 * @interface LiveGameStats
 */
export interface LiveGameStats extends PlayerStats {
  quarter_stats: QuarterStats[];
  is_triple_double: boolean;
  game_time_remaining?: string;
  current_quarter?: number;
}

/**
 * 쿼터별 통계 타입
 * @interface QuarterStats
 */
export interface QuarterStats {
  quarter: number;
  pts: number;
  reb: number;
  ast: number;
  fg_made: number;
  fg_attempted: number;
  minutes_played: number;
}

/**
 * API 응답 래퍼 타입
 * @interface ApiResponse
 */
export interface ApiResponse<T> {
  data: T[];
  meta: {
    total_pages: number;
    current_page: number;
    next_page: number | null;
    per_page: number;
    total_count: number;
  };
}

/**
 * API 에러 타입
 * @interface ApiError
 */
export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

/**
 * 차트 데이터 포인트 타입
 * @interface ChartDataPoint
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  date?: string;
}

/**
 * 통계 트렌드 방향 타입
 */
export type StatTrend = 'up' | 'down' | 'stable' | 'live';

/**
 * 통계 카드 데이터 타입
 * @interface StatCardData
 */
export interface StatCardData {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  trend?: StatTrend;
  icon?: string;
  description?: string;
}

/**
 * 게임 상태 타입
 */
export type GameStatus = 'upcoming' | 'live' | 'finished' | 'postponed' | 'cancelled';

/**
 * 선수 포지션 타입
 */
export type PlayerPosition = 'PG' | 'SG' | 'SF' | 'PF' | 'C' | 'G' | 'F';

/**
 * NBA 컨퍼런스 타입
 */
export type Conference = 'East' | 'West';

/**
 * 시즌 타입 (정규시즌/플레이오프)
 */
export type SeasonType = 'regular' | 'playoffs';