# 🏀 Luka Tracker - 루카 돈치치 추적기

루카 돈치치 선수의 LA 레이커스 성과를 실시간으로 추적하는 PWA 웹 애플리케이션

## ✨ 주요 기능

- 🔴 **실시간 경기 추적**: 레이커스 경기 실시간 점수 및 상황
- 📅 **경기 캘린더**: 다음 경기 일정 & 카운트다운
- 📊 **팀 정보**: 레이커스 현재 순위 및 로스터
- 👤 **선수 정보**: 루카 돈치치 기본 정보 및 출전 현황
- 📱 **PWA 지원**: 앱처럼 설치 및 오프라인 사용 가능

## 🚀 기술 스택

- **Frontend**: SvelteKit
- **Styling**: TailwindCSS  
- **Data**: Ball Don't Lie NBA API (Free Tier)
- **PWA**: Vite PWA Plugin
- **Deployment**: Netlify

## 🛠 개발 환경 설정

### 1. 리포지토리 클론
```bash
git clone https://github.com/PisoDev77/app-luka77-tracker.git
cd app-luka77-tracker
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
```bash
# .env.example을 .env로 복사
cp .env.example .env

# .env 파일을 열고 API 키 입력
VITE_BALLDONTLIE_API_KEY=your-actual-api-key-here
```

**API 키 발급 방법:**
1. [Ball Don't Lie API](https://app.balldontlie.io) 방문
2. 무료 계정 생성
3. API 키 복사 후 `.env` 파일에 입력

### 4. 개발 서버 실행
```bash
npm run dev
```

## 📦 빌드 및 배포

### 로컬 빌드
```bash
npm run build
npm run preview
```

### Netlify 배포
1. GitHub에 푸시
2. Netlify에서 리포지토리 연결
3. 환경 변수 설정:
   - `VITE_BALLDONTLIE_API_KEY`: 발급받은 API 키

## 🔒 보안 주의사항

- ⚠️ **절대 API 키를 코드에 하드코딩하지 마세요**
- ✅ `.env` 파일은 `.gitignore`에 포함되어 Git에 업로드되지 않습니다
- ✅ 배포 시에는 Netlify 환경변수를 사용합니다

## 📱 PWA 설치

1. 브라우저에서 앱 접속
2. 주소창 옆 "설치" 버튼 클릭
3. 홈 화면에 추가되어 네이티브 앱처럼 사용 가능

## 🎯 무료 API 제한사항

Ball Don't Lie 무료 플랜 제한:
- **요청 제한**: 분당 5회
- **사용 가능 데이터**: 팀 정보, 경기 일정, 기본 선수 정보
- **제한 데이터**: 상세 통계, 시즌 성과 분석

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m '✨ feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일 참조

## 🙏 감사의 말

- [Ball Don't Lie API](https://www.balldontlie.io/) - NBA 데이터 제공
- [SvelteKit](https://kit.svelte.dev/) - 프레임워크
- [TailwindCSS](https://tailwindcss.com/) - 스타일링

---

Made with ❤️ for Luka Dončić fans