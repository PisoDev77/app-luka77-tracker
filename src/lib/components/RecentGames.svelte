<script>
  import { formatGameDateTime, formatFieldGoal } from '$utils/formatters.js';

  /**
   * 최근 경기 목록 컴포넌트
   * @description 루카 돈치치의 최근 경기 결과와 개인 스탯을 표시하는 컴포넌트
   */

  /** @type {Array} 최근 경기 목록 */
  export let games = [];
  
  /** @type {number} 표시할 최대 경기 수 */
  export let maxGames = 5;
  
  /** @type {boolean} 컴팩트 모드 여부 */
  export let isCompact = false;

  /**
   * 트리플 더블 달성 여부를 확인하는 함수
   * @param {Object} stats - 선수 통계 객체
   * @returns {boolean} 트리플 더블 달성 여부
   */
  const checkTripleDouble = (stats) => {
    if (!stats) return false;
    return stats.pts >= 10 && stats.reb >= 10 && stats.ast >= 10;
  };

  /**
   * 더블-더블 달성 여부를 확인하는 함수
   * @param {Object} stats - 선수 통계 객체
   * @returns {boolean} 더블-더블 달성 여부
   */
  const checkDoubleDouble = (stats) => {
    if (!stats) return false;
    let doubles = 0;
    if (stats.pts >= 10) doubles++;
    if (stats.reb >= 10) doubles++;
    if (stats.ast >= 10) doubles++;
    return doubles >= 2;
  };

  /**
   * 게임 결과를 판단하는 함수 (승/패)
   * @param {Object} game - 게임 객체
   * @returns {string} 'W' 또는 'L'
   */
  const getGameResult = (game) => {
    if (!game.home_team_score || !game.visitor_team_score) return 'N/A';
    
    // 댈러스 매버릭스가 홈팀인지 확인
    const isDallasHome = game.home_team.abbreviation === 'DAL';
    const dalScore = isDallasHome ? game.home_team_score : game.visitor_team_score;
    const oppScore = isDallasHome ? game.visitor_team_score : game.home_team_score;
    
    return dalScore > oppScore ? 'W' : 'L';
  };

  /**
   * 상대팀 정보를 가져오는 함수
   * @param {Object} game - 게임 객체
   * @returns {Object} 상대팀 정보
   */
  const getOpponent = (game) => {
    const isDallasHome = game.home_team.abbreviation === 'DAL';
    return isDallasHome ? game.visitor_team : game.home_team;
  };

  /**
   * 성과 등급을 계산하는 함수
   * @param {Object} stats - 선수 통계
   * @returns {string} 성과 등급 (A+, A, B, C)
   */
  const calculatePerformanceGrade = (stats) => {
    if (!stats) return 'N/A';
    
    const efficiency = stats.pts + stats.reb + stats.ast - stats.turnover;
    
    if (checkTripleDouble(stats) || efficiency >= 40) return 'A+';
    if (efficiency >= 30) return 'A';
    if (efficiency >= 20) return 'B';
    return 'C';
  };

  // 표시할 경기 목록 (최대 개수 제한)
  $: displayGames = games.slice(0, maxGames);
</script>

<div class="card">
  <div class="card-header">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold flex items-center space-x-2">
        <span>📈</span>
        <span>최근 경기 성과</span>
      </h3>
      
      <div class="text-sm text-gray-500">
        최근 {displayGames.length}경기
      </div>
    </div>
  </div>
  
  <div class="card-body p-0">
    {#if displayGames.length > 0}
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr class="text-xs text-gray-600 uppercase tracking-wider">
              <th class="px-4 py-3 text-left">날짜</th>
              <th class="px-4 py-3 text-left">상대</th>
              <th class="px-4 py-3 text-center">결과</th>
              <th class="px-4 py-3 text-center">득점</th>
              <th class="px-4 py-3 text-center">리바운드</th>
              <th class="px-4 py-3 text-center">어시스트</th>
              {#if !isCompact}
                <th class="px-4 py-3 text-center">야투율</th>
                <th class="px-4 py-3 text-center">등급</th>
              {/if}
              <th class="px-4 py-3 text-center">특이사항</th>
            </tr>
          </thead>
          
          <tbody class="divide-y divide-gray-200">
            {#each displayGames as game (game.id)}
              {@const gameResult = getGameResult(game)}
              {@const opponent = getOpponent(game)}
              {@const stats = game.player_stats}
              {@const dateInfo = formatGameDateTime(game.date)}
              {@const isTripleDouble = checkTripleDouble(stats)}
              {@const isDoubleDouble = checkDoubleDouble(stats)}
              {@const performanceGrade = calculatePerformanceGrade(stats)}
              
              <tr class="hover:bg-gray-50 transition-colors duration-150">
                <!-- 날짜 -->
                <td class="px-4 py-4">
                  <div class="text-sm">
                    <div class="font-medium text-gray-900">{dateInfo.date}</div>
                    <div class="text-gray-500 text-xs">{dateInfo.dayOfWeek}</div>
                  </div>
                </td>

                <!-- 상대팀 -->
                <td class="px-4 py-4">
                  <div class="flex items-center space-x-2">
                    <div class="text-sm font-medium text-gray-900">
                      {opponent.abbreviation}
                    </div>
                  </div>
                </td>

                <!-- 경기 결과 -->
                <td class="px-4 py-4 text-center">
                  <span class={`
                    inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                    ${gameResult === 'W' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                  `}>
                    {gameResult}
                  </span>
                </td>

                <!-- 득점 -->
                <td class="px-4 py-4 text-center">
                  <div class="text-sm font-bold text-gray-900">{stats?.pts || 0}</div>
                </td>

                <!-- 리바운드 -->
                <td class="px-4 py-4 text-center">
                  <div class="text-sm font-bold text-gray-900">{stats?.reb || 0}</div>
                </td>

                <!-- 어시스트 -->
                <td class="px-4 py-4 text-center">
                  <div class="text-sm font-bold text-gray-900">{stats?.ast || 0}</div>
                </td>

                {#if !isCompact}
                  <!-- 야투율 -->
                  <td class="px-4 py-4 text-center">
                    <div class="text-sm text-gray-900">
                      {stats?.fg_pct ? `${(stats.fg_pct * 100).toFixed(1)}%` : 'N/A'}
                    </div>
                    <div class="text-xs text-gray-500">
                      {formatFieldGoal(stats?.fgm, stats?.fga)}
                    </div>
                  </td>

                  <!-- 성과 등급 -->
                  <td class="px-4 py-4 text-center">
                    <span class={`
                      inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                      ${performanceGrade === 'A+' ? 'bg-purple-100 text-purple-800' : 
                        performanceGrade === 'A' ? 'bg-green-100 text-green-800' :
                        performanceGrade === 'B' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'}
                    `}>
                      {performanceGrade}
                    </span>
                  </td>
                {/if}

                <!-- 특이사항 -->
                <td class="px-4 py-4 text-center">
                  <div class="flex flex-col space-y-1">
                    {#if isTripleDouble}
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        🔥 트리플더블
                      </span>
                    {:else if isDoubleDouble}
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        💪 더블더블
                      </span>
                    {:else}
                      <span class="text-xs text-gray-400">-</span>
                    {/if}
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- 요약 통계 -->
      <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div>
            <div class="text-sm text-gray-600">평균 득점</div>
            <div class="text-lg font-semibold text-mavs-blue">
              {displayGames.length > 0 
                ? (displayGames.reduce((sum, game) => sum + (game.player_stats?.pts || 0), 0) / displayGames.length).toFixed(1)
                : '0.0'
              }
            </div>
          </div>
          
          <div>
            <div class="text-sm text-gray-600">평균 리바운드</div>
            <div class="text-lg font-semibold text-mavs-blue">
              {displayGames.length > 0 
                ? (displayGames.reduce((sum, game) => sum + (game.player_stats?.reb || 0), 0) / displayGames.length).toFixed(1)
                : '0.0'
              }
            </div>
          </div>
          
          <div>
            <div class="text-sm text-gray-600">평균 어시스트</div>
            <div class="text-lg font-semibold text-mavs-blue">
              {displayGames.length > 0 
                ? (displayGames.reduce((sum, game) => sum + (game.player_stats?.ast || 0), 0) / displayGames.length).toFixed(1)
                : '0.0'
              }
            </div>
          </div>
          
          <div>
            <div class="text-sm text-gray-600">트리플더블</div>
            <div class="text-lg font-semibold text-orange-600">
              {displayGames.filter(game => checkTripleDouble(game.player_stats)).length}회
            </div>
          </div>
        </div>
      </div>
    {:else}
      <!-- 데이터 없음 -->
      <div class="p-8 text-center text-gray-500">
        <div class="text-4xl mb-2">📈</div>
        <div class="text-sm">최근 경기 데이터가 없습니다</div>
      </div>
    {/if}
  </div>
</div>

<style>
  th {
    font-weight: 600;
  }
  
  tbody tr:hover {
    background-color: rgba(249, 250, 251, 1);
  }
</style>