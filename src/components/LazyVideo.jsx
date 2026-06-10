import { useEffect, useRef } from 'react';

// Tour-card video that defers its multi-MB download until it scrolls into
// view. The home page carries 11 videos (~44MB total) — with preload="none"
// + a poster frame, first paint costs ~100KB per card instead, and an
// IntersectionObserver starts/stops playback as cards enter/leave the
// viewport (also saving battery on mobile).
//
// Poster convention: every /assets/**/<name>.mp4 has a <name>.jpg sibling
// generated from its 1s frame.
const LazyVideo = ({ src, className }) => {
  const videoRef = useRef(null);
  const poster = src.replace(/\.mp4$/i, '.jpg');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // play() kicks off the (lazy) download; ignore the rejection
            // some browsers raise when autoplay is interrupted.
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      className={className}
      muted
      loop
      playsInline
      preload="none"
      poster={poster}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
};

export default LazyVideo;
