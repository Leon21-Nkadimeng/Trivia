export function formatDuration(microseconds) {
  const totalSeconds = Math.floor(microseconds / 1_000_000); // if truly microseconds
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}
