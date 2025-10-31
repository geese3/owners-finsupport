/**
 * HTML 엔티티 디코딩 유틸리티
 */

/**
 * HTML 엔티티를 디코딩하는 함수
 * @param text 디코딩할 텍스트
 * @returns 디코딩된 텍스트
 */
export function decodeHtmlEntities(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  // HTML 엔티티 매핑
  const htmlEntities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x27;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    '&#160;': ' ',
    '&copy;': '\u00A9',
    '&reg;': '\u00AE',
    '&trade;': '\u2122',
    '&hellip;': '\u2026',
    '&mdash;': '\u2014',
    '&ndash;': '\u2013',
    '&laquo;': '\u00AB',
    '&raquo;': '\u00BB',
    '&lsquo;': '\u2018',
    '&rsquo;': '\u2019',
    '&ldquo;': '\u201C',
    '&rdquo;': '\u201D',
    '&#xD;': '',     // 캐리지 리턴 제거
    '&#xA;': '\n',   // 라인피드는 줄바꿈으로
    '&#13;': '',     // 캐리지 리턴 제거
    '&#10;': '\n',   // 라인피드는 줄바꿈으로
  };

  let decoded = text;

  // 명시적 엔티티 치환
  Object.entries(htmlEntities).forEach(([entity, replacement]) => {
    decoded = decoded.replace(new RegExp(entity, 'g'), replacement);
  });

  // 숫자 형태의 HTML 엔티티 디코딩 (&#숫자;)
  decoded = decoded.replace(/&#(\d+);/g, (match, dec) => {
    return String.fromCharCode(parseInt(dec, 10));
  });

  // 16진수 형태의 HTML 엔티티 디코딩 (&#x16진수;)
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });

  // 연속된 줄바꿈을 단일 줄바꿈으로 변경
  decoded = decoded.replace(/\n+/g, '\n');

  // 앞뒤 공백 제거
  decoded = decoded.trim();

  return decoded;
}

/**
 * 객체의 모든 문자열 속성에 HTML 디코딩을 적용
 * @param obj 디코딩할 객체
 * @returns 디코딩된 객체
 */
export function decodeObjectHtmlEntities<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const decoded = { ...obj };

  Object.keys(decoded).forEach(key => {
    if (typeof decoded[key] === 'string') {
      decoded[key] = decodeHtmlEntities(decoded[key]);
    } else if (Array.isArray(decoded[key])) {
      decoded[key] = decoded[key].map((item: any) =>
        typeof item === 'string' ? decodeHtmlEntities(item) : item
      );
    }
  });

  return decoded;
}

/**
 * 제목과 설명에 특화된 HTML 디코딩
 * @param text 디코딩할 텍스트
 * @returns 디코딩되고 정리된 텍스트
 */
export function decodeTitle(text: string): string {
  if (!text) return text;

  let decoded = decodeHtmlEntities(text);

  // 제목에서 불필요한 줄바꿈 제거
  decoded = decoded.replace(/\n/g, ' ');

  // 연속된 공백을 단일 공백으로 변경
  decoded = decoded.replace(/\s+/g, ' ');

  return decoded.trim();
}

/**
 * 설명에 특화된 HTML 디코딩 (줄바꿈 유지)
 * @param text 디코딩할 텍스트
 * @returns 디코딩되고 정리된 텍스트
 */
export function decodeDescription(text: string): string {
  if (!text) return text;

  let decoded = decodeHtmlEntities(text);

  // 연속된 공백을 단일 공백으로 변경 (줄바꿈은 유지)
  decoded = decoded.replace(/[^\S\n]+/g, ' ');

  return decoded.trim();
}