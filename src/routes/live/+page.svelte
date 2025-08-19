<script>
  import { onMount, onDestroy } from 'svelte';
  import StatCard from '$components/StatCard.svelte';
  import GameStatus from '$components/GameStatus.svelte';
  import QuarterStats from '$components/QuarterStats.svelte';
  import { lukaNbaApi } from '$utils/api.js';
  import { formatTime } from '$utils/formatters.js';

  /**
   * 실시간 게임 추적 페이지
   * @description 현재 진행 중인 경기의 루카 돈치치 실시간 스탯을 추적하는 페이지
   */

  let isLoading = true;
  let hasError = false;
  let errorMessage = '';
  let currentGame = null;
  let lukaLiveStats = null;
  let gameStatus = 'upcoming'; // 'upcoming', 'live', 'finished'
  let refreshInterval = null;
  let lastUpdated = null;

  const REFRESH_INTERVAL = 30000; // 30초마다 업데이트

  /**
   * 현재 진행 중인 게임 정보를 불러오는 함수
   * @returns {Promise<void>}
   */
  const loadCurrentGame = async () => {
    try {
      const game = await lukaNbaApi.getCurrentGame();
      if (game) {
        currentGame = game;
        gameStatus = game.status;
        await loadLiveStats();
      } else {
        gameStatus = 'upcoming';
        currentGame = await lukaNbaApi.getNextGame();
      }
    } catch (error) {
      console.error('현재 게임 정보 로드 실패:', error);
      hasError = true;
      errorMessage = '게임 정보를 불러오는데 실패했습니다.';
    }
  };

  /**
   * 루카의 실시간 스탯을 불러오는 함수
   * @returns {Promise<void>}
   */
  const loadLiveStats = async () => {
    if (!currentGame || gameStatus !== 'live') return;

    try {
      const stats = await lukaNbaApi.getLivePlayerStats(currentGame.id, 77);
      lukaLiveStats = stats;
      lastUpdated = new Date();
    } catch (error) {
      console.error('실시간 스탯 로드 실패:', error);
    }
  };

  /**
   * 데이터를 새로고침하는 함수
   * @returns {Promise<void>}
   */
  const refreshData = async () => {
    await loadCurrentGame();
  };

  /**
   * 자동 새로고침을 시작하는 함수
   * @returns {void}
   */
  const startAutoRefresh = () => {
    if (gameStatus === 'live') {
      refreshInterval = setInterval(refreshData, REFRESH_INTERVAL);
    }
  };

  /**
   * 자동 새로고침을 중지하는 함수
   * @returns {void}
   */
  const stopAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  };

  /**
   * 트리플 더블 달성 여부를 확인하는 함수
   * @param {Object} stats - 선수 통계 객체
   * @returns {boolean} 트리플 더블 달성 여부
   */
  const checkTripleDouble = (stats) => {
    if (!stats) return false;
    return stats.pts >= 10 && stats.reb >= 10 && stats.ast >= 10;
  };

  onMount(async () => {
    isLoading = true;
    await refreshData();
    startAutoRefresh();
    isLoading = false;
  });

  onDestroy(() => {
    stopAutoRefresh();
  });

  // gameStatus가 변경될 때마다 자동 새로고침 설정 업데이트
  $: {
    if (gameStatus === 'live') {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }
  }
</script>

<svelte:head>
  <title>실시간 게임 - Luka Tracker</title>
  <meta name="description" content="루카 돈치치의 현재 경기 실시간 스탯과 게임 현황을 실시간으로 확인하세요." />
</svelte:head>

<!-- 로딩 상태 -->
{#if isLoading}
  <div class="flex flex-col items-center justify-center min-h-96">
    <div class="loading-spinner w-12 h-12 mb-4"></div>
    <p class="text-gray-600 font-medium">실시간 게임 정보를 확인하는 중...</p>
  </div>

<!-- 에러 상태 -->
{:else if hasError}
  <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
    <div class="text-red-500 text-5xl mb-4">⚠️</div>
    <h2 class="text-lg font-semibold text-red-800 mb-2">데이터 로드 실패</h2>
    <p class="text-red-700 mb-4">{errorMessage}</p>
    <button on:click={refreshData} class="btn-primary">다시 시도</button>
  </div>

<!-- 메인 컨텐츠 -->
{:else}
  <div class="space-y-6">
    <!-- 페이지 헤더 -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">🔴 실시간 게임</h1>
        <p class="text-gray-600 mt-1">루카 돈치치 실시간 성과 추적</p>
      </div>
      
      <div class="flex items-center space-x-4 mt-4 lg:mt-0">
        {#if lastUpdated}
          <span class="text-sm text-gray-500">
            마지막 업데이트: {formatTime(lastUpdated)}
          </span>
        {/if}
        <button
          on:click={refreshData}
          class="btn-secondary"
          disabled={isLoading}
        >
          🔄 새로고침
        </button>
      </div>
    </div>

    <!-- 게임 상태에 따른 컨텐츠 -->
    {#if gameStatus === 'upcoming'}
      <!-- 예정된 게임 -->
      <div class="text-center py-12">
        <div class="text-6xl mb-4">⏰</div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">예정된 경기</h2>
        {#if currentGame}
          <p class="text-gray-600 mb-6">
            {currentGame.visitor_team.full_name} vs {currentGame.home_team.full_name}
          </p>
          <p class="text-lg font-semibold text-mavs-blue">
            {new Date(currentGame.date).toLocaleString('ko-KR')}
          </p>
        {:else}
          <p class="text-gray-600">현재 예정된 경기가 없습니다.</p>
        {/if}
      </div>

    {:else if gameStatus === 'live'}
      <!-- 진행 중인 게임 -->
      <div class="space-y-6">
        <!-- 게임 상태 카드 -->
        {#if currentGame}
          <GameStatus game={currentGame} />
        {/if}

        <!-- 트리플 더블 알림 -->
        {#if lukaLiveStats && checkTripleDouble(lukaLiveStats)}
          <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg animate-bounce-subtle">
            <div class="flex items-center">
              <div class="text-yellow-400 text-2xl mr-3">🔥</div>
              <div>
                <h3 class="text-lg font-semibold text-yellow-800">트리플 더블 달성!</h3>
                <p class="text-yellow-700">
                  {lukaLiveStats.pts}점 {lukaLiveStats.reb}리바운드 {lukaLiveStats.ast}어시스트
                </p>
              </div>
            </div>
          </div>
        {/if}

        <!-- 실시간 스탯 카드 -->
        {#if lukaLiveStats}
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="득점"
              value={lukaLiveStats.pts}
              unit="점"
              trend="live"
              icon="🏀"
            />
            
            <StatCard
              title="리바운드"
              value={lukaLiveStats.reb}
              unit="개"
              trend="live"
              icon="📈"
            />
            
            <StatCard
              title="어시스트"
              value={lukaLiveStats.ast}
              unit="개"
              trend="live"
              icon="🎯"
            />
            
            <StatCard
              title="야투 성공률"
              value={lukaLiveStats.fg_pct ? `${(lukaLiveStats.fg_pct * 100).toFixed(1)}` : '0.0'}
              unit="%"
              trend="live"
              icon="📊"
            />
          </div>

          <!-- 쿼터별 상세 스탯 -->
          <QuarterStats stats={lukaLiveStats.quarter_stats} />

          <!-- 추가 상세 스탯 -->
          <div class="card">
            <div class="card-header">
              <h3 class="text-lg font-semibold">📋 상세 통계</h3>
            </div>
            <div class="card-body">
              <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <span class="text-gray-600">출전시간</span>
                  <div class="font-semibold">{lukaLiveStats.min || 0}분</div>
                </div>
                <div>
                  <span class="text-gray-600">야투</span>
                  <div class="font-semibold">{lukaLiveStats.fgm || 0}/{lukaLiveStats.fga || 0}</div>
                </div>
                <div>
                  <span class="text-gray-600">3점슛</span>
                  <div class="font-semibold">{lukaLiveStats.fg3m || 0}/{lukaLiveStats.fg3a || 0}</div>
                </div>
                <div>
                  <span class="text-gray-600">자유투</span>
                  <div class="font-semibold">{lukaLiveStats.ftm || 0}/{lukaLiveStats.fta || 0}</div>
                </div>
                <div>
                  <span class="text-gray-600">스틸</span>
                  <div class="font-semibold">{lukaLiveStats.stl || 0}</div>
                </div>
                <div>
                  <span class="text-gray-600">블록</span>
                  <div class="font-semibold">{lukaLiveStats.blk || 0}</div>
                </div>
                <div>
                  <span class="text-gray-600">턴오버</span>
                  <div class="font-semibold">{lukaLiveStats.turnover || 0}</div>
                </div>
                <div>
                  <span class="text-gray-600">파울</span>
                  <div class="font-semibold">{lukaLiveStats.pf || 0}</div>
                </div>
              </div>
            </div>
          </div>
        {/if}
      </div>

    {:else if gameStatus === 'finished'}
      <!-- 종료된 게임 -->
      <div class="text-center py-12">
        <div class="text-6xl mb-4">✅</div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">경기 종료</h2>
        <p class="text-gray-600 mb-6">최근 경기 결과를 확인하세요.</p>
        <a href="/stats" class="btn-primary">
          상세 통계 보기
        </a>
      </div>
    {/if}

    <!-- 자동 새로고침 안내 -->
    {#if gameStatus === 'live'}
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <div class="flex items-center justify-center space-x-2 text-sm text-blue-700">
          <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span>30초마다 자동으로 업데이트됩니다</span>
        </div>
      </div>
    {/if}
  </div>
{/if}