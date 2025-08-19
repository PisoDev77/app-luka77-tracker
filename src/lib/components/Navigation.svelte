<script>
  import { onMount } from 'svelte';
  
  /**
   * 네비게이션 컴포넌트
   * @description 앱의 주요 페이지 간 이동을 위한 사이드바 네비게이션
   */

  /** @type {string} 현재 경로 */
  export let currentPath = '/';

  /** @type {boolean} 모바일 메뉴 열림 상태 */
  let isMobileMenuOpen = false;

  /** @type {boolean} 네비게이션 축소 상태 */
  let isCollapsed = false;

  /**
   * 네비게이션 메뉴 항목 배열
   * @type {Array<Object>}
   */
  const menuItems = [
    {
      title: '대시보드',
      path: '/',
      icon: '🏠',
      description: '루카 돈치치 추적'
    }
  ];

  /**
   * 현재 경로와 메뉴 항목 경로가 일치하는지 확인하는 함수
   * @param {string} itemPath - 메뉴 항목 경로
   * @returns {boolean} 활성화 상태 여부
   */
  const isActiveRoute = (itemPath) => {
    if (itemPath === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(itemPath);
  };

  /**
   * 모바일 메뉴 토글 함수
   * @returns {void}
   */
  const toggleMobileMenu = () => {
    isMobileMenuOpen = !isMobileMenuOpen;
  };

  /**
   * 네비게이션 축소/확장 토글 함수
   * @returns {void}
   */
  const toggleCollapse = () => {
    isCollapsed = !isCollapsed;
  };

  /**
   * 메뉴 항목 클릭 핸들러
   * @param {string} path - 이동할 경로
   * @returns {void}
   */
  const handleMenuClick = (path) => {
    // 모바일에서 메뉴 클릭 시 메뉴 닫기
    if (window.innerWidth < 1024) {
      isMobileMenuOpen = false;
    }
  };

  /**
   * ESC 키로 모바일 메뉴 닫기
   * @param {KeyboardEvent} event - 키보드 이벤트
   * @returns {void}
   */
  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && isMobileMenuOpen) {
      isMobileMenuOpen = false;
    }
  };

  onMount(() => {
    // 초기 화면 크기에 따른 상태 설정
    const checkScreenSize = () => {
      if (window.innerWidth < 1024) {
        isMobileMenuOpen = false;
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  });
</script>

<svelte:window on:keydown={handleKeyDown} />

<!-- 모바일 햄버거 버튼 -->
<div class="lg:hidden fixed top-4 left-4 z-50">
  <button
    on:click={toggleMobileMenu}
    class="p-2 rounded-md bg-white shadow-md border border-gray-200 hover:bg-gray-50"
    aria-label="메뉴 열기"
  >
    <span class="text-xl">☰</span>
  </button>
</div>

<!-- 모바일 오버레이 -->
{#if isMobileMenuOpen}
  <div 
    class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
    on:click={toggleMobileMenu}
    aria-hidden="true"
  ></div>
{/if}

<!-- 사이드바 네비게이션 -->
<nav class={`
  fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-lg z-40
  transition-all duration-300 ease-in-out
  ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
  ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
  w-64
`}>
  <div class="h-full flex flex-col">
    <!-- 로고 및 헤더 -->
    <div class="p-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        {#if !isCollapsed}
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-mavs-blue rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">L</span>
            </div>
            <div>
              <h1 class="text-lg font-bold text-mavs-blue">Luka Tracker</h1>
              <p class="text-xs text-gray-500">NBA 스탯 추적기</p>
            </div>
          </div>
        {:else}
          <div class="w-8 h-8 bg-mavs-blue rounded-lg flex items-center justify-center mx-auto">
            <span class="text-white font-bold text-sm">L</span>
          </div>
        {/if}
        
        <!-- 데스크탑 축소/확장 버튼 -->
        <button
          on:click={toggleCollapse}
          class="hidden lg:block p-1 rounded hover:bg-gray-100"
          aria-label={isCollapsed ? '메뉴 확장' : '메뉴 축소'}
        >
          <span class="text-gray-500 text-sm">
            {isCollapsed ? '→' : '←'}
          </span>
        </button>

        <!-- 모바일 닫기 버튼 -->
        <button
          on:click={toggleMobileMenu}
          class="lg:hidden p-1 rounded hover:bg-gray-100"
          aria-label="메뉴 닫기"
        >
          <span class="text-gray-500 text-lg">×</span>
        </button>
      </div>
    </div>

    <!-- 메뉴 항목들 -->
    <div class="flex-1 py-4 overflow-y-auto">
      <ul class="space-y-1 px-2">
        {#each menuItems as item (item.path)}
          <li>
            <a
              href={item.path}
              on:click={() => handleMenuClick(item.path)}
              class={`
                nav-link group
                ${isActiveRoute(item.path) ? 'active' : ''}
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? item.title : ''}
            >
              <span class="text-xl" role="img" aria-label={item.title}>
                {item.icon}
              </span>
              
              {#if !isCollapsed}
                <div class="ml-3 flex-1">
                  <span class="block text-sm font-medium">{item.title}</span>
                  <span class="block text-xs text-gray-500 group-hover:text-gray-600">
                    {item.description}
                  </span>
                </div>
              {/if}

              <!-- 활성 상태 표시 -->
              {#if isActiveRoute(item.path)}
                <div class="w-1 h-6 bg-mavs-blue rounded-full"></div>
              {/if}
            </a>
          </li>
        {/each}
      </ul>
    </div>

    <!-- 하단 정보 -->
    <div class="p-4 border-t border-gray-200">
      {#if !isCollapsed}
        <div class="text-center">
          <div class="text-xs text-gray-500 mb-1">Los Angeles Lakers</div>
          <div class="text-sm font-semibold text-mavs-blue">#77 Luka Dončić</div>
          <div class="text-xs text-gray-400 mt-1">Point Guard</div>
        </div>
      {:else}
        <div class="text-center">
          <div class="text-2xl text-mavs-blue">#77</div>
        </div>
      {/if}
      
      <!-- 상태 표시 -->
      <div class="flex items-center justify-center mt-3 space-x-2">
        <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        {#if !isCollapsed}
          <span class="text-xs text-gray-500">실시간 연결</span>
        {/if}
      </div>
    </div>
  </div>
</nav>

<style>
  .nav-link {
    @apply flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200;
  }
  
  .nav-link.active {
    @apply bg-mavs-blue text-white shadow-md;
  }
  
  .nav-link:not(.active) {
    @apply text-gray-700;
  }
  
  .nav-link:not(.active):hover {
    @apply bg-gray-100 text-gray-900;
    transform: translateX(2px);
  }
  
  .nav-link.active .text-gray-500 {
    @apply text-blue-100;
  }
</style>