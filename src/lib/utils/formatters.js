/**
 * 데이터 포매팅 유틸리티 함수 모음
 * @description 숫자, 날짜, 시간 등의 데이터를 사용자 친화적인 형태로 변환하는 함수들
 */

/**
 * 숫자를 한국어 스타일로 포맷하는 함수
 * @param {number} value - 포맷할 숫자
 * @param {number} decimals - 소수점 자릿수 (기본값: 0)
 * @returns {string} 포맷된 숫자 문자열
 */
export function formatNumber(value, decimals = 0) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  
  return Number(value).toLocaleString('ko-KR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * 백분율을 포맷하는 함수
 * @param {number} value - 포맷할 소수값 (0~1)
 * @param {number} decimals - 소수점 자릿수 (기본값: 1)
 * @returns {string} 백분율 문자열
 */
export function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.0';
  }
  
  const percentage = value * 100;
  return percentage.toFixed(decimals);
}

/**
 * 시간을 MM:SS 형식으로 포맷하는 함수
 * @param {string|number} timeValue - 시간 값 (분:초 문자열 또는 초)
 * @returns {string} 포맷된 시간 문자열
 */
export function formatGameTime(timeValue) {
  if (!timeValue) return '00:00';
  
  // 이미 MM:SS 형식인 경우
  if (typeof timeValue === 'string' && timeValue.includes(':')) {
    return timeValue;
  }
  
  // 초 단위인 경우
  const totalSeconds = typeof timeValue === 'string' ? parseInt(timeValue) : timeValue;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * 날짜를 한국어 형식으로 포맷하는 함수
 * @param {string|Date} dateValue - 날짜 값
 * @param {Object} options - 포맷 옵션
 * @returns {string} 포맷된 날짜 문자열
 */
export function formatDate(dateValue, options = {}) {
  if (!dateValue) return '';
  
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return date.toLocaleDateString('ko-KR', defaultOptions);
}

/**
 * 상대적 시간을 표시하는 함수 (예: "3시간 전")
 * @param {string|Date} dateValue - 기준 날짜
 * @returns {string} 상대적 시간 문자열
 */
export function formatRelativeTime(dateValue) {
  if (!dateValue) return '';
  
  const date = new Date(dateValue);
  const now = new Date();
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `${diffDays}일 전`;
  } else if (diffHours > 0) {
    return `${diffHours}시간 전`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes}분 전`;
  } else {
    return '방금 전';
  }
}

/**
 * 시간을 표시하는 함수 (시:분)
 * @param {string|Date} dateValue - 시간 값
 * @returns {string} 시:분 형식 문자열
 */
export function formatTime(dateValue) {
  if (!dateValue) return '';
  
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return '';
  
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * 게임 날짜와 시간을 포맷하는 함수
 * @param {string|Date} dateValue - 게임 날짜/시간
 * @returns {Object} 포맷된 날짜와 시간 객체
 */
export function formatGameDateTime(dateValue) {
  if (!dateValue) return { date: '', time: '', dayOfWeek: '' };
  
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return { date: '', time: '', dayOfWeek: '' };
  
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  
  return {
    date: formatDate(date, { month: 'numeric', day: 'numeric' }),
    time: formatTime(date),
    dayOfWeek: `${dayNames[date.getDay()]}요일`,
    full: date.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  };
}

/**
 * 통계 변화량을 포맷하는 함수
 * @param {number} changeValue - 변화량
 * @param {boolean} isPercentage - 백분율 여부
 * @returns {Object} 포맷된 변화량 정보
 */
export function formatStatChange(changeValue, isPercentage = false) {
  if (changeValue === null || changeValue === undefined || isNaN(changeValue)) {
    return {
      text: '-',
      trend: 'stable',
      color: 'text-gray-500'
    };
  }
  
  const absValue = Math.abs(changeValue);
  const formattedValue = isPercentage 
    ? formatPercentage(absValue)
    : formatNumber(absValue, 1);
  
  if (changeValue > 0) {
    return {
      text: `+${formattedValue}${isPercentage ? '%' : ''}`,
      trend: 'up',
      color: 'text-green-600'
    };
  } else if (changeValue < 0) {
    return {
      text: `-${formattedValue}${isPercentage ? '%' : ''}`,
      trend: 'down',
      color: 'text-red-600'
    };
  } else {
    return {
      text: '±0',
      trend: 'stable',
      color: 'text-gray-500'
    };
  }
}

/**
 * 야투 기록을 포맷하는 함수 (성공/시도)
 * @param {number} made - 성공 횟수
 * @param {number} attempted - 시도 횟수
 * @returns {string} "성공/시도" 형식 문자열
 */
export function formatFieldGoal(made, attempted) {
  const madeFmt = made || 0;
  const attemptedFmt = attempted || 0;
  
  return `${madeFmt}/${attemptedFmt}`;
}

/**
 * 승패 기록을 포맷하는 함수
 * @param {number} wins - 승수
 * @param {number} losses - 패수
 * @returns {string} "승-패 (승률)" 형식 문자열
 */
export function formatWinLoss(wins, losses) {
  const totalGames = wins + losses;
  const winPercentage = totalGames > 0 ? (wins / totalGames * 100).toFixed(1) : '0.0';
  
  return `${wins}-${losses} (${winPercentage}%)`;
}

/**
 * 큰 숫자를 축약하여 표시하는 함수 (예: 1.2K, 3.4M)
 * @param {number} value - 축약할 숫자
 * @returns {string} 축약된 숫자 문자열
 */
export function formatAbbreviatedNumber(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  } else {
    return value.toString();
  }
}

/**
 * 시즌을 표시 형식으로 포맷하는 함수
 * @param {string} season - 시즌 문자열 (예: "2023-24")
 * @returns {string} 포맷된 시즌 문자열
 */
export function formatSeason(season) {
  if (!season) return '';
  
  if (season.includes('-')) {
    const [startYear, endYear] = season.split('-');
    return `${startYear}-${endYear} 시즌`;
  }
  
  return `${season} 시즌`;
}

/**
 * 효율성 등급에 색상을 매핑하는 함수
 * @param {string} grade - 효율성 등급 (A+, A, B+, B, C)
 * @returns {string} Tailwind 색상 클래스
 */
export function getGradeColor(grade) {
  const colorMap = {
    'A+': 'text-green-600',
    'A': 'text-blue-600',
    'B+': 'text-yellow-600',
    'B': 'text-orange-600',
    'C': 'text-red-600'
  };
  
  return colorMap[grade] || 'text-gray-600';
}

/**
 * 트렌드에 따른 아이콘을 반환하는 함수
 * @param {string} trend - 트렌드 ('up', 'down', 'stable', 'live')
 * @returns {string} 트렌드 아이콘
 */
export function getTrendIcon(trend) {
  const iconMap = {
    'up': '📈',
    'down': '📉',
    'stable': '➡️',
    'live': '🔴'
  };
  
  return iconMap[trend] || '➡️';
}

/**
 * 게임 상태를 한국어로 변환하는 함수
 * @param {string} status - 게임 상태
 * @returns {string} 한국어 게임 상태
 */
export function formatGameStatus(status) {
  const statusMap = {
    'upcoming': '예정',
    'live': '진행중',
    'finished': '종료',
    'postponed': '연기',
    'cancelled': '취소'
  };
  
  return statusMap[status] || status;
}

/**
 * 포지션을 한국어로 변환하는 함수
 * @param {string} position - 포지션 코드
 * @returns {string} 한국어 포지션
 */
export function formatPosition(position) {
  const positionMap = {
    'PG': '포인트 가드',
    'SG': '슈팅 가드', 
    'SF': '스몰 포워드',
    'PF': '파워 포워드',
    'C': '센터',
    'G': '가드',
    'F': '포워드'
  };
  
  return positionMap[position] || position;
}

/**
 * 바이트 단위를 사람이 읽기 쉬운 형태로 변환하는 함수
 * @param {number} bytes - 바이트 수
 * @returns {string} 포맷된 크기 문자열
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}