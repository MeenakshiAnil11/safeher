import React, { useMemo, useState } from "react";
import { pregnancyVideosByCategory } from "../data/pregnancyVideos";
import { normalizeVideos, selectMediaForWeek } from "../utils/videoUtils";
import "./PregnancyVideoSection.css";

export default function PregnancyVideoSection({
  category = "nutrition",
  week = 20,
  title = "Recommended Videos",
}) {
  const [failedVideos, setFailedVideos] = useState({});

  const videos = useMemo(() => {
    const raw = selectMediaForWeek(pregnancyVideosByCategory?.[category] || {}, week);
    return normalizeVideos(raw);
  }, [category, week]);

  if (!videos.length) return null;

  return (
    <section className="preg-video-section">
      <h3>{title}</h3>
      <div className="preg-video-grid">
        {videos.map((video, index) => (
          <article key={`${video.title}-${index}`} className="preg-video-card">
            {!failedVideos[index] ? (
              <div className="preg-video-frame-wrap">
                <iframe
                  src={video.embedUrl}
                  width="100%"
                  height="220"
                  title={video.title}
                  frameBorder="0"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onError={() =>
                    setFailedVideos((prev) => ({
                      ...prev,
                      [index]: true,
                    }))
                  }
                />
              </div>
            ) : (
              <div className="preg-video-fallback">
                <p>Video unavailable in embedded mode.</p>
                <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer">
                  Watch on YouTube
                </a>
              </div>
            )}

            <h4>{video.title}</h4>
            <a className="preg-video-youtube-link" href={video.youtubeUrl} target="_blank" rel="noopener noreferrer">
              ▶ Watch on YouTube
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
