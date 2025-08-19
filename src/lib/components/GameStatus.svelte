<script>
  import { formatGameDateTime } from '$utils/formatters.js';

  /**
   * 게임 상태 표시 컴포넌트
   * @description 현재 진행 중인 게임의 상태와 점수를 실시간으로 표시
   */

  /** @type {Object} 게임 정보 객체 */
  export let game = null;
  
  /** @type {boolean} 애니메이션 효과 사용 여부 */
  export let animated = true;

  /**
   * 쿼터/피리어드를 한국어로 변환하는 함수
   * @param {number} period - 쿼터/피리어드 번호
   * @returns {string} 한국어 쿼터 표시
   */
  const formatPeriod = (period) => {
    const periodMap = {
      1: '1쿼터',
      2: '2쿼터', 
      3: '3쿼터',
      4: '4쿼터'
    };
    
    if (period <= 4) {
      return periodMap[period] || `${period}쿼터`;
    } else {
      return `${period - 4}연장`;
    }
  };

  /**
   * 게임 상태에 따른 배경색 클래스를 반환하는 함수
   * @param {string} status - 게임 상태
   * @returns {string} Tailwind CSS 클래스
   */
  const getStatusBgClass = (status) => {
    const statusClasses = {
      'live': 'bg-red-50 border-red-200',
      'upcoming': 'bg-blue-50 border-blue-200',
      'finished': 'bg-gray-50 border-gray-200',
      'postponed': 'bg-yellow-50 border-yellow-200'
    };
    
    return statusClasses[status] || 'bg-gray-50 border-gray-200';
  };

  /**
   * 게임 상태에 따른 텍스트 색상 클래스를 반환하는 함수
   * @param {string} status - 게임 상태
   * @returns {string} Tailwind CSS 클래스
   */
  const getStatusTextClass = (status) => {
    const statusClasses = {
      'live': 'text-red-600',
      'upcoming': 'text-blue-600',
      'finished': 'text-gray-600',
      'postponed': 'text-yellow-600'
    };
    
    return statusClasses[status] || 'text-gray-600';
  };

  /**
   * 상대팀 정보를 가져오는 함수
   * @param {Object} game - 게임 객체
   * @returns {Object} 상대팀 정보
   */
  const getOpponent = (game) => {
    if (!game) return null;
    return game.home_team.abbreviation === 'DAL' ? game.visitor_team : game.home_team;
  };

  /**
   * 댈러스 매버릭스인지 확인하는 함수
   * @param {Object} team - 팀 객체
   * @returns {boolean} 댈러스 매버릭스 여부
   */
  const isDallasMavericks = (team) => {
    return team && (team.abbreviation === 'DAL' || team.name === 'Mavericks');
  };

  // 반응형 데이터
  $: gameDateTime = game ? formatGameDateTime(game.date) : null;
  $: opponent = getOpponent(game);
  $: statusBgClass = getStatusBgClass(game?.status);
  $: statusTextClass = getStatusTextClass(game?.status);
  $: isDallasHome = game ? isDallasMavericks(game.home_team) : false;
  $: dalScore = game ? (isDallasHome ? game.home_team_score : game.visitor_team_score) : 0;
  $: oppScore = game ? (isDallasHome ? game.visitor_team_score : game.home_team_score) : 0;
</script>

{#if game}
  <div class={`
    card ${statusBgClass}
    ${animated ? 'transition-all duration-300' : ''}
  `}>
    <!-- 게임 상태 헤더 -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center space-x-2">
        {#if game.status === 'live'}
          <span class="text-red-500 animate-pulse">🔴</span>
          <span class="font-semibold text-red-600">LIVE</span>
        {:else if game.status === 'upcoming'}
          <span class="text-blue-500">⏰</span>
          <span class="font-semibold text-blue-600">예정</span>
        {:else if game.status === 'finished'}
          <span class="text-gray-500">✅</span>
          <span class="font-semibold text-gray-600">종료</span>
        {/if}
      </div>
      
      {#if gameDateTime}
        <div class="text-right">
          <div class="text-sm font-medium text-gray-900">{gameDateTime.date}</div>
          <div class="text-xs text-gray-500">{gameDateTime.time}</div>
        </div>
      {/if}
    </div>

    <!-- 팀 정보 및 점수 -->
    <div class="grid grid-cols-3 items-center gap-4">
      <!-- 댈러스 매버릭스 -->
      <div class="text-center">
        <div class="mb-3">
          <div class="w-16 h-16 bg-mavs-blue rounded-full flex items-center justify-center mx-auto mb-2">
            <span class="text-white font-bold text-lg">DAL</span>
          </div>
          <div class="font-semibold text-gray-900">Dallas</div>
          <div class="text-sm text-gray-600">Mavericks</div>
        </div>
        
        {#if game.status === 'live' || game.status === 'finished'}
          <div class="text-3xl font-bold text-mavs-blue">
            {dalScore}
          </div>
        {/if}
      </div>

      <!-- 중앙 정보 -->
      <div class="text-center">
        {#if game.status === 'live'}
          <div class="mb-2">
            <span class={`text-sm font-semibold ${statusTextClass}`}>
              {formatPeriod(game.period)}
            </span>
          </div>
          {#if game.time}
            <div class="text-xs text-gray-600 mb-2">
              {game.time}
            </div>
          {/if}
        {:else if game.status === 'upcoming'}
          <div class="text-xs text-gray-500 mb-2">GAME TIME</div>
          {#if gameDateTime}
            <div class="font-semibold text-gray-900">{gameDateTime.time}</div>
          {/if}
        {:else}
          <div class="text-xs text-gray-500 mb-2">FINAL</div>
        {/if}
        
        <div class="text-2xl font-bold text-gray-400">VS</div>
      </div>

      <!-- 상대팀 -->
      <div class="text-center">
        {#if opponent}
          <div class="mb-3">
            <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
              <span class="text-gray-700 font-bold text-sm">{opponent.abbreviation}</span>
            </div>
            <div class="font-semibold text-gray-900">{opponent.city}</div>
            <div class="text-sm text-gray-600">{opponent.name}</div>
          </div>
          
          {#if game.status === 'live' || game.status === 'finished'}
            <div class="text-3xl font-bold text-gray-700">
              {oppScore}
            </div>
          {/if}
        {/if}
      </div>
    </div>

    <!-- 추가 게임 정보 -->
    {#if game.status === 'live'}
      <div class="mt-6 pt-4 border-t border-red-200">
        <div class="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div class="text-gray-600">시즌</div>
            <div class="font-semibold">{game.season}</div>
          </div>
          <div>
            <div class="text-gray-600">타입</div>
            <div class="font-semibold">{game.postseason ? '플레이오프' : '정규시즌'}</div>
          </div>
          <div>
            <div class="text-gray-600">상태</div>
            <div class="font-semibold text-red-600">진행 중</div>
          </div>
        </div>
      </div>
    {/if}

    <!-- 액션 버튼 -->
    {#if game.status === 'live'}
      <div class="mt-4 pt-4 border-t border-red-200">
        <div class="flex space-x-2">
          <a href="/live" class="flex-1 btn-primary text-center">
            실시간 스탯 보기
          </a>
          <button class="px-4 btn-secondary">
            📊
          </button>
        </div>
      </div>
    {/if}

    <!-- 실시간 애니메이션 효과 -->
    {#if game.status === 'live' && animated}
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5 animate-pulse"></div>
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-red-400 to-red-500 animate-pulse"></div>
      </div>
    {/if}
  </div>
{:else}
  <!-- 게임 정보가 없을 때 -->
  <div class="card p-6">
    <div class="text-center text-gray-500">
      <div class="text-4xl mb-2">🏀</div>
      <div class="font-semibold">게임 정보를 불러올 수 없습니다</div>
      <div class="text-sm mt-1">잠시 후 다시 시도해주세요</div>
    </div>
  </div>
{/if}

<style>
  .card {
    position: relative;
    overflow: hidden;
  }
</style>