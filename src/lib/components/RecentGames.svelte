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
  


  /**
   * 게임 결과를 판단하는 함수 (승/패)
   * @param {Object} game - 게임 객체
   * @returns {string} 'W' 또는 'L'
   */
  const getGameResult = (game) => {
    if (!game.home_team_score || !game.visitor_team_score) return 'N/A';
    
    // LA 레이커스가 홈팀인지 확인
    const isLakersHome = game.home_team.abbreviation === 'LAL';
    const lakersScore = isLakersHome ? game.home_team_score : game.visitor_team_score;
    const oppScore = isLakersHome ? game.visitor_team_score : game.home_team_score;
    
    return lakersScore > oppScore ? 'W' : 'L';
  };

  /**
   * 상대팀 정보를 가져오는 함수
   * @param {Object} game - 게임 객체
   * @returns {Object} 상대팀 정보
   */
  const getOpponent = (game) => {
    const isLakersHome = game.home_team.abbreviation === 'LAL';
    return isLakersHome ? game.visitor_team : game.home_team;
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
              <th class="px-4 py-3 text-center">홈/원정</th>
              <th class="px-4 py-3 text-center">점수</th>
              <th class="px-4 py-3 text-center">결과</th>
            </tr>
          </thead>
          
          <tbody class="divide-y divide-gray-200">
            {#each displayGames as game (game.id)}
              {@const gameResult = getGameResult(game)}
              {@const opponent = getOpponent(game)}
              {@const dateInfo = formatGameDateTime(game.date)}
              {@const isLakersHome = game.home_team.abbreviation === 'LAL'}
              {@const lakersScore = isLakersHome ? game.home_team_score : game.visitor_team_score}
              {@const oppScore = isLakersHome ? game.visitor_team_score : game.home_team_score}
              
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
                    <div class="text-xs text-gray-500">
                      {opponent.city}
                    </div>
                  </div>
                </td>

                <!-- 홈/원정 -->
                <td class="px-4 py-4 text-center">
                  <span class="text-sm text-gray-600">
                    {isLakersHome ? 'HOME' : 'AWAY'}
                  </span>
                </td>

                <!-- 점수 -->
                <td class="px-4 py-4 text-center">
                  <div class="text-sm font-medium">
                    <span class={gameResult === 'W' ? 'text-green-600' : 'text-red-600'}>
                      {lakersScore}
                    </span>
                    <span class="text-gray-400 mx-1">-</span>
                    <span class="text-gray-600">{oppScore}</span>
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
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- 팀 성과 요약 -->
      <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div>
            <div class="text-sm text-gray-600">총 경기</div>
            <div class="text-lg font-semibold text-mavs-blue">
              {displayGames.length}경기
            </div>
          </div>
          
          <div>
            <div class="text-sm text-gray-600">승수</div>
            <div class="text-lg font-semibold text-green-600">
              {displayGames.filter(game => getGameResult(game) === 'W').length}승
            </div>
          </div>
          
          <div>
            <div class="text-sm text-gray-600">패수</div>
            <div class="text-lg font-semibold text-red-600">
              {displayGames.filter(game => getGameResult(game) === 'L').length}패
            </div>
          </div>
          
          <div>
            <div class="text-sm text-gray-600">승률</div>
            <div class="text-lg font-semibold text-mavs-blue">
              {displayGames.length > 0 
                ? ((displayGames.filter(game => getGameResult(game) === 'W').length / displayGames.length) * 100).toFixed(1)
                : '0.0'
              }%
            </div>
          </div>
        </div>
      </div>
    {:else}
      <!-- 데이터 없음 -->
      <div class="p-8 text-center text-gray-500">
        <div class="text-4xl mb-4">📊</div>
        <div class="text-lg font-medium mb-2">최근 경기 데이터가 없습니다</div>
        <div class="text-sm">
          현재 시즌이 시작되지 않았거나<br>
          API 요청 제한에 도달했을 수 있습니다
        </div>
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