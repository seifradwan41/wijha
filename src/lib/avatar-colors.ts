const AVATAR_COLORS = [
  "#2F6FED",
  "#2E7D8C",
  "#7C3AED",
  "#C2410C",
  "#059669",
  "#DC2626",
  "#D97706",
  "#6366F1",
  "#0891B2",
  "#B91C1C",
  "#4F46E5",
  "#0D9488",
];

export function teacherColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
