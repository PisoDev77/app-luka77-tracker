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

  /**
   * 루카의 현재 시즌 통계를 불러오는 함수
   * @returns {Promise<void>}
   */
  const loadCurrentSeasonStats = async () => {
    try {
      const [lukaInfo, teamStanding] = await Promise.all([
        freeNbaApi.getLukaInfo(),
        freeNbaApi.getLakersStanding()
      ]);
      
      currentSeasonStats = {
        player: lukaInfo,
        team: teamStanding
      };
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      hasError = true;
      errorMessage = 'API 요청 한계에 도달했습니다.';
    }
  };

  /**
   * 다음 경기 정보를 불러오는 함수
   * @returns {Promise<void>}
   */
  const loadNextGame = async () => {
    try {
      const game = await freeNbaApi.getNextGame();
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
      const games = await freeNbaApi.getRecentGames(5);
      recentGames = games;
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

    <!-- 루카 돈치치 기본 정보 -->
    {#if currentSeasonStats && currentSeasonStats.player}
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">👤 선수 정보</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="mb-2"><strong>이름:</strong> {currentSeasonStats.player.first_name} {currentSeasonStats.player.last_name}</p>
            <p class="mb-2"><strong>포지션:</strong> {currentSeasonStats.player.position || 'PG-SG'}</p>
            <p class="mb-2"><strong>신장:</strong> {currentSeasonStats.player.height_feet || 6}ft {currentSeasonStats.player.height_inches || 7}in</p>
            <p><strong>체중:</strong> {currentSeasonStats.player.weight_pounds || 230}lbs</p>
          </div>
          {#if currentSeasonStats.team}
            <div>
              <p class="mb-2"><strong>팀:</strong> {currentSeasonStats.team.team.full_name}</p>
              <p class="mb-2"><strong>시즌 기록:</strong> {currentSeasonStats.team.wins}승 {currentSeasonStats.team.losses}패</p>
              <p class="mb-2"><strong>승률:</strong> {(currentSeasonStats.team.win_percentage * 100).toFixed(1)}%</p>
              <p><strong>컨퍼런스 순위:</strong> {currentSeasonStats.team.conference_rank || 'N/A'}위</p>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- 다음 경기 정보만 표시 -->
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

    <!-- 최근 경기 결과 -->
    {#if recentGames.length > 0}
      <RecentGames games={recentGames} />
    {/if}

  </div>
{/if}