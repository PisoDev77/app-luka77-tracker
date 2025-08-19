<script>
  import { formatNumber, formatPercentage } from '$utils/formatters.js';

  /**
   * 통계 비교 테이블 컴포넌트
   * @description 상대팀별 통계를 테이블 형태로 보여주는 컴포넌트
   */

  export let stats = [];

  /**
   * 승률을 계산하는 함수
   * @param {Object} stat - 통계 객체
   * @returns {number} 승률 (0-1)
   */
  const calculateWinRate = (stat) => {
    const totalGames = stat.wins + stat.losses;
    return totalGames > 0 ? stat.wins / totalGames : 0;
  };

  /**
   * 성과 등급을 계산하는 함수
   * @param {Object} stat - 통계 객체
   * @returns {string} 성과 등급 (Excellent, Good, Average, Poor)
   */
  const getPerformanceGrade = (stat) => {
    const avgScore = (stat.pts + stat.reb + stat.ast) / 3;
    
    if (avgScore >= 15) return 'Excellent';
    if (avgScore >= 12) return 'Good';
    if (avgScore >= 8) return 'Average';
    return 'Poor';
  };

  /**
   * 성과 등급에 따른 색상 클래스를 반환하는 함수
   * @param {string} grade - 성과 등급
   * @returns {string} CSS 클래스명
   */
  const getGradeColorClass = (grade) => {
    switch (grade) {
      case 'Excellent': return 'text-green-600 bg-green-50';
      case 'Good': return 'text-blue-600 bg-blue-50';
      case 'Average': return 'text-yellow-600 bg-yellow-50';
      case 'Poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };
</script>

<div class="stat-comparison-table">
  {#if stats.length === 0}
    <div class="text-center py-8 text-gray-500">
      <div class="text-4xl mb-2">📊</div>
      <p>상대팀별 통계 데이터가 없습니다.</p>
    </div>
  {:else}
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              상대팀
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              경기 수
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              승-패
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              승률
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              평균 득점
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              평균 리바운드
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              평균 어시스트
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              야투율
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              성과
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#each stats as stat, index}
            <tr class="hover:bg-gray-50 transition-colors duration-150">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="text-sm font-medium text-gray-900">
                    {stat.opponent.full_name}
                  </div>
                  <div class="text-xs text-gray-500 ml-2">
                    ({stat.opponent.abbreviation})
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {stat.gp}경기
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span class="text-green-600 font-semibold">{stat.wins}</span>
                -
                <span class="text-red-600 font-semibold">{stat.losses}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="flex items-center">
                  <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      class="bg-mavs-blue h-2 rounded-full transition-all duration-300"
                      style="width: {calculateWinRate(stat) * 100}%"
                    ></div>
                  </div>
                  <span class="font-semibold">
                    {formatPercentage(calculateWinRate(stat))}%
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                {formatNumber(stat.pts, 1)}점
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                {formatNumber(stat.reb, 1)}개
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                {formatNumber(stat.ast, 1)}개
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                {formatPercentage(stat.fg_pct)}%
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getGradeColorClass(getPerformanceGrade(stat))}">
                  {getPerformanceGrade(stat)}
                </span>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- 요약 통계 -->
    <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
      <div class="text-center">
        <div class="text-lg font-bold text-mavs-blue">
          {stats.reduce((sum, stat) => sum + stat.gp, 0)}
        </div>
        <div class="text-xs text-gray-600">총 경기 수</div>
      </div>
      <div class="text-center">
        <div class="text-lg font-bold text-green-600">
          {stats.reduce((sum, stat) => sum + stat.wins, 0)}
        </div>
        <div class="text-xs text-gray-600">총 승수</div>
      </div>
      <div class="text-center">
        <div class="text-lg font-bold text-mavs-blue">
          {formatNumber(stats.reduce((sum, stat) => sum + stat.pts, 0) / stats.length, 1)}
        </div>
        <div class="text-xs text-gray-600">평균 득점</div>
      </div>
      <div class="text-center">
        <div class="text-lg font-bold text-mavs-blue">
          {formatPercentage(stats.reduce((sum, stat) => sum + calculateWinRate(stat), 0) / stats.length)}%
        </div>
        <div class="text-xs text-gray-600">평균 승률</div>
      </div>
    </div>
  {/if}
</div>

<style>
  .stat-comparison-table {
    max-width: 100%;
  }

  .stat-comparison-table table {
    font-size: 0.875rem;
  }

  .stat-comparison-table th {
    font-weight: 600;
    letter-spacing: 0.05em;
  }

  .stat-comparison-table tr:hover {
    background-color: #f9fafb;
  }

  @media (max-width: 768px) {
    .stat-comparison-table {
      font-size: 0.75rem;
    }
    
    .stat-comparison-table th,
    .stat-comparison-table td {
      padding: 0.5rem 0.25rem;
    }
  }
</style>