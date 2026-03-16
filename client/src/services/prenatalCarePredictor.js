import { prenatalCareSchedule } from "../data/prenatalCareSchedule";

export function getUpcomingCare(currentWeek = 20, limit = 3) {
  const week = Math.min(40, Math.max(1, Number(currentWeek) || 20));
  return prenatalCareSchedule
    .filter((item) => Number(item.week) > week)
    .sort((a, b) => Number(a.week) - Number(b.week))
    .slice(0, limit);
}

export default getUpcomingCare;
