import { useEffect, useState } from "react";
import {
  IconChevronDown,
  IconChevronUp,
  IconCloud,
  IconSun,
  IconCloudRain,
  IconSnowflake,
  IconWind,
} from "@tabler/icons-react";
import { Button, Card, Chip, Input, Label, Rating, Textarea } from "./ui";

const WEATHER_PRESETS = [
  { value: "맑음", icon: IconSun },
  { value: "흐림", icon: IconCloud },
  { value: "비", icon: IconCloudRain },
  { value: "눈", icon: IconSnowflake },
  { value: "바람", icon: IconWind },
];

/**
 * 하루 단위 노트 카드.
 * 접힌 상태: 하이라이트 한 줄 or "노트 없음"
 * 펼친 상태: 편집 가능 (기상/취침/날씨/기분/하이라이트/일기)
 */
function DayNoteCard({
  date,
  dayLabel,
  note,
  defaultExpanded = false,
  onSave,
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [saving, setSaving] = useState(false);

  const [wakeTime, setWakeTime] = useState(note?.wakeTime ?? "");
  const [sleepTime, setSleepTime] = useState(note?.sleepTime ?? "");
  const [weather, setWeather] = useState(note?.weather ?? "");
  const [weatherCustom, setWeatherCustom] = useState(
    note?.weather && !WEATHER_PRESETS.some((w) => w.value === note.weather)
      ? note.weather
      : "",
  );
  const [mood, setMood] = useState(note?.mood ?? 0);
  const [highlight, setHighlight] = useState(note?.highlight ?? "");
  const [journal, setJournal] = useState(note?.journal ?? "");

  // 노트가 pull로 늦게 도착하는 경우 반영
  useEffect(() => {
    if (note) {
      setWakeTime(note.wakeTime ?? "");
      setSleepTime(note.sleepTime ?? "");
      setWeather(note.weather ?? "");
      setWeatherCustom(
        note.weather && !WEATHER_PRESETS.some((w) => w.value === note.weather)
          ? note.weather
          : "",
      );
      setMood(note.mood ?? 0);
      setHighlight(note.highlight ?? "");
      setJournal(note.journal ?? "");
    }
  }, [note?.id, note?.updatedAt]);

  const isPresetWeather = (v) => WEATHER_PRESETS.some((w) => w.value === v);

  const handlePickWeather = (v) => {
    if (weather === v) {
      setWeather("");
    } else {
      setWeather(v);
      setWeatherCustom("");
    }
  };

  const handleWeatherCustomChange = (e) => {
    const v = e.target.value;
    setWeatherCustom(v);
    // 프리셋과 겹치지 않으면 weather 필드로 반영
    if (v && !isPresetWeather(v)) {
      setWeather(v);
    } else if (!v && !isPresetWeather(weather)) {
      setWeather("");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        wakeTime: wakeTime || null,
        sleepTime: sleepTime || null,
        weather: weather || "",
        mood: mood || null,
        highlight: highlight.trim(),
        journal: journal.trim(),
      });
    } finally {
      setSaving(false);
    }
  };

  const hasContent =
    !!highlight ||
    !!journal ||
    !!weather ||
    !!wakeTime ||
    !!sleepTime ||
    mood > 0;

  const formatDate = (str) => {
    if (!str) return "";
    return str.replaceAll("-", ".").slice(5);
  };

  return (
    <Card padding="none" className="mb-2 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-surface-alt transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-text">
              {formatDate(date)}
            </span>
            {dayLabel && (
              <span className="text-xs text-text-muted">{dayLabel}</span>
            )}
            {hasContent && weather && (
              <span className="text-xs text-text-muted">· {weather}</span>
            )}
            {hasContent && mood > 0 && (
              <span className="text-xs text-accent">◆ {mood.toFixed(1)}</span>
            )}
          </div>
          <p
            className={`text-xs mt-1 truncate ${
              highlight ? "text-text-muted" : "text-text-subtle"
            }`}
          >
            {highlight || (hasContent ? "..." : "노트 없음")}
          </p>
        </div>

        {expanded ? (
          <IconChevronUp size={18} className="text-text-muted shrink-0" />
        ) : (
          <IconChevronDown size={18} className="text-text-muted shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-border space-y-3">
          {/* 기상/취침 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>기상</Label>
              <Input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
              />
            </div>
            <div>
              <Label>취침</Label>
              <Input
                type="time"
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
              />
            </div>
          </div>

          {/* 날씨 */}
          <div>
            <Label>날씨</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {WEATHER_PRESETS.map((w) => {
                const Icon = w.icon;
                return (
                  <Chip
                    key={w.value}
                    variant={weather === w.value ? "selected" : "default"}
                    onClick={() => handlePickWeather(w.value)}
                    icon={<Icon size={14} />}
                  >
                    {w.value}
                  </Chip>
                );
              })}
            </div>
            <Input
              value={weatherCustom}
              onChange={handleWeatherCustomChange}
              placeholder="기타 (직접 입력)"
              size="sm"
            />
          </div>

          {/* 기분 */}
          <div>
            <Label>기분</Label>
            <Rating value={mood} onChange={setMood} size="lg" />
          </div>

          {/* 하이라이트 */}
          <div>
            <Label>하이라이트</Label>
            <Input
              value={highlight}
              onChange={(e) => setHighlight(e.target.value)}
              placeholder="이 날의 한 줄"
            />
          </div>

          {/* 일기 */}
          <div>
            <Label>일기</Label>
            <Textarea
              value={journal}
              onChange={(e) => setJournal(e.target.value)}
              placeholder="자유롭게 남기고 싶은 이야기"
              rows={4}
              className="resize-none"
            />
          </div>

          <Button
            variant="primary"
            onClick={handleSave}
            fullWidth
            loading={saving}
          >
            저장
          </Button>
        </div>
      )}
    </Card>
  );
}

export default DayNoteCard;
