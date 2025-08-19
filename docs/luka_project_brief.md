**tailwind.config.js**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        mavs: {
          blue: '#00538C',
          navy: '#002B5E',
          silver: '#B8C4CA'
        }
      }
    }
  },
  plugins: []
}
```

**package.json (스크립트 추가)**
```json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "lint": "eslint ."
  }
}
```# Luka Tracker - 루카 돈치치 추적 프로젝트 기획서

## 프로젝트 개요
루카 돈치치 선수의 NBA 성과를 실시간으로 추적하고 분석하는 PWA 웹 애플리케이션

**프로젝트명**: `luka-tracker`
**GitHub**: `https://github.com/username/luka-tracker`
**배포 URL**: `https://luka-tracker.vercel.app`

### 기술 스택
- **프론트엔드**: SvelteKit
- **런타임/패키지매니저**: Bun
- **스타일링**: TailwindCSS
- **차트**: Chart.js 또는 D3.js
- **데이터 소스**: NBA API (nba_api 또는 Ball Don't Lie API)

## 핵심 기능

### 1. 대시보드 (메인 페이지)
- 루카의 현재 시즌 주요 스탯 (PPG, RPG, APG)
- 다음 경기 정보 & 카운트다운
- 최근 5경기 성과 요약
- 트리플 더블 달성 횟수

### 2. 실시간 게임 추적
- 경기 중 실시간 스탯 업데이트
- 쿼터별 득점 추이
- 현재 트리플 더블 진행 상황

### 3. 통계 분석 페이지
- **시즌별 성과**: 연도별 스탯 비교 그래프
- **월별 트렌드**: 시즌 내 월별 성과 변화
- **상대팀별 성적**: 특정 팀 상대 평균 스탯
- **홈 vs 어웨이**: 홈/어웨이 경기 성과 비교

### 4. 기록 & 하이라이트
- 커리어 최고 기록들
- 트리플 더블 달성 날짜별 목록
- 시즌별 주요 마일스톤

### 5. 비교 분석
- MVP 후보들과의 스탯 비교
- 같은 나이대 역대 선수들과 비교
- 유럽 출신 선수들과의 비교

## 페이지 구조

```
/
├── / (대시보드)
├── /live (실시간 게임)
├── /stats (통계 분석)
├── /records (기록 & 하이라이트)
├── /compare (비교 분석)
└── /about (프로젝트 정보)
```

## 개발환경 설정

### 1. 프로젝트 초기화 & 형상관리
```bash
# SvelteKit 프로젝트 생성
bun create svelte@latest luka-tracker
cd luka-tracker

# .gitignore 파일 생성/업데이트
echo "# Dependencies
node_modules/
.pnpm-debug.log*

# Build outputs
/.svelte-kit
/build
/dist

# Environment variables
.env
.env.local
.env.production

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# Playwright
/test-results/
/playwright-report/
/playwright/.cache/" > .gitignore

# Git 초기화 및 설정
git init
git add .
git commit -m "🎉 Initial commit: Luka Tracker SvelteKit project setup"

# GitHub 리포지토리 생성 후 연결
git remote add origin https://github.com/username/luka-tracker.git
git branch -M main
git push -u origin main

# 의존성 설치
bun install
```

### 2. 추가 패키지 설치
```bash
# TailwindCSS
bun add -D tailwindcss postcss autoprefixer @tailwindcss/typography
bun add -D @tailwindcss/forms @tailwindcss/aspect-ratio

# 차트 라이브러리
bun add chart.js chartjs-adapter-date-fns

# 날짜 처리
bun add date-fns

# 아이콘
bun add lucide-svelte

# API 요청
bun add axios

# 상태 관리 (필요시)
bun add svelte/store

# PWA 관련
bun add -D @vite-pwa/sveltekit vite-plugin-pwa
bun add workbox-window

# 테스트 환경
bun add -D vitest @testing-library/svelte @testing-library/jest-dom
bun add -D playwright @playwright/test
bun add -D jsdom happy-dom
```

### 3. 설정 파일들

**vite.config.js (PWA 설정)**
```javascript
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [
    sveltekit(),
    SvelteKitPWA({
      strategies: 'injectManifest',
      srcDir: './src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      manifest: {
        short_name: 'Luka Tracker',
        name: 'Luka Tracker - 루카 돈치치 스탯 추적기',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#00538C',
        background_color: '#ffffff',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}']
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    environment: 'jsdom'
  }
};

export default config;
```

**vitest.config.js (테스트 설정)**
```javascript
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.js']
  }
});
```

**playwright.config.js (E2E 테스트)**
```javascript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    }
  ],
  webServer: {
    command: 'bun run build && bun run preview',
    port: 4173
  }
});
```

**app.html**
```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%sveltekit.assets%/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>루카 돈치치 추적기</title>
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover" class="bg-gray-50">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
```

### 4. Git 브랜치 전략 & 커밋 컨벤션

**브랜치 전략**
```bash
main              # 프로덕션 배포용
├── develop       # 개발 통합 브랜치
├── feature/dashboard    # 대시보드 기능
├── feature/live-stats   # 실시간 스탯
├── feature/charts       # 차트 기능
└── feature/api-integration  # API 연동
```

**커밋 컨벤션**
```
✨ feat: 새로운 기능 추가
🐛 fix: 버그 수정
📝 docs: 문서 수정
💄 style: 코드 포맷팅, 세미콜론 누락 등
♻️ refactor: 코드 리팩토링
⚡ perf: 성능 개선
✅ test: 테스트 추가/수정
🚀 deploy: 배포 관련
🔧 chore: 빌드, 패키지 매니저 설정 등
```

**예시 커밋 메시지**
```bash
git commit -m "✨ feat: Luka Tracker 기본 스탯 대시보드 구현"
git commit -m "🔌 feat: Ball Don't Lie API 연동 완료"
git commit -m "📊 feat: Chart.js로 시즌별 성과 그래프 추가"
git commit -m "📱 feat: PWA 설치 기능 구현"
```
```
src/
├── lib/
│   ├── components/
│   │   ├── StatCard.svelte
│   │   ├── GameSchedule.svelte
│   │   ├── StatsChart.svelte
│   │   └── Navigation.svelte
│   ├── stores/
│   │   └── gameStats.js
│   ├── utils/
│   │   ├── api.js
│   │   └── formatters.js
│   └── types/
│       └── player.ts
├── routes/
│   ├── +layout.svelte
│   ├── +page.svelte
│   ├── live/
│   ├── stats/
│   ├── records/
│   └── compare/
└── app.html
```

## API 연동 계획

### 데이터 소스
- **주요 API**: Ball Don't Lie API 또는 nba_api
- **백업 API**: NBA.com 공식 stats
- **뉴스**: ESPN API 또는 웹 스크래핑

### API 래퍼 함수
```javascript
// src/lib/utils/api.js
export async function getLukaStats() {
  // 루카 돈치치 ID: 77 (Ball Don't Lie API 기준)
  const response = await fetch('/api/player/77/stats');
  return response.json();
}
```

## 개발 순서
1. ✅ 개발환경 세팅 (PWA 설정 포함)
2. 🧪 테스트 환경 구축 (Vitest + Playwright)
3. 🎯 기본 레이아웃 & 네비게이션
4. 📊 대시보드 페이지 (TDD 방식으로 테스트 먼저 작성)
5. 🔌 API 연동 & 데이터 fetching (테스트 포함)
6. 📈 차트 & 시각화 구현
7. ⚡ 실시간 업데이트 기능
8. 📱 PWA 기능 (오프라인 지원, 설치 가능)
9. 🎨 UI/UX 개선
10. 🚀 TWA 준비 및 배포

## 테스트 전략

### Unit 테스트 (Vitest)
```javascript
// src/tests/unit/StatCard.test.js
import { render, screen } from '@testing-library/svelte';
import StatCard from '$lib/components/StatCard.svelte';

test('StatCard displays player stats correctly', () => {
  render(StatCard, {
    props: {
      title: 'Points Per Game',
      value: 28.5,
      change: '+2.1'
    }
  });
  
  expect(screen.getByText('Points Per Game')).toBeInTheDocument();
  expect(screen.getByText('28.5')).toBeInTheDocument();
});
```

### E2E 테스트 (Playwright)
```javascript
// tests/e2e/dashboard.spec.js
import { test, expect } from '@playwright/test';

test('Luka Tracker dashboard loads with stats', async ({ page }) => {
  await page.goto('/');
  
  await expect(page.locator('h1')).toContainText('Luka Tracker');
  await expect(page.locator('[data-testid="ppg-stat"]')).toBeVisible();
  await expect(page.locator('[data-testid="next-game"]')).toBeVisible();
});
```

### PWA 테스트
```javascript
// tests/e2e/pwa.spec.js
import { test, expect } from '@playwright/test';

test('app can be installed as PWA', async ({ page, context }) => {
  await page.goto('/');
  
  // Service Worker 등록 확인
  const swPromise = page.waitForEvent('serviceworker');
  await swPromise;
  
  // 설치 가능 여부 확인
  await expect(page.locator('[data-testid="install-button"]')).toBeVisible();
});
```

## 성능 최적화 & PWA
- Bun의 빠른 번들링 활용
- 이미지 최적화 (WebP 포맷)
- 코드 스플리팅
- API 응답 캐싱
- Service Worker로 오프라인 지원
- 앱 설치 프롬프트 (Add to Home Screen)
- 백그라운드 동기화

## TWA (Trusted Web Activity) 준비
PWA를 안드로이드 앱으로 출시하기 위한 설정:

### TWA 설정 파일
```json
// twa-manifest.json
{
  "packageId": "com.lukatracker.app",
  "host": "luka-tracker.vercel.app",
  "name": "Luka Tracker",
  "launcherName": "Luka Tracker",
  "display": "standalone",
  "orientation": "default",
  "themeColor": "#00538C",
  "backgroundColor": "#ffffff",
  "startUrl": "/",
  "iconUrl": "/icon-512.png",
  "maskableIconUrl": "/icon-maskable-512.png",
  "splashScreenFadeOutDuration": 300,
  "enableNotifications": true,
  "shortcuts": [
    {
      "name": "Live Game",
      "short_name": "Live",
      "url": "/live",
      "icons": [{"src": "/shortcut-live.png", "sizes": "96x96"}]
    }
  ]
}
```

### Digital Asset Links 설정
```json
// static/.well-known/assetlinks.json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.lukatracker.app",
    "sha256_cert_fingerprints": ["SHA256:해시값"]
  }
}]
```

## 배포 계획 & 형상관리
- **Git 호스팅**: GitHub
- **CI/CD**: GitHub Actions
- **배포**: Vercel 또는 Netlify
- **환경변수**: API 키 관리
- **브랜치 보호**: main 브랜치 PR 필수

### GitHub Actions 워크플로우
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build
      - name: Deploy to Vercel
        uses: vercel/action@v1
```