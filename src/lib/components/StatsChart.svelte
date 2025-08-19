<script>
  import { onMount, afterUpdate } from 'svelte';
  import Chart from 'chart.js/auto';
  import 'chartjs-adapter-date-fns';

  /**
   * 통계 차트 컴포넌트
   * @description Chart.js를 활용한 다양한 통계 시각화 컴포넌트
   */

  /** @type {Array} 차트 데이터 배열 */
  export let data = [];
  
  /** @type {'monthly'|'seasonal'|'comparison'} 차트 타입 */
  export let type = 'monthly';
  
  /** @type {Array} 표시할 메트릭 목록 */
  export let metrics = ['pts', 'reb', 'ast'];
  
  /** @type {string} 차트 제목 */
  export let title = '';
  
  /** @type {boolean} 레전드 표시 여부 */
  export let showLegend = true;
  
  /** @type {boolean} 애니메이션 사용 여부 */
  export let animated = true;

  let chartCanvas;
  let chartInstance = null;

  /**
   * 메트릭별 설정 정보
   * @type {Object}
   */
  const metricConfig = {
    pts: {
      label: '평균 득점',
      color: 'rgb(59, 130, 246)',
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      unit: '점'
    },
    reb: {
      label: '평균 리바운드',
      color: 'rgb(34, 197, 94)',
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      unit: '개'
    },
    ast: {
      label: '평균 어시스트',
      color: 'rgb(168, 85, 247)',
      borderColor: 'rgb(168, 85, 247)',
      backgroundColor: 'rgba(168, 85, 247, 0.1)',
      unit: '개'
    },
    fg_pct: {
      label: '야투 성공률',
      color: 'rgb(245, 158, 11)',
      borderColor: 'rgb(245, 158, 11)',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      unit: '%'
    },
    min: {
      label: '평균 출전시간',
      color: 'rgb(239, 68, 68)',
      borderColor: 'rgb(239, 68, 68)',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      unit: '분'
    }
  };

  /**
   * 차트 데이터셋을 생성하는 함수
   * @returns {Array} Chart.js 데이터셋 배열
   */
  const createDatasets = () => {
    return metrics.map(metric => {
      const config = metricConfig[metric] || metricConfig.pts;
      
      return {
        label: config.label,
        data: data.map(item => ({
          x: getXAxisValue(item),
          y: getMetricValue(item, metric)
        })),
        borderColor: config.borderColor,
        backgroundColor: config.backgroundColor,
        borderWidth: 2,
        fill: type === 'monthly',
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: config.color,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2
      };
    });
  };

  /**
   * X축 값을 가져오는 함수
   * @param {Object} item - 데이터 항목
   * @returns {string|number} X축 값
   */
  const getXAxisValue = (item) => {
    switch (type) {
      case 'monthly':
        return item.month_name || item.month;
      case 'seasonal':
        return item.season;
      case 'comparison':
        return item.opponent?.abbreviation || item.label;
      default:
        return item.label || item.name;
    }
  };

  /**
   * 메트릭 값을 가져오는 함수
   * @param {Object} item - 데이터 항목
   * @param {string} metric - 메트릭 이름
   * @returns {number} 메트릭 값
   */
  const getMetricValue = (item, metric) => {
    const value = item[metric];
    
    // 백분율 데이터는 100을 곱해서 표시
    if (metric.includes('pct') && value) {
      return (value * 100);
    }
    
    return value || 0;
  };

  /**
   * 차트 옵션을 생성하는 함수
   * @returns {Object} Chart.js 옵션 객체
   */
  const createChartOptions = () => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: animated ? {
        duration: 1500,
        easing: 'easeOutQuart'
      } : false,
      plugins: {
        title: {
          display: !!title,
          text: title,
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          display: showLegend,
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#374151',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            title: function(context) {
              return context[0].label;
            },
            label: function(context) {
              const config = metricConfig[metrics[context.datasetIndex]] || metricConfig.pts;
              const value = context.parsed.y;
              return `${config.label}: ${value.toFixed(1)}${config.unit}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 11
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(156, 163, 175, 0.2)'
          },
          ticks: {
            font: {
              size: 11
            },
            callback: function(value) {
              return value.toFixed(1);
            }
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      },
      hover: {
        animationDuration: 300
      },
      elements: {
        line: {
          tension: 0.4
        },
        point: {
          hoverRadius: 8
        }
      }
    };
  };

  /**
   * 차트를 생성하는 함수
   * @returns {void}
   */
  const createChart = () => {
    if (!chartCanvas || !data.length) return;

    // 기존 차트 인스턴스 제거
    if (chartInstance) {
      chartInstance.destroy();
    }

    const ctx = chartCanvas.getContext('2d');
    
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: createDatasets()
      },
      options: createChartOptions()
    });
  };

  /**
   * 차트를 업데이트하는 함수
   * @returns {void}
   */
  const updateChart = () => {
    if (!chartInstance || !data.length) return;

    chartInstance.data.datasets = createDatasets();
    chartInstance.options = createChartOptions();
    chartInstance.update('active');
  };

  /**
   * 차트 크기를 조정하는 함수
   * @returns {void}
   */
  const resizeChart = () => {
    if (chartInstance) {
      chartInstance.resize();
    }
  };

  // 컴포넌트 라이프사이클
  onMount(() => {
    createChart();
    
    // 윈도우 리사이즈 이벤트 리스너
    window.addEventListener('resize', resizeChart);
    
    return () => {
      window.removeEventListener('resize', resizeChart);
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  });

  afterUpdate(() => {
    if (chartInstance && data.length > 0) {
      updateChart();
    } else if (data.length > 0) {
      createChart();
    }
  });

  // 반응형 업데이트
  $: if (chartInstance && (data || metrics || type)) {
    updateChart();
  }
</script>

<div class="chart-container">
  {#if data && data.length > 0}
    <div class="relative" style="height: 400px;">
      <canvas 
        bind:this={chartCanvas}
        class="w-full h-full"
      ></canvas>
    </div>
  {:else}
    <!-- 데이터가 없을 때 -->
    <div class="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <div class="text-center text-gray-500">
        <div class="text-4xl mb-2">📈</div>
        <div class="text-sm font-medium">차트 데이터가 없습니다</div>
        <div class="text-xs mt-1">데이터를 불러오는 중이거나 선택된 기간에 데이터가 없습니다.</div>
      </div>
    </div>
  {/if}
</div>

<style>
  .chart-container {
    position: relative;
    width: 100%;
  }
  
  canvas {
    display: block;
    box-sizing: border-box;
  }
  
  :global(.chart-container .chartjs-tooltip) {
    opacity: 1;
    pointer-events: none;
    position: absolute;
    transform: translate(-50%, 0);
    transition: all 0.1s ease;
    background-color: rgba(0, 0, 0, 0.8);
    border-radius: 8px;
    color: white;
    font-size: 12px;
    padding: 8px 12px;
    pointer-events: none;
    z-index: 100;
  }
</style>