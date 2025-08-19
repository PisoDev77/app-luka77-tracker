<script>
  import { onMount } from 'svelte';
  import StatCard from '$components/StatCard.svelte';
  import GameSchedule from '$components/GameSchedule.svelte';
  import RecentGames from '$components/RecentGames.svelte';
  import { freeNbaApi } from '$utils/api-free.js';
  import { formatNumber, formatPercentage } from '$utils/formatters.js';

  /**
   * 대시보드 메인 페이지 컴포넌트
   * @description 루카 돈치치의 현재 시즌 주요 통계와 최근 경기 정보를 보여주는 페이지
   */

  let isLoading = true;
  let hasError = false;
  let errorMessage = '';
  let currentSeasonStats = null;
  let nextGame = null;
  let recentGames = [];
  let tripleDoubleCount = 0;

  /**
   * 루카의 현재 시즌 통계를 불러오는 함수
   * @returns {Promise<void>}
   */
  const loadCurrentSeasonStats = async () => {
    try {
      const stats = await lukaNbaApi.getCurrentSeasonStats();
      currentSeasonStats = stats;
    } catch (error) {
      console.error('시즌 통계 로드 실패:', error);
      hasError = true;
      errorMessage = '시즌 통계를 불러오는데 실패했습니다.';
    }
  };

  /**
   * 다음 경기 정보를 불러오는 함수
   * @returns {Promise<void>}
   */
  const loadNextGame = async () => {
    try {
      const game = await lukaNbaApi.getNextGame();
      nextGame = game;
    } catch (error) {
      console.error('다음 경기 정보 로드 실패:', error);
    }
  };

  /**
   * 최근 5경기 정보를 불러오는 함수
   * @returns {Promise<void>}
   */
  const loadRecentGames = async () => {
    try {
      const games = await lukaNbaApi.getRecentGames(5);
      recentGames = games;
      
      // 트리플 더블 횟수 계산
      tripleDoubleCount = games.filter(game => {
        const stats = game.player_stats;
        return (
          stats.pts >= 10 &&
          stats.reb >= 10 &&
          stats.ast >= 10
        );
      }).length;
    } catch (error) {
      console.error('최근 경기 정보 로드 실패:', error);
    }
  };

  /**
   * 모든 데이터를 병렬로 로드하는 함수
   * @returns {Promise<void>}
   */
  const loadDashboardData = async () => {
    isLoading = true;
    hasError = false;

    try {
      await Promise.all([
        loadCurrentSeasonStats(),
        loadNextGame(),
        loadRecentGames()
      ]);
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
      hasError = true;
      errorMessage = '데이터를 불러오는데 실패했습니다. 새로고침해주세요.';
    } finally {
      isLoading = false;
    }
  };

  onMount(() => {
    loadDashboardData();
  });
</script>

<svelte:head>
  <title>Luka Tracker - 루카 돈치치 실시간 스탯</title>
  <meta name="description" content="루카 돈치치의 현재 시즌 통계, 다음 경기 일정, 최근 성과를 한눈에 확인하세요." />
</svelte:head>

<!-- 로딩 상태 -->
{#if isLoading}
  <div class="flex flex-col items-center justify-center min-h-96">
    <div class="loading-spinner w-12 h-12 mb-4"></div>
    <p class="text-gray-600 font-medium">루카의 최신 데이터를 불러오는 중...</p>
  </div>

<!-- 에러 상태 -->
{:else if hasError}
  <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
    <div class="text-red-500 text-5xl mb-4">⚠️</div>
    <h2 class="text-lg font-semibold text-red-800 mb-2">데이터 로드 실패</h2>
    <p class="text-red-700 mb-4">{errorMessage}</p>
    <button
      on:click={loadDashboardData}
      class="btn-primary"
    >
      다시 시도
    </button>
  </div>

<!-- 메인 대시보드 -->
{:else}
  <div class="space-y-8">
    <!-- 헤더 -->
    <div class="text-center space-y-2">
      <h1 class="text-4xl font-bold text-gradient">Luka Tracker</h1>
      <p class="text-lg text-gray-600">루카 돈치치 NBA 성과 실시간 추적</p>
      <div class="flex items-center justify-center space-x-2 text-sm text-gray-500">
        <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse-slow"></span>
        <span>실시간 업데이트</span>
        <span>•</span>
        <span>{new Date().toLocaleDateString('ko-KR')}</span>
      </div>
    </div>

    <!-- 주요 통계 카드 -->
    {#if currentSeasonStats}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="평균 득점"
          value={formatNumber(currentSeasonStats.pts, 1)}
          unit="점"
          change={currentSeasonStats.pts_change}
          trend={currentSeasonStats.pts_change > 0 ? 'up' : 'down'}
          icon="🏀"
        />
        
        <StatCard
          title="평균 리바운드"
          value={formatNumber(currentSeasonStats.reb, 1)}
          unit="개"
          change={currentSeasonStats.reb_change}
          trend={currentSeasonStats.reb_change > 0 ? 'up' : 'down'}
          icon="📈"
        />
        
        <StatCard
          title="평균 어시스트"
          value={formatNumber(currentSeasonStats.ast, 1)}
          unit="개"
          change={currentSeasonStats.ast_change}
          trend={currentSeasonStats.ast_change > 0 ? 'up' : 'down'}
          icon="🎯"
        />
        
        <StatCard
          title="야투율"
          value={formatPercentage(currentSeasonStats.fg_pct)}
          unit="%"
          change={currentSeasonStats.fg_pct_change}
          trend={currentSeasonStats.fg_pct_change > 0 ? 'up' : 'down'}
          icon="📊"
        />
      </div>
    {/if}

    <!-- 트리플 더블 & 다음 경기 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 트리플 더블 카운터 -->
      <div class="card p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">🔥 트리플 더블</h3>
          <span class="text-xs text-gray-500">최근 5경기</span>
        </div>
        <div class="text-center">
          <div class="text-4xl font-bold text-mavs-blue mb-2">{tripleDoubleCount}</div>
          <div class="text-sm text-gray-600">
            {tripleDoubleCount > 0 ? `${tripleDoubleCount}회 달성!` : '아직 달성하지 못했어요'}
          </div>
        </div>
      </div>

      <!-- 다음 경기 -->
      {#if nextGame}
        <GameSchedule game={nextGame} />
      {:else}
        <div class="card p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">📅 다음 경기</h3>
          <div class="text-center text-gray-500">
            <div class="text-4xl mb-2">📆</div>
            <div>예정된 경기가 없습니다</div>
          </div>
        </div>
      {/if}
    </div>

    <!-- 최근 경기 결과 -->
    {#if recentGames.length > 0}
      <RecentGames games={recentGames} />
    {/if}

    <!-- 빠른 액션 버튼 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <a
        href="/live"
        class="btn-primary p-4 text-center rounded-lg hover:scale-105 transform transition-transform duration-200"
      >
        <div class="text-2xl mb-2">🔴</div>
        <div class="font-semibold">실시간 경기</div>
        <div class="text-xs opacity-90">현재 경기 추적</div>
      </a>
      
      <a
        href="/stats"
        class="btn-secondary p-4 text-center rounded-lg hover:scale-105 transform transition-transform duration-200"
      >
        <div class="text-2xl mb-2">📊</div>
        <div class="font-semibold">상세 통계</div>
        <div class="text-xs opacity-75">시즌별 분석</div>
      </a>
      
      <a
        href="/records"
        class="btn-ghost p-4 text-center rounded-lg hover:scale-105 transform transition-transform duration-200 border border-gray-300"
      >
        <div class="text-2xl mb-2">🏆</div>
        <div class="font-semibold">기록실</div>
        <div class="text-xs opacity-75">커리어 하이라이트</div>
      </a>
    </div>
  </div>
{/if}