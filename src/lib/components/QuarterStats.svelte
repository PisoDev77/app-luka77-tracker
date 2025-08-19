<script>
  /**
   * 쿼터별 통계 표시 컴포넌트
   * @description 경기 중 쿼터별 루카의 세부 스탯을 시각적으로 표시
   */

  /** @type {Array} 쿼터별 통계 배열 */
  export let stats = [];
  
  /** @type {boolean} 컴팩트 모드 여부 */
  export let isCompact = false;

  /**
   * 쿼터별 최고 득점을 찾는 함수
   * @param {Array} quarterStats - 쿼터별 통계 배열
   * @returns {number} 최고 득점
   */
  const getMaxPoints = (quarterStats) => {
    if (!quarterStats || quarterStats.length === 0) return 0;
    return Math.max(...quarterStats.map(stat => stat.pts || 0));
  };

  /**
   * 진행률을 계산하는 함수 (최대값 대비 백분율)
   * @param {number} value - 현재 값
   * @param {number} maxValue - 최대값
   * @returns {number} 진행률 (0-100)
   */
  const calculateProgress = (value, maxValue) => {
    if (!maxValue) return 0;
    return Math.min((value / maxValue) * 100, 100);
  };

  /**
   * 야투 성공률을 계산하는 함수
   * @param {number} made - 성공 수
   * @param {number} attempted - 시도 수
   * @returns {number} 성공률 (0-1)
   */
  const calculateFgPercentage = (made, attempted) => {
    if (!attempted) return 0;
    return made / attempted;
  };

  // 반응형 데이터
  $: maxPoints = getMaxPoints(stats);
  $: totalStats = stats.reduce((total, quarter) => ({
    pts: total.pts + (quarter.pts || 0),
    reb: total.reb + (quarter.reb || 0),
    ast: total.ast + (quarter.ast || 0),
    fg_made: total.fg_made + (quarter.fg_made || 0),
    fg_attempted: total.fg_attempted + (quarter.fg_attempted || 0),
    minutes_played: total.minutes_played + (quarter.minutes_played || 0)
  }), { pts: 0, reb: 0, ast: 0, fg_made: 0, fg_attempted: 0, minutes_played: 0 });
</script>

{#if stats && stats.length > 0}
  <div class="card">
    <div class="card-header">
      <h3 class="text-lg font-semibold flex items-center space-x-2">
        <span>📊</span>
        <span>쿼터별 상세 스탯</span>
      </h3>
      <div class="text-sm text-gray-500">
        실시간 쿼터별 성과 분석
      </div>
    </div>
    
    <div class="card-body">
      <!-- 쿼터별 상세 통계 -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        {#each stats as quarterStat (quarterStat.quarter)}
          <div class="bg-gray-50 rounded-lg p-4 border">
            <!-- 쿼터 헤더 -->
            <div class="text-center mb-3">
              <h4 class="text-sm font-semibold text-gray-700">
                {quarterStat.quarter}쿼터
              </h4>
              <div class="text-xs text-gray-500">
                {quarterStat.minutes_played || 0}분 출전
              </div>
            </div>

            <!-- 주요 스탯 -->
            <div class="space-y-3">
              <!-- 득점 -->
              <div>
                <div class="flex justify-between items-center mb-1">
                  <span class="text-xs text-gray-600">득점</span>
                  <span class="text-sm font-bold text-mavs-blue">
                    {quarterStat.pts || 0}점
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-mavs-blue h-2 rounded-full transition-all duration-500"
                    style="width: {calculateProgress(quarterStat.pts || 0, maxPoints)}%"
                  ></div>
                </div>
              </div>

              <!-- 리바운드 & 어시스트 -->
              <div class="grid grid-cols-2 gap-3">
                <div class="text-center">
                  <div class="text-lg font-bold text-gray-900">{quarterStat.reb || 0}</div>
                  <div class="text-xs text-gray-600">리바운드</div>
                </div>
                <div class="text-center">
                  <div class="text-lg font-bold text-gray-900">{quarterStat.ast || 0}</div>
                  <div class="text-xs text-gray-600">어시스트</div>
                </div>
              </div>

              <!-- 야투 정보 -->
              {#if !isCompact}
                <div class="pt-2 border-t border-gray-200">
                  <div class="text-center">
                    <div class="text-sm font-semibold">
                      {quarterStat.fg_made || 0}/{quarterStat.fg_attempted || 0}
                    </div>
                    <div class="text-xs text-gray-600">
                      {(calculateFgPercentage(quarterStat.fg_made, quarterStat.fg_attempted) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>

      <!-- 쿼터별 비교 차트 -->
      <div class="border-t pt-6">
        <h4 class="text-sm font-semibold text-gray-700 mb-4">쿼터별 득점 추이</h4>
        <div class="flex items-end justify-between h-24 bg-gray-50 rounded-lg p-4">
          {#each stats as quarterStat, index (quarterStat.quarter)}
            <div class="flex flex-col items-center flex-1 mx-1">
              <div 
                class="bg-mavs-blue rounded-t transition-all duration-700 w-full max-w-8 min-h-1"
                style="height: {calculateProgress(quarterStat.pts || 0, maxPoints) * 0.6 + 10}px"
              ></div>
              <div class="text-xs font-bold text-gray-700 mt-2">
                {quarterStat.pts || 0}
              </div>
              <div class="text-xs text-gray-500">
                {quarterStat.quarter}Q
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- 총합 통계 -->
      <div class="mt-6 pt-4 border-t border-gray-200">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div>
            <div class="text-2xl font-bold text-mavs-blue">{totalStats.pts}</div>
            <div class="text-sm text-gray-600">총 득점</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-mavs-blue">{totalStats.reb}</div>
            <div class="text-sm text-gray-600">총 리바운드</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-mavs-blue">{totalStats.ast}</div>
            <div class="text-sm text-gray-600">총 어시스트</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-mavs-blue">
              {totalStats.fg_attempted > 0 ? ((totalStats.fg_made / totalStats.fg_attempted) * 100).toFixed(1) : '0.0'}%
            </div>
            <div class="text-sm text-gray-600">전체 야투율</div>
          </div>
        </div>
      </div>

      <!-- 쿼터별 하이라이트 -->
      {#if !isCompact}
        {@const bestQuarter = stats.reduce((best, current) => 
          (current.pts || 0) > (best.pts || 0) ? current : best, stats[0] || {})}
        {@const mostEfficient = stats.reduce((best, current) => {
          const currentEff = calculateFgPercentage(current.fg_made, current.fg_attempted);
          const bestEff = calculateFgPercentage(best.fg_made, best.fg_attempted);
          return currentEff > bestEff ? current : best;
        }, stats[0] || {})}
        
        <div class="mt-6 pt-4 border-t border-gray-200">
          <h4 class="text-sm font-semibold text-gray-700 mb-3">쿼터별 하이라이트</h4>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
            
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div class="flex items-center space-x-2">
                <span class="text-yellow-500">🔥</span>
                <div>
                  <div class="text-sm font-semibold text-yellow-800">
                    최고 득점 쿼터
                  </div>
                  <div class="text-xs text-yellow-700">
                    {bestQuarter.quarter}쿼터 - {bestQuarter.pts || 0}점
                  </div>
                </div>
              </div>
            </div>
            
            <div class="bg-green-50 border border-green-200 rounded-lg p-3">
              <div class="flex items-center space-x-2">
                <span class="text-green-500">🎯</span>
                <div>
                  <div class="text-sm font-semibold text-green-800">
                    최고 효율 쿼터
                  </div>
                  <div class="text-xs text-green-700">
                    {mostEfficient.quarter}쿼터 - {(calculateFgPercentage(mostEfficient.fg_made, mostEfficient.fg_attempted) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
{:else}
  <!-- 데이터가 없을 때 -->
  <div class="card p-6">
    <div class="text-center text-gray-500">
      <div class="text-4xl mb-2">📊</div>
      <div class="text-sm">쿼터별 통계 데이터가 없습니다</div>
    </div>
  </div>
{/if}

<style>
  .card {
    position: relative;
  }
  
  @media (max-width: 1024px) {
    .grid.lg\\:grid-cols-4 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>