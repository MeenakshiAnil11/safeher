export function convertToEmbed(url = "") {
  const value = String(url || "").trim();
  if (!value) return "";
  if (value.includes("youtube.com/embed/")) return value;

  if (value.includes("watch?v=")) {
    return value.replace("watch?v=", "embed/");
  }

  if (value.includes("youtu.be/")) {
    const id = value.split("youtu.be/")[1]?.split(/[?&]/)[0];
    return id ? `https://www.youtube.com/embed/${id}` : value;
  }

  return value;
}

export function getTrimester(week) {
  const safeWeek = Math.max(1, Math.min(40, Number(week) || 20));
  if (safeWeek <= 12) return "trimester1";
  if (safeWeek <= 27) return "trimester2";
  return "trimester3";
}

const toWatchUrl = (embedUrl = "") => {
  const normalized = convertToEmbed(embedUrl);
  if (!normalized.includes("/embed/")) return normalized;
  const videoId = normalized.split("/embed/")[1]?.split(/[?&]/)[0];
  return videoId ? `https://www.youtube.com/watch?v=${videoId}` : normalized;
};

export function selectMediaForWeek(group = {}, week = 20) {
  const safeWeek = Math.max(1, Math.min(40, Number(week) || 20));
  const weekKey = `week${safeWeek}`;
  const trimesterKey = getTrimester(safeWeek);

  return (
    group?.[weekKey] ||
    group?.[trimesterKey] ||
    group?.week20 ||
    group?.default ||
    []
  );
}

export function normalizeVideos(videos = []) {
  return (Array.isArray(videos) ? videos : []).map((video) => {
    const embedUrl = convertToEmbed(video?.embedUrl || video?.url || "");
    return {
      ...video,
      embedUrl,
      youtubeUrl: video?.youtubeUrl || toWatchUrl(embedUrl),
    };
  });
}
