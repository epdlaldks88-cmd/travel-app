# 나만의 여행 노트 - 디자인 시스템 (Design System)

본 문서는 여행 관리 앱의 테마 스킴, 타이포그래피, 고정 디자인 토큰 및 공통 UI 컴포넌트 스타일 가이드라인을 정의합니다.

---

## 1. 컬러 시스템 (Color Schemes)

여행 관리 앱은 사용자의 감성과 기분에 따라 변경할 수 있는 **10가지 테마 프리셋**을 제공합니다. 라이트 모드 6종, 다크 모드 4종으로 구성되어 있습니다.

### 라이트 테마 (Light Themes)

| 테마명 (Key) | 배경 (bg) | 서브 배경 (surfaceAlt) | 주요 텍스트 (text) | 포인트 색상 (accent) | 테마 특징 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **크림 (cream)** | `#FDFBF7` | `#F6F3EB` | `#1C1917` | `#B27A50` | 따뜻하고 아늑한 웜 아이보리 & 카라멜 톤 |
| **오션 (ocean)** | `#F3F8FC` | `#E6F0FA` | `#0F172A` | `#0284C7` | 청량하고 투명한 오션 블루 & 스카이 톤 |
| **포레스트 (forest)** | `#F5F7F4` | `#E8EDE4` | `#1C2E1A` | `#3B7A57` | 차분하고 릴렉싱한 말차 화이트 & 세이지 그린 톤 |
| **선셋 (sunset)** | `#FFF8F6` | `#FFEAE4` | `#2D1610` | `#E05E43` | 부드러운 피치 코랄 & 타오르는 자몽 노을 톤 |
| **미니멀 (minimal)** | `#F8FAFC` | `#F1F5F9` | `#0F172A` | `#0F172A` | 정제된 쿨그레이 스케일과 블랙 액센트 톤 |
| **라벤더 (lavender)** | `#FAF8FF` | `#F0ECFC` | `#211B35` | `#8B5CF6` | 몽환적이고 사랑스러운 라벤더 바이올렛 톤 |

### 다크 테마 (Dark Themes)

| 테마명 (Key) | 배경 (bg) | 서브 배경 (surfaceAlt) | 주요 텍스트 (text) | 포인트 색상 (accent) | 테마 특징 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **다크크림 (darkCream)** | `#181512` | `#231F1A` | `#F7F4EF` | `#E5BA73` | 에스프레소 & 초콜릿 바탕의 럭셔리 샴페인 골드 톤 |
| **다크오션 (darkOcean)** | `#0B0F19` | `#121826` | `#F1F5F9` | `#38BDF8` | 심해의 짙은 네이비에 네온 블루 액센트 톤 |
| **순수다크 (pureDark)** | `#000000` | `#0F0F10` | `#FFFFFF` | `#F5F5F7` | OLED 리얼 블랙 베이스와 스페이스 그레이 대비 톤 |
| **미드나잇 (midnight)** | `#0B0813` | `#141024` | `#F1EDFA` | `#A78BFA` | 우주적인 보랏빛 블랙과 네온 퍼플 액센트 톤 |

---

## 2. 타이포그래피 (Typography)

사용자의 글쓰기 감성을 극대화하기 위해 총 **8가지 폰트 프리셋**을 매핑했습니다. 

| 폰트명 (Key) | 설명 | 제목 폰트 (heading) | 본문 폰트 (body) |
| :--- | :--- | :--- | :--- |
| **에디토리얼 (editorial)** | 감성 명조 + 부드러운 산세리프 | `Maru Buri`, `Gowun Batang` | `Gowun Dodum` |
| **부드러움 (soft)** | 다정하고 통일된 산세리프 | `Gowun Dodum` | `Gowun Dodum` |
| **모던 (modern)** | 깔끔하고 시원한 모던 체 | `Wanted Sans` | `Wanted Sans` |
| **감성 명조 (classic)** | 클래식한 명조 일관성 | `Gowun Batang` | `Gowun Batang` |
| **손글씨 (handwriting)** | 개성 넘치는 손글씨 분위기 | `Ownglyph_meetme-Rg` | `Gowun Dodum` |
| **프리미엄 모던 (pretendard)** | 정밀하게 다듬어진 표준 산세리프 | `Pretendard`, `Inter` | `Pretendard`, `Inter` |
| **시적인 감성 (sensitive)** | 시적인 깊이와 가녀린 명조 | `Song Myung` | `Gowun Dodum` |
| **아기자기 (cute)** | 동글동글하고 귀여운 일기장 톤 | `Single Day`, `Jua` | `Gamja Flower`, `Jua` |

---

## 3. 그림자 및 공간 토큰 (Elevation & Tokens)

그림자는 모드(라이트/다크)에 반응하여, 다크 모드 시 그림자가 너무 강하게 번지는 것을 방지하도록 설계되었습니다.

```css
/* 라이트 모드 (기본) */
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.02);
--shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.06), 0 4px 12px rgba(0, 0, 0, 0.02);

/* 다크 모드 (html[data-mode="dark"]) */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.45);
--shadow-lg: 0 16px 40px rgba(0, 0, 0, 0.6);
```

---

## 4. 컴포넌트 스타일링 & 인터랙션

### 카드 (Card)
- **스타일**: 기본적으로 소프트 섀도우(`shadow-sm`)와 부드러운 라운딩(`rounded-2xl`)이 적용됩니다.
- **인터랙션**: 클릭 가능한 카드는 호버 시 살짝 떠오르는 모션(`hover:-translate-y-0.5 hover:shadow-md`)이 구현되며, 클릭 시에는 들어가는 연출(`active:translate-y-0 active:shadow-sm`)이 적용됩니다.

### 버튼 (Button)
- **스타일**: 브랜드 포인트 색상(`bg-accent`)에 맞춰 자동으로 조화롭게 반사됩니다.
- **인터랙션**: 호버 시 살짝 부풀고(`hover:scale-[1.015]`), 클릭할 때 자연스럽게 햅틱 모션처럼 수축(`active:scale-[0.985]`)하는 스케일 피드백이 제공됩니다.

### 하단 탭 바 (BottomTabBar)
- **스타일**: 반투명 글래스모피즘(`bg-bg/80 backdrop-blur-lg border-t border-border/80 shadow-lg`)을 갖춰 뒷배경이 비치는 프리미엄 스마트폰 앱 룩앤필을 구현했습니다.
- **인터랙션**: 중간 플로팅 액션 버튼(FAB)은 호버 시 탄력적인 팝업 모션(`hover:scale-110 active:scale-95`)이 발동하며, 탭 아이콘은 활성 상태일 때 확대 스냅핑(`scale-110`) 효과가 들어갑니다.
