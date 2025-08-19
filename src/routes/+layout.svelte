<script>
  import '../app.postcss';
  import Navigation from '$components/Navigation.svelte';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  /**
   * 앱의 기본 레이아웃 컴포넌트
   * @description 모든 페이지에 공통으로 적용되는 레이아웃과 네비게이션을 제공
   */

  let isOnline = true;
  let deferredPrompt;
  let canInstallPWA = false;

  /**
   * 온라인/오프라인 상태를 확인하는 함수
   * @returns {void}
   */
  const checkOnlineStatus = () => {
    isOnline = navigator.onLine;
  };

  /**
   * PWA 설치 프롬프트를 처리하는 함수
   * @returns {Promise<void>}
   */
  const handleInstallPrompt = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA 설치가 수락되었습니다.');
    }
    
    deferredPrompt = null;
    canInstallPWA = false;
  };

  onMount(() => {
    // 온라인/오프라인 이벤트 리스너
    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);

    // PWA 설치 이벤트 리스너
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      canInstallPWA = true;
    });

    // Service Worker 등록
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(() => console.log('Service Worker 등록 성공'))
        .catch(() => console.log('Service Worker 등록 실패'));
    }

    return () => {
      window.removeEventListener('online', checkOnlineStatus);
      window.removeEventListener('offline', checkOnlineStatus);
    };
  });
</script>

<svelte:head>
  <meta name="description" content="루카 돈치치의 NBA 성과를 실시간으로 추적하고 분석하는 PWA" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
  <!-- 오프라인 알림 -->
  {#if !isOnline}
    <div class="bg-red-500 text-white px-4 py-2 text-center text-sm font-medium">
      🔌 오프라인 모드입니다. 일부 기능이 제한될 수 있습니다.
    </div>
  {/if}

  <!-- PWA 설치 배너 -->
  {#if canInstallPWA}
    <div class="bg-mavs-blue text-white px-4 py-3 flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <span class="text-sm font-medium">📱 홈 화면에 Luka Tracker를 추가하세요!</span>
      </div>
      <div class="flex items-center space-x-2">
        <button
          on:click={handleInstallPrompt}
          class="bg-white text-mavs-blue px-3 py-1 rounded text-xs font-semibold hover:bg-gray-100 transition-colors"
        >
          설치하기
        </button>
        <button
          on:click={() => (canInstallPWA = false)}
          class="text-white hover:text-gray-200 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  {/if}

  <!-- 메인 레이아웃 -->
  <div class="flex flex-col lg:flex-row min-h-screen">
    <!-- 네비게이션 -->
    <Navigation currentPath={$page.url.pathname} />

    <!-- 메인 컨텐츠 -->
    <main class="flex-1 lg:ml-64">
      <div class="container mx-auto px-4 py-6 max-w-7xl">
        <slot />
      </div>
    </main>
  </div>

  <!-- 푸터 -->
  <footer class="bg-white border-t border-gray-200 lg:ml-64">
    <div class="container mx-auto px-4 py-4 max-w-7xl">
      <div class="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
        <div class="mb-2 sm:mb-0">
          © 2024 Luka Tracker. NBA 데이터는 Ball Don't Lie API를 사용합니다.
        </div>
        <div class="flex items-center space-x-4">
          <span class="flex items-center">
            <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            {isOnline ? '온라인' : '오프라인'}
          </span>
          <span class="text-xs text-gray-500">v1.0.0</span>
        </div>
      </div>
    </div>
  </footer>
</div>

<style>
  :global(html) {
    scroll-behavior: smooth;
  }
</style>