# 🚀 Netlify 배포 가이드

## 1. Netlify 계정 설정

1. [Netlify](https://netlify.com) 회원가입/로그인
2. "New site from Git" 클릭
3. GitHub 연동 후 `PisoDev77/app-luka77-tracker` 선택

## 2. 빌드 설정

- **Build command**: `npm run build`
- **Publish directory**: `build`
- **Base directory**: (비워둠)

## 3. 환경변수 설정

Netlify 대시보드 → Site settings → Environment variables에서 설정:

```
VITE_BALLDONTLIE_API_KEY = d875ff2b-70e6-41e8-9e55-bee0c25c73e6
```

⚠️ **보안 주의사항**: 
- API 키는 프론트엔드에서 노출되므로 무료 API 키만 사용
- Rate limiting이 적용되어 남용 방지

## 4. 배포 확인

1. 빌드 로그 확인
2. PWA 기능 테스트
3. API 연동 테스트

## 5. 도메인 설정 (선택사항)

- Custom domain 설정 가능
- HTTPS 자동 설정됨
- DNS 설정 필요시 Netlify DNS 사용 권장

## 🔧 트러블슈팅

### 빌드 실패시
- `package.json`의 dependencies 확인
- Node.js 버전 호환성 확인 (18.x)

### API 오류시
- Environment variables 설정 확인
- API 키 유효성 확인
- Rate limit 확인 (5 requests/minute)

### PWA 관련 오류시
- Service Worker 등록 확인
- Manifest 파일 생성 확인
- HTTPS 환경 필요