import { useEffect, useRef } from 'react';
import './Gallery.css';

const images = [
  'WhatsApp%20Image%202026-03-01%20at%2015.41.40.jpeg',
  'WhatsApp%20Image%202026-03-01%20at%2015.41.40%20%281%29.jpeg',
  'WhatsApp%20Image%202026-03-01%20at%2015.41.41%20%285%29.jpeg',
  'WhatsApp%20Image%202026-03-01%20at%2015.41.41%20%2810%29.jpeg',
  'WhatsApp%20Image%202026-03-01%20at%2015.41.41%20%2815%29.jpeg',
  'WhatsApp%20Image%202026-03-01%20at%2015.41.41%20%2820%29.jpeg',
  'WhatsApp%20Image%202026-03-01%20at%2015.41.41%20%2825%29.jpeg',
  'WhatsApp%20Image%202026-03-01%20at%2015.41.41%20%2830%29.jpeg',
  'WhatsApp%20Image%202026-03-01%20at%2015.41.41%20%2835%29.jpeg',
  'WhatsApp%20Image%202026-03-01%20at%2015.41.41%20%2840%29.jpeg',
  'WhatsApp%20Image%202026-03-01%20at%2015.41.41%20%2845%29.jpeg',
  'WhatsApp%20Image%202026-03-01%20at%2015.41.41%20%2850%29.jpeg',
  'WhatsApp%20Image%202026-03-01%20at%2015.41.42.jpeg',
  'WhatsApp%20Image%202026-03-01%20at%2015.41.47.jpeg',
  'WhatsApp%20Image%202026-03-01%20at%2015.41.47%20%285%29.jpeg',
  'WhatsApp%20Image%202026-03-01%20at%2015.41.47%20%2810%29.jpeg',
];

const SPEED = 1.2;
const RESUME_DELAY = 2500; // ms before auto-slide resumes after interaction

const Gallery = () => {
  const trackRef = useRef(null);
  const posRef = useRef(0);
  const isDragging = useRef(false);
  const isPaused = useRef(false);
  const dragStartX = useRef(0);
  const dragStartPos = useRef(0);
  const rafRef = useRef(null);
  const resumeTimer = useRef(null);

  const getHalfWidth = () => trackRef.current.scrollWidth / 2;

  const clampPos = (pos) => {
    const half = getHalfWidth();
    if (pos <= -half) return pos + half;
    if (pos > 0) return pos - half;
    return pos;
  };

  const scheduleResume = () => {
    clearTimeout(resumeTimer.current);
    isPaused.current = true;
    resumeTimer.current = setTimeout(() => {
      isPaused.current = false;
    }, RESUME_DELAY);
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // --- Animation loop ---
    const loop = () => {
      if (!isDragging.current && !isPaused.current) {
        posRef.current = clampPos(posRef.current - SPEED);
        track.style.transform = `translateX(${posRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    // --- Mouse events on window so fast moves don't drop the drag ---
    const onMouseMove = (e) => {
      if (!isDragging.current) return;
      const delta = e.clientX - dragStartX.current;
      posRef.current = clampPos(dragStartPos.current + delta);
      track.style.transform = `translateX(${posRef.current}px)`;
    };

    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      track.style.cursor = 'grab';
      scheduleResume();
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(resumeTimer.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const onMouseDown = (e) => {
    e.preventDefault();
    isDragging.current = true;
    isPaused.current = true;
    clearTimeout(resumeTimer.current);
    dragStartX.current = e.clientX;
    dragStartPos.current = posRef.current;
    trackRef.current.style.cursor = 'grabbing';
  };

  const onTouchStart = (e) => {
    isDragging.current = true;
    isPaused.current = true;
    clearTimeout(resumeTimer.current);
    dragStartX.current = e.touches[0].clientX;
    dragStartPos.current = posRef.current;
  };

  const onTouchMove = (e) => {
    if (!isDragging.current) return;
    const delta = e.touches[0].clientX - dragStartX.current;
    posRef.current = clampPos(dragStartPos.current + delta);
    trackRef.current.style.transform = `translateX(${posRef.current}px)`;
  };

  const onTouchEnd = () => {
    isDragging.current = false;
    scheduleResume();
  };

  const nudge = (dir) => {
    const track = trackRef.current;
    scheduleResume();
    const newPos = clampPos(posRef.current + dir * 300);
    posRef.current = newPos;
    track.style.transition = 'transform 400ms ease';
    track.style.transform = `translateX(${newPos}px)`;
    setTimeout(() => { track.style.transition = ''; }, 420);
  };

  return (
    <section className="gallery-section">
      <button className="gallery-arrow gallery-arrow-left" onClick={() => nudge(1)} aria-label="Scroll left">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>

      <div className="gallery-track-wrapper">
        <div
          className="gallery-track"
          ref={trackRef}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {[...images, ...images].map((img, i) => (
            <div className="gallery-item" key={i}>
              <img
                src={`/assets/galleryimages/${img}`}
                alt=""
                loading="lazy"
                decoding="async"
                draggable="false"
              />
            </div>
          ))}
        </div>
      </div>

      <button className="gallery-arrow gallery-arrow-right" onClick={() => nudge(-1)} aria-label="Scroll right">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>
    </section>
  );
};

export default Gallery;
