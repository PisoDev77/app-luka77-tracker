# Luka Tracker - Claude Code 프로젝트 메모

## 프로젝트 개요
- **이름**: Luka Tracker
- **설명**: 루카 돈치치 NBA 성과 실시간 추적 PWA
- **기술 스택**: SvelteKit + TailwindCSS + Chart.js + PWA
- **개발 컨벤션**: 한국어 JSDoc, 엄격한 네이밍 규칙

## 개발 명령어
```bash
# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프리뷰
npm run preview

# 테스트
npm run test
npm run test:e2e

# 코드 품질
npm run lint
npm run typecheck
npm run format
```

## 프로젝트 구조
```
src/
├── lib/
│   ├── components/     # 재사용 가능한 컴포넌트
│   ├── stores/         # Svelte 상태 관리
│   ├── utils/          # 유틸리티 함수
│   └── types/          # TypeScript 타입 정의
├── routes/             # 페이지 라우트
└── tests/              # 테스트 파일
```

## 개발 컨벤션
- **함수/클래스**: 반드시 한국어 JSDoc 필수
- **네이밍**: 상수(UPPER_SNAKE_CASE), 변수(camelCase), 함수(동사+명사), 클래스(PascalCase)
- **Boolean**: is/has/can/should 접두사 사용
- **커밋**: 이모지 + 타입 + 설명 (✨ feat: 새 기능 추가)

## API 정보
- **주 API**: Ball Don't Lie API (https://www.balldontlie.io/api/)
- **루카 돈치치 Player ID**: 77
- **캐시 정책**: 15분 로컬 캐시

## PWA 기능
- **매니페스트**: 자동 생성됨
- **Service Worker**: 자동 주입
- **오프라인 지원**: API 응답 캐싱
- **설치 가능**: Add to Home Screen 지원