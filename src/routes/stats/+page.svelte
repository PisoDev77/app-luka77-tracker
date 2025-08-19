<script>
  import { onMount } from 'svelte';
  import StatsChart from '$components/StatsChart.svelte';
  import SeasonSelector from '$components/SeasonSelector.svelte';
  import StatComparisonTable from '$components/StatComparisonTable.svelte';
  import { lukaNbaApi } from '$utils/api.js';
  import { formatNumber, formatPercentage } from '$utils/formatters.js';

  /**
   * 통계 분석 페이지
   * @description 루카 돈치치의 시즌별, 월별 통계 분석과 시각화를 제공하는 페이지
   */

  let isLoading = true;
  let hasError = false;
  let selectedSeason = '2023-24';
  let availableSeasons = [];
  let seasonStats = null;
  let monthlyStats = [];
  let homeAwayStats = null;
  let opponentStats = [];

  /**
   * 사용 가능한 시즌 목록을 불러오는 함수
   * @returns {Promise<void>}
   */
  const loadAvailableSeasons = async () => {
    try {
      const seasons = await lukaNbaApi.getAvailableSeasons();
      availableSeasons = seasons;
    } catch (error) {
      console.error('시즌 목록 로드 실패:', error);
    }
  };

  /**
   * 선택된 시즌의 상세 통계를 불러오는 함수
   * @returns {Promise<void>}
   */
  const loadSeasonStats = async () => {
    try {
      const stats = await lukaNbaApi.getSeasonStats(selectedSeason);
      seasonStats = stats;
    } catch (error) {
      console.error('시즌 통계 로드 실패:', error);
    }
  };

  /**
   * 월별 통계 데이터를 불러오는 함수
   * @returns {Promise<void>}
   */
  const loadMonthlyStats = async () => {
    try {
      const stats = await lukaNbaApi.getMonthlyStats(selectedSeason);
      monthlyStats = stats;
    } catch (error) {
      console.error('월별 통계 로드 실패:', error);
    }
  };

  /**
   * 홈/어웨이 통계를 불러오는 함수
   * @returns {Promise<void>}
   */
  const loadHomeAwayStats = async () => {
    try {
      const stats = await lukaNbaApi.getHomeAwayStats(selectedSeason);
      homeAwayStats = stats;
    } catch (error) {
      console.error('홈/어웨이 통계 로드 실패:', error);
    }
  };

  /**
   * 상대팀별 통계를 불러오는 함수
   * @returns {Promise<void>}
   */
  const loadOpponentStats = async () => {
    try {
      const stats = await lukaNbaApi.getOpponentStats(selectedSeason);
      opponentStats = stats;
    } catch (error) {
      console.error('상대팀별 통계 로드 실패:', error);
    }
  };

  /**
   * 모든 통계 데이터를 로드하는 함수
   * @returns {Promise<void>}
   */
  const loadAllStats = async () => {
    isLoading = true;
    hasError = false;

    try {
      await Promise.all([
        loadAvailableSeasons(),
        loadSeasonStats(),
        loadMonthlyStats(),
        loadHomeAwayStats(),
        loadOpponentStats()
      ]);
    } catch (error) {
      console.error('통계 데이터 로드 실패:', error);
      hasError = true;
    } finally {
      isLoading = false;
    }
  };

  /**
   * 시즌이 변경될 때 실행되는 함수
   * @param {string} newSeason - 새로 선택된 시즌
   * @returns {Promise<void>}
   */
  const handleSeasonChange = async (newSeason) => {
    selectedSeason = newSeason;
    await loadAllStats();
  };

  /**
   * 효율성 등급을 계산하는 함수 (PER 기반)
   * @param {Object} stats - 선수 통계 객체
   * @returns {string} 효율성 등급 (A+, A, B+, B, C)
   */
  const calculateEfficiencyRating = (stats) => {
    if (!stats) return 'N/A';
    
    // 간단한 PER 계산 (실제 PER는 더 복잡함)
    const per = (stats.pts + stats.reb + stats.ast + stats.stl + stats.blk - stats.turnover) / stats.gp;
    
    if (per >= 25) return 'A+';
    if (per >= 22) return 'A';
    if (per >= 19) return 'B+';
    if (per >= 16) return 'B';
    return 'C';
  };

  onMount(() => {
    loadAllStats();
  });
</script>

<svelte:head>
  <title>통계 분석 - Luka Tracker</title>
  <meta name="description" content="루카 돈치치의 시즌별, 월별 상세 통계 분석과 시각화 차트를 확인하세요." />
</svelte:head>

<!-- 로딩 상태 -->
{#if isLoading}
  <div class="flex flex-col items-center justify-center min-h-96">
    <div class="loading-spinner w-12 h-12 mb-4"></div>
    <p class="text-gray-600 font-medium">통계 데이터를 분석하는 중...</p>
  </div>

<!-- 에러 상태 -->
{:else if hasError}
  <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
    <div class="text-red-500 text-5xl mb-4">📊</div>
    <h2 class="text-lg font-semibold text-red-800 mb-2">통계 분석 실패</h2>
    <p class="text-red-700 mb-4">데이터를 불러오는데 문제가 발생했습니다.</p>
    <button on:click={loadAllStats} class="btn-primary">다시 시도</button>
  </div>

<!-- 메인 컨텐츠 -->
{:else}
  <div class="space-y-8">
    <!-- 페이지 헤더 -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">📊 통계 분석</h1>
        <p class="text-gray-600 mt-1">루카 돈치치 상세 성과 분석</p>
      </div>
      
      <!-- 시즌 선택기 -->
      <div class="mt-4 lg:mt-0">
        <SeasonSelector
          seasons={availableSeasons}
          selected={selectedSeason}
          on:change={({ detail }) => handleSeasonChange(detail)}
        />
      </div>
    </div>

    <!-- 시즌 개요 카드 -->
    {#if seasonStats}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 주요 통계 -->
        <div class="col-span-2">
          <div class="card">
            <div class="card-header">
              <h3 class="text-lg font-semibold">🏀 {selectedSeason} 시즌 주요 통계</h3>
            </div>
            <div class="card-body">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="text-center">
                  <div class="text-2xl font-bold text-mavs-blue">{formatNumber(seasonStats.pts, 1)}</div>
                  <div class="text-sm text-gray-600">평균 득점</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-mavs-blue">{formatNumber(seasonStats.reb, 1)}</div>
                  <div class="text-sm text-gray-600">평균 리바운드</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-mavs-blue">{formatNumber(seasonStats.ast, 1)}</div>
                  <div class="text-sm text-gray-600">평균 어시스트</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-mavs-blue">{formatPercentage(seasonStats.fg_pct)}</div>
                  <div class="text-sm text-gray-600">야투율</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 효율성 등급 -->
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold">⭐ 효율성 등급</h3>
          </div>
          <div class="card-body text-center">
            <div class="text-4xl font-bold text-mavs-blue mb-2">
              {calculateEfficiencyRating(seasonStats)}
            </div>
            <div class="text-sm text-gray-600">종합 효율성</div>
            <div class="mt-4 text-xs text-gray-500">
              경기당 종합 기여도 기준
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- 월별 통계 차트 -->
    {#if monthlyStats.length > 0}
      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-semibold">📈 월별 성과 트렌드</h3>
          <p class="text-sm text-gray-600 mt-1">시즌 내 월별 주요 통계 변화</p>
        </div>
        <div class="card-body">
          <StatsChart
            data={monthlyStats}
            type="monthly"
            metrics={['pts', 'reb', 'ast']}
          />
        </div>
      </div>
    {/if}

    <!-- 홈/어웨이 비교 -->
    {#if homeAwayStats}
      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-semibold">🏠 홈 vs 어웨이 성과</h3>
        </div>
        <div class="card-body">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- 홈 경기 -->
            <div>
              <h4 class="font-semibold text-mavs-blue mb-4">🏠 홈 경기</h4>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span>평균 득점</span>
                  <span class="font-semibold">{formatNumber(homeAwayStats.home.pts, 1)}점</span>
                </div>
                <div class="flex justify-between">
                  <span>평균 리바운드</span>
                  <span class="font-semibold">{formatNumber(homeAwayStats.home.reb, 1)}개</span>
                </div>
                <div class="flex justify-between">
                  <span>평균 어시스트</span>
                  <span class="font-semibold">{formatNumber(homeAwayStats.home.ast, 1)}개</span>
                </div>
                <div class="flex justify-between">
                  <span>야투율</span>
                  <span class="font-semibold">{formatPercentage(homeAwayStats.home.fg_pct)}%</span>
                </div>
              </div>
            </div>

            <!-- 어웨이 경기 -->
            <div>
              <h4 class="font-semibold text-gray-600 mb-4">✈️ 어웨이 경기</h4>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span>평균 득점</span>
                  <span class="font-semibold">{formatNumber(homeAwayStats.away.pts, 1)}점</span>
                </div>
                <div class="flex justify-between">
                  <span>평균 리바운드</span>
                  <span class="font-semibold">{formatNumber(homeAwayStats.away.reb, 1)}개</span>
                </div>
                <div class="flex justify-between">
                  <span>평균 어시스트</span>
                  <span class="font-semibold">{formatNumber(homeAwayStats.away.ast, 1)}개</span>
                </div>
                <div class="flex justify-between">
                  <span>야투율</span>
                  <span class="font-semibold">{formatPercentage(homeAwayStats.away.fg_pct)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- 상대팀별 성적 -->
    {#if opponentStats.length > 0}
      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-semibold">🎯 상대팀별 성적</h3>
          <p class="text-sm text-gray-600 mt-1">주요 상대팀 대상 평균 통계</p>
        </div>
        <div class="card-body">
          <StatComparisonTable stats={opponentStats} />
        </div>
      </div>
    {/if}

    <!-- 시즌 하이라이트 -->
    {#if seasonStats}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold">🏆 시즌 최고 기록</h3>
          </div>
          <div class="card-body space-y-3">
            <div class="flex justify-between">
              <span>최고 득점</span>
              <span class="font-bold text-green-600">{seasonStats.career_high_pts || 'N/A'}점</span>
            </div>
            <div class="flex justify-between">
              <span>최고 리바운드</span>
              <span class="font-bold text-blue-600">{seasonStats.career_high_reb || 'N/A'}개</span>
            </div>
            <div class="flex justify-between">
              <span>최고 어시스트</span>
              <span class="font-bold text-purple-600">{seasonStats.career_high_ast || 'N/A'}개</span>
            </div>
            <div class="flex justify-between">
              <span>트리플 더블</span>
              <span class="font-bold text-orange-600">{seasonStats.triple_doubles || 0}회</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold">📋 추가 통계</h3>
          </div>
          <div class="card-body space-y-3">
            <div class="flex justify-between">
              <span>경기 출전</span>
              <span class="font-semibold">{seasonStats.gp || 0}경기</span>
            </div>
            <div class="flex justify-between">
              <span>평균 출전시간</span>
              <span class="font-semibold">{formatNumber(seasonStats.min, 1)}분</span>
            </div>
            <div class="flex justify-between">
              <span>3점 성공률</span>
              <span class="font-semibold">{formatPercentage(seasonStats.fg3_pct)}%</span>
            </div>
            <div class="flex justify-between">
              <span>자유투 성공률</span>
              <span class="font-semibold">{formatPercentage(seasonStats.ft_pct)}%</span>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
{/if}