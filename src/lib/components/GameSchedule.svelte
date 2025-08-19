<script>
  import { onDestroy } from 'svelte';
  import { formatGameDateTime } from '$utils/formatters.js';

  /**
   * 게임 일정 카드 컴포넌트
   * @description 다음 경기 또는 특정 경기 일정을 표시하는 컴포넌트
   */

  /** @type {Object} 게임 정보 객체 */
  export let game = null;
  
  /** @type {boolean} 컴팩트 모드 여부 */
  export let isCompact = false;
  
  /** @type {boolean} 카운트다운 표시 여부 */
  export let showCountdown = true;

  /** @type {number} 남은 시간 (밀리초) */
  let timeRemaining = 0;
  
  /** @type {string} 카운트다운 텍스트 */
  let countdownText = '';
  
  /** @type {boolean} 게임이 오늘인지 여부 */
  let isToday = false;
  
  /** @type {boolean} 게임이 진행 중인지 여부 */
  let isLive = false;

  /**
   * 카운트다운을 업데이트하는 함수
   * @returns {void}
   */
  const updateCountdown = () => {
    if (!game || !showCountdown) return;
    
    const now = new Date().getTime();
    const gameTime = new Date(game.date).getTime();
    const diff = gameTime - now;
    
    timeRemaining = diff;
    isToday = new Date(game.date).toDateString() === new Date().toDateString();
    isLive = game.status === 'live';
    
    if (diff <= 0 && !isLive) {
      countdownText = '경기 시작!';
    } else if (isLive) {
      countdownText = '경기 진행 중';
    } else {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        countdownText = `${days}일 ${hours}시간 후`;
      } else if (hours > 0) {
        countdownText = `${hours}시간 ${minutes}분 후`;
      } else {
        countdownText = `${minutes}분 후`;
      }
    }
  };

  /**
   * 팀 로고 URL을 생성하는 함수 (모의 구현)
   * @param {string} teamAbbr - 팀 약어
   * @returns {string} 로고 URL
   */
  const getTeamLogo = (teamAbbr) => {
    // 실제 구현에서는 팀 로고 URL을 반환
    return `/logos/${teamAbbr.toLowerCase()}.png`;
  };

  /**
   * 경기 날짜 및 시간 정보
   */
  $: gameDateTime = game ? formatGameDateTime(game.date) : null;

  // 1초마다 카운트다운 업데이트
  if (typeof window !== 'undefined' && showCountdown) {
    const interval = setInterval(updateCountdown, 1000);
    updateCountdown(); // 초기 실행
    
    // 컴포넌트 언마운트 시 인터벌 정리
    onDestroy(() => clearInterval(interval));
  }
</script>

{#if game}
  <div class={`
    card 
    ${isCompact ? 'p-4' : 'p-6'} 
    ${isToday ? 'ring-2 ring-mavs-blue ring-opacity-50' : ''}
    ${isLive ? 'bg-red-50 border-red-200' : ''}
  `}>
    <!-- 헤더 -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900 flex items-center space-x-2">
        {#if isLive}
          <span class="text-red-500 animate-pulse">🔴</span>
          <span>실시간 경기</span>
        {:else}
          <span>📅</span>
          <span>다음 경기</span>
        {/if}
      </h3>
      
      {#if gameDateTime && !isCompact}
        <div class="text-right">
          <div class="text-sm font-medium text-gray-900">{gameDateTime.date}</div>
          <div class="text-xs text-gray-500">{gameDateTime.dayOfWeek}</div>
        </div>
      {/if}
    </div>

    <!-- 팀 정보 -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <!-- 원정팀 -->
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <span class="text-xs font-semibold text-gray-600">
              {game.visitor_team?.abbreviation || 'TBD'}
            </span>
          </div>
          <div>
            <div class="font-semibold text-gray-900">
              {game.visitor_team?.city || '미정'}
            </div>
            <div class="text-sm text-gray-600">
              {game.visitor_team?.name || ''}
            </div>
          </div>
        </div>

        <!-- VS 또는 점수 -->
        <div class="text-center px-4">
          {#if isLive && game.visitor_team_score !== undefined}
            <div class="text-xs text-gray-500 mb-1">SCORE</div>
            <div class="text-lg font-bold">
              {game.visitor_team_score} - {game.home_team_score}
            </div>
          {:else}
            <div class="text-2xl font-bold text-gray-400">VS</div>
          {/if}
        </div>

        <!-- 홈팀 -->
        <div class="flex items-center space-x-3">
          <div>
            <div class="font-semibold text-gray-900 text-right">
              {game.home_team?.city || '미정'}
            </div>
            <div class="text-sm text-gray-600 text-right">
              {game.home_team?.name || ''}
            </div>
          </div>
          <div class="w-8 h-8 bg-mavs-blue rounded-full flex items-center justify-center">
            <span class="text-xs font-semibold text-white">
              {game.home_team?.abbreviation || 'TBD'}
            </span>
          </div>
        </div>
      </div>

      <!-- 시간 정보 -->
      {#if gameDateTime}
        <div class="text-center pt-3 border-t border-gray-200">
          {#if isLive}
            <div class="text-sm font-semibold text-red-600">
              {game.period || 1}쿼터 진행 중
            </div>
            {#if game.time}
              <div class="text-xs text-gray-600 mt-1">
                남은 시간: {game.time}
              </div>
            {/if}
          {:else}
            <div class="text-sm font-semibold text-gray-900">
              {gameDateTime.time}
            </div>
            {#if showCountdown && countdownText}
              <div class={`
                text-xs font-medium mt-1
                ${isToday ? 'text-mavs-blue' : 'text-gray-500'}
              `}>
                {countdownText}
              </div>
            {/if}
          {/if}
        </div>
      {/if}

      <!-- 추가 정보 -->
      {#if !isCompact}
        <div class="pt-3 border-t border-gray-200">
          <div class="flex justify-between text-xs text-gray-500">
            <span>
              {game.postseason ? '플레이오프' : '정규시즌'}
            </span>
            <span>
              {game.season || '2025'} 시즌
            </span>
          </div>
        </div>
      {/if}
    </div>

    <!-- 액션 버튼 -->
    {#if !isCompact}
      <div class="mt-4 pt-4 border-t border-gray-200">
        <div class="flex space-x-2">
          {#if isLive}
            <a 
              href="/live" 
              class="flex-1 btn-primary text-center"
            >
              실시간 보기
            </a>
          {:else}
            <button class="flex-1 btn-secondary text-center">
              알림 설정
            </button>
          {/if}
          
          <button class="px-3 btn-ghost">
            📅
          </button>
        </div>
      </div>
    {/if}

    <!-- 오늘 경기 강조 효과 -->
    {#if isToday && !isLive}
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-2 right-2 w-2 h-2 bg-mavs-blue rounded-full animate-pulse"></div>
      </div>
    {/if}

    <!-- 실시간 경기 애니메이션 -->
    {#if isLive}
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5 animate-pulse"></div>
      </div>
    {/if}
  </div>
{:else}
  <!-- 게임 정보가 없을 때 -->
  <div class="card p-6">
    <div class="text-center text-gray-500">
      <div class="text-4xl mb-2">📅</div>
      <div class="text-sm">예정된 경기가 없습니다</div>
    </div>
  </div>
{/if}

<style>
  .card {
    position: relative;
    overflow: hidden;
  }
</style>