export function formatBurmeseRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 45) {
    return 'ခုနက';
  } else if (diffMin < 60) {
    return `${diffMin} မိနစ်ခန့်က`;
  } else if (diffHours < 24) {
    return `${diffHours} နာရီခန့်က`;
  } else if (diffDays === 1) {
    return 'မနေ့က';
  } else if (diffDays < 30) {
    return `${diffDays} ရက်ခန့်က`;
  } else {
    return new Date(timestamp).toLocaleDateString('my-MM', {
      month: 'short',
      day: 'numeric',
    });
  }
}
