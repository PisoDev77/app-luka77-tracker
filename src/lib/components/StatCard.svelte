<script>
  import { formatStatChange, getTrendIcon } from '$utils/formatters.js';

  export let title = '';
  export let value = 0;
  export let unit = '';
  export let change = 0;
  export let trend = 'stable';
  export let icon = '📊';
  export let description = '';
  export let isCompact = false;
  export let isClickable = false;

  $: changeInfo = formatStatChange(change);
  $: trendIcon = getTrendIcon(trend);
  
  $: cardClasses = [
    'stat-card',
    'transition-all duration-200',
    isClickable ? 'cursor-pointer hover:shadow-lg hover:scale-105' : '',
    isCompact ? 'p-4' : 'p-6',
    trend === 'live' ? 'ring-2 ring-red-500 ring-opacity-50' : ''
  ].filter(Boolean).join(' ');
  
  $: valueClasses = [
    isCompact ? 'text-2xl' : 'text-3xl',
    'font-bold',
    trend === 'live' ? 'text-red-600 animate-pulse' : 'text-gray-900'
  ].join(' ');

  const handleCardClick = () => {
    if (isClickable) {
      const event = new CustomEvent('cardClick', {
        detail: { title, value, unit, change, trend }
      });
      document.dispatchEvent(event);
    }
  };
</script>

<div 
  class={cardClasses}
  on:click={handleCardClick}
  on:keydown={(e) => e.key === 'Enter' && isClickable && handleCardClick()}
  role={isClickable ? 'button' : 'group'}
>
  <!-- 상단 섹션: 아이콘과 제목 -->
  <div class="flex items-center justify-between mb-3">
    <div class="flex items-center space-x-2">
      <span class="text-2xl" role="img" aria-label={title}>{icon}</span>
      {#if !isCompact}
        <h3 class="text-sm font-medium text-gray-600">{title}</h3>
      {/if}
    </div>
    
    <!-- 실시간 표시 -->
    {#if trend === 'live'}
      <div class="flex items-center space-x-1">
        <div class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        <span class="text-xs text-red-600 font-semibold">LIVE</span>
      </div>
    {/if}
  </div>

  <!-- 메인 값 -->
  <div class="mb-2">
    <div class={valueClasses}>
      {value}<span class="text-lg text-gray-600 ml-1">{unit}</span>
    </div>
    {#if isCompact && title}
      <div class="text-xs text-gray-500 mt-1">{title}</div>
    {/if}
  </div>

  <!-- 변화량 표시 -->
  {#if change !== 0 && trend !== 'live'}
    <div class="flex items-center space-x-2">
      <span class="text-lg">{trendIcon}</span>
      <span class="text-sm font-semibold {changeInfo.color}">
        {changeInfo.text}
      </span>
      
      {#if !isCompact}
        <span class="text-xs text-gray-500">전 대비</span>
      {/if}
    </div>
  {/if}

  <!-- 추가 설명 -->
  {#if description && !isCompact}
    <div class="mt-3 pt-3 border-t border-gray-100">
      <p class="text-xs text-gray-500">{description}</p>
    </div>
  {/if}

  <!-- 로딩 상태 오버레이 -->
  {#if trend === 'live'}
    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
  {/if}
</div>

<style>
  .stat-card {
    position: relative;
    overflow: hidden;
    @apply bg-white rounded-lg shadow-sm border border-gray-200;
  }
  
  .stat-card:hover {
    transform: translateY(-2px);
  }
</style>