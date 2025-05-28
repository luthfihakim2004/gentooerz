export function duration(ms) {
  const sec = Math.floor(ms / 1000) % 60;
  const min = Math.floor(ms / 60000) % 60;
  const hrs = Math.floor(ms / 3600000);
  return `${hrs}h ${min}m ${sec}s`;
}
