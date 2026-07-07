import { useEffect, useMemo, useRef, useState } from "react";

const navItems = [
  { label: "Build", href: "#estate" },
  { label: "Services", href: "#services" },
  { label: "Process", href: "#details" },
  { label: "Quote", href: "#contact" }
];

const chapters = [
  {
    id: "estate",
    kind: "estate",
    title: "From Raw Land To Finished Home",
    intro: "A cinematic construction journey for custom homes, additions, and major renovations.",
    sequence: "BDL Construction / Ajax, Ontario",
    stages: ["Site", "Foundation", "Frame", "Envelope", "Landscape", "Complete"],
    frames: {
      site: "/assets/frames/estate-site.png",
      frame: "/assets/frames/estate-frame.png",
      complete: "/assets/frames/estate-complete.png"
    },
    video: {
      src: "/assets/video/estate-scroll-scrub-optimized.mp4",
      poster: "/assets/video/estate-scroll-full-poster.jpg",
      final: "/assets/video/estate-scroll-full-final.jpg",
      mobilePoster: "/assets/video/estate-scroll-mobile-poster.jpg",
      mobileFinal: "/assets/video/estate-scroll-mobile-final.jpg",
      mobileSequence: {
        frameBase: "/assets/mobile-sequence/estate-mobile-",
        frameCount: 60,
        extension: "jpg",
        pad: 4,
        poster: "/assets/mobile-sequence/estate-mobile-0001.jpg"
      }
    },
    stats: [
      ["Custom", "Home Builds"],
      ["Major", "Renovations"],
      ["Additions", "Extensions"],
      ["Ajax", "Local Service"]
    ]
  }
];

const residences = [
  {
    name: "Custom Home Builds",
    location: "Ground-Up Construction",
    price: "From Site To Keys",
    image: "/assets/video/estate-scroll-full-final.jpg",
    stats: ["Planning", "Framing", "Finishing"],
    note: "A premium landing page can show homeowners the full transformation before they ever book a call."
  },
  {
    name: "Whole-Home Renovations",
    location: "Interior Rebuilds",
    price: "Modernize The Home",
    image: "/assets/great-room.png",
    stats: ["Layout", "Millwork", "Lighting"],
    note: "For high-ticket renovations, the page can present the before, the plan, and the finished lifestyle in one flow."
  },
  {
    name: "Home Additions",
    location: "More Space, Better Living",
    price: "Expand With Purpose",
    image: "/assets/frames/estate-complete.png",
    stats: ["Second floor", "Rear addition", "Garage"],
    note: "A contractor can use this format to make extensions feel clear, controlled, and worth the investment."
  },
  {
    name: "Kitchen & Main Floor",
    location: "High-Impact Remodeling",
    price: "Daily Life Upgraded",
    image: "/assets/kitchen.png",
    stats: ["Kitchen", "Open concept", "Finishes"],
    note: "The same cinematic system can turn finished rooms into persuasive, trust-building case studies."
  }
];

const detailGroups = [
  {
    title: "Plan",
    items: ["Discovery call", "Site review", "Scope outline", "Estimate direction"]
  },
  {
    title: "Build",
    items: ["Demolition or site prep", "Foundation and framing", "Trade coordination", "Progress updates"]
  },
  {
    title: "Finish",
    items: ["Interior details", "Exterior completion", "Final walkthrough", "Handover ready"]
  }
];

const contactFields = [
  { label: "Name", name: "name", type: "text", autoComplete: "name" },
  { label: "Email", name: "email", type: "email", autoComplete: "email" },
  { label: "Project Type", name: "projectType", type: "text", autoComplete: "off" },
  { label: "Approx. Budget", name: "budget", type: "text", autoComplete: "off" }
];

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function smooth(value) {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
}

function mapRange(progress, start, end) {
  return smooth((progress - start) / (end - start));
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? window.scrollY / max : 0);
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return progress;
}

function useSectionProgress(sectionRef) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const node = sectionRef.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const scrollable = Math.max(rect.height - window.innerHeight, 1);
        setProgress(clamp(-rect.top / scrollable));
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [sectionRef]);

  return progress;
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

function useSaveData() {
  const [saveData, setSaveData] = useState(false);

  useEffect(() => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (!connection) return;

    const update = () => {
      const effectiveType = connection.effectiveType || "";
      setSaveData(Boolean(connection.saveData) || /(^|-)2g$/.test(effectiveType));
    };

    update();
    connection.addEventListener?.("change", update);
    return () => connection.removeEventListener?.("change", update);
  }, []);

  return saveData;
}

function useNearViewport(ref, rootMargin = "80% 0px") {
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (!("IntersectionObserver" in window)) {
      setIsNear(true);
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          setIsNear(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return isNear;
}

function useReveal() {
  useEffect(() => {
    const targets = document.querySelectorAll("[data-slide]");
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -14% 0px", threshold: 0.16 }
    );

    targets.forEach(target => observer.observe(target));
    return () => observer.disconnect();
  }, []);
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function Header({ menuOpen, setMenuOpen }) {
  return (
    <header className="site-header">
      <a className="brand-mark" href="#estate" aria-label="BDL Construction home">
        BDL
      </a>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {navItems.map(item => (
          <a href={item.href} key={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
      <a className="header-cta" href="#contact">
        Request Estimate
      </a>
      <button
        className="menu-button"
        type="button"
        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(open => !open)}
      >
        <MenuIcon />
      </button>
      <div className={`mobile-menu ${menuOpen ? "is-open" : ""}`} aria-hidden={!menuOpen}>
        {navItems.map(item => (
          <a href={item.href} key={item.href} tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)}>
            {item.label}
          </a>
        ))}
      </div>
    </header>
  );
}

function StageRail({ stages, progress }) {
  return (
    <div className="stage-rail" aria-label="Construction progress">
      <span className="rail-line">
        <span style={{ transform: `scaleY(${progress})` }} />
      </span>
      {stages.map((stage, index) => {
        const stageProgress = index / Math.max(stages.length - 1, 1);
        return (
          <span className={progress >= stageProgress - 0.04 ? "is-active" : ""} key={stage}>
            {stage}
          </span>
        );
      })}
    </div>
  );
}

function FrameStack({ chapter, progress }) {
  const structureOpacity = progress < 0.72 ? mapRange(progress, 0.16, 0.38) : 1 - mapRange(progress, 0.72, 0.88);
  const completeReveal = mapRange(progress, 0.58, 0.92);
  const siteDim = 1 - mapRange(progress, 0.14, 0.38) * 0.5;
  const siteScale = 1.05 + progress * 0.05;
  const frameScale = 1.08 - mapRange(progress, 0.16, 0.66) * 0.04;
  const completeScale = 1.1 - completeReveal * 0.06;

  return (
    <div
      className={`frame-stack ${chapter.kind}`}
      style={{
        "--site-dim": siteDim,
        "--structure-opacity": structureOpacity,
        "--complete-opacity": completeReveal,
        "--complete-clip": `${Math.round((1 - completeReveal) * 64)}%`,
        "--scan": `${Math.round(progress * 100)}%`,
        "--site-scale": siteScale,
        "--frame-scale": frameScale,
        "--complete-scale": completeScale
      }}
    >
      <img className="scene-frame scene-site" src={chapter.frames.site} alt="" loading="eager" decoding="async" />
      <img className="scene-frame scene-structure" src={chapter.frames.frame} alt="" loading="eager" decoding="async" />
      <img className="scene-frame scene-complete" src={chapter.frames.complete} alt="" loading="eager" decoding="async" />
      <div className="construction-grid" />
      <div className="scan-band" />
      <div className="scene-grade" />
    </div>
  );
}

function StaticBuildScene({ chapter, progress }) {
  const completeReveal = mapRange(progress, 0.18, 0.86);
  const poster = chapter.video?.mobilePoster || chapter.video?.poster || chapter.frames.site;
  const finalFrame = chapter.video?.mobileFinal || chapter.video?.final || chapter.frames.complete;

  return (
    <div
      className={`static-build-scene ${chapter.kind}`}
      style={{
        "--complete-opacity": completeReveal,
        "--start-scale": 1.018 + progress * 0.018,
        "--finish-scale": 1.036 - completeReveal * 0.018
      }}
      aria-hidden="true"
    >
      <img className="static-scene-image static-scene-start" src={poster} alt="" loading="eager" decoding="async" />
      <img className="static-scene-image static-scene-finish" src={finalFrame} alt="" loading="eager" decoding="async" />
      <div className="scene-grade" />
    </div>
  );
}

function formatFrameUrl(sequence, index) {
  const frameNumber = String(index).padStart(sequence.pad ?? 4, "0");
  return `${sequence.frameBase}${frameNumber}.${sequence.extension ?? "jpg"}`;
}

function findNearestLoadedFrame(images, targetIndex) {
  if (images[targetIndex]) return images[targetIndex];

  for (let offset = 1; offset < images.length; offset += 1) {
    const before = targetIndex - offset;
    const after = targetIndex + offset;

    if (before >= 0 && images[before]) return images[before];
    if (after < images.length && images[after]) return images[after];
  }

  return null;
}

function drawCoverFrame(canvas, image) {
  const context = canvas.getContext("2d", { alpha: false });
  if (!context || !image?.naturalWidth || !image?.naturalHeight || !canvas.width || !canvas.height) return;

  const canvasRatio = canvas.width / canvas.height;
  const imageRatio = image.naturalWidth / image.naturalHeight;
  let sourceWidth = image.naturalWidth;
  let sourceHeight = image.naturalHeight;
  let sourceX = 0;
  let sourceY = 0;

  if (imageRatio > canvasRatio) {
    sourceWidth = image.naturalHeight * canvasRatio;
    sourceX = (image.naturalWidth - sourceWidth) / 2;
  } else {
    sourceHeight = image.naturalWidth / canvasRatio;
    sourceY = (image.naturalHeight - sourceHeight) / 2;
  }

  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
}

function scheduleIdleWork(callback, timeout = 1600) {
  if ("requestIdleCallback" in window) {
    const idleId = window.requestIdleCallback(callback, { timeout });
    return () => window.cancelIdleCallback?.(idleId);
  }

  const timeoutId = window.setTimeout(callback, timeout);
  return () => window.clearTimeout(timeoutId);
}

function MobileCanvasSequence({ chapter, progress }) {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const requestedFramesRef = useRef(new Set());
  const loadFrameWindowRef = useRef(() => {});
  const progressRef = useRef(0);
  const drawRafRef = useRef(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const sequence = chapter.video?.mobileSequence;
  const frameCount = sequence?.frameCount ?? 0;
  const shouldLoad = useNearViewport(wrapperRef, "120% 0px");
  const poster = sequence?.poster || chapter.video?.mobilePoster || chapter.video?.poster;
  const canvasActive = ready && progress > 0.006;

  const drawCurrentFrame = () => {
    const canvas = canvasRef.current;
    const images = imagesRef.current;
    const targetIndex = Math.round(progressRef.current * Math.max(frameCount - 1, 0));
    const image = findNearestLoadedFrame(images, targetIndex);

    if (canvas && image) {
      drawCoverFrame(canvas, image);
    }
  };

  const requestDraw = () => {
    cancelAnimationFrame(drawRafRef.current);
    drawRafRef.current = requestAnimationFrame(drawCurrentFrame);
  };

  useEffect(() => {
    progressRef.current = clamp(progress);
    if (!ready) return;

    if (progress > 0.006) {
      const targetIndex = Math.round(progressRef.current * Math.max(frameCount - 1, 0));
      loadFrameWindowRef.current(targetIndex, 3);
    }

    requestDraw();
  }, [progress, ready, frameCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const resize = () => {
      const rect = wrapper.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(rect.width * ratio));
      const height = Math.max(1, Math.round(rect.height * ratio));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      requestDraw();
    };

    resize();
    const resizeObserver = "ResizeObserver" in window ? new ResizeObserver(resize) : null;
    resizeObserver?.observe(wrapper);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(drawRafRef.current);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [ready]);

  useEffect(() => {
    if (!shouldLoad || !sequence || !frameCount) return;

    let cancelled = false;
    let warmupTimeout = 0;
    let remainingTimeout = 0;
    let cancelRemainingIdle = () => {};
    imagesRef.current = new Array(frameCount);
    requestedFramesRef.current = new Set();
    setReady(false);
    setFailed(false);

    const loadImage = index => {
      if (index < 0 || index >= frameCount) return Promise.resolve();
      if (imagesRef.current[index] || requestedFramesRef.current.has(index)) return Promise.resolve();

      requestedFramesRef.current.add(index);

      return new Promise(resolve => {
        const image = new Image();
        image.decoding = "async";
        image.fetchPriority = index === 0 ? "high" : "low";
        image.onload = () => {
          if (!cancelled) {
            imagesRef.current[index] = image;
            if (index === 0) {
              setReady(true);
            }
            requestDraw();
          }
          resolve();
        };
        image.onerror = () => {
          if (!cancelled && index === 0) {
            setFailed(true);
          }
          resolve();
        };
        image.src = formatFrameUrl(sequence, index + 1);
      });
    };

    const loadFrameWindow = (centerIndex, radius = 2) => {
      const start = Math.max(0, centerIndex - radius);
      const end = Math.min(frameCount - 1, centerIndex + radius);
      const loaders = [];

      for (let index = start; index <= end; index += 1) {
        loaders.push(loadImage(index));
      }

      return Promise.all(loaders);
    };

    loadFrameWindowRef.current = loadFrameWindow;

    const loadRemainingFrames = async () => {
      for (let start = 1; start < frameCount && !cancelled; start += 3) {
        await Promise.all(
          [0, 1, 2]
            .map(offset => start + offset)
            .filter(index => index < frameCount)
            .map(loadImage)
        );
      }
    };

    loadImage(0).then(() => {
      if (cancelled) return;

      warmupTimeout = window.setTimeout(() => {
        if (!cancelled) {
          loadFrameWindow(0, 5);
        }
      }, 2600);

      remainingTimeout = window.setTimeout(() => {
        if (!cancelled) {
          cancelRemainingIdle = scheduleIdleWork(loadRemainingFrames, 2400);
        }
      }, 5200);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(warmupTimeout);
      window.clearTimeout(remainingTimeout);
      cancelRemainingIdle();
    };
  }, [shouldLoad, sequence, frameCount]);

  if (!sequence || failed) {
    return <StaticBuildScene chapter={chapter} progress={progress} />;
  }

  return (
    <div ref={wrapperRef} className={`mobile-canvas-scene ${chapter.kind}`} aria-hidden="true">
      {poster && (
        <img
          className="video-poster mobile-canvas-poster"
          src={poster}
          alt=""
          width="720"
          height="1280"
          loading="eager"
          decoding="sync"
          fetchPriority="high"
        />
      )}
      <canvas ref={canvasRef} className={`mobile-sequence-canvas ${ready ? "is-ready" : ""} ${canvasActive ? "is-active" : ""}`} />
      <div className="scene-grade" />
    </div>
  );
}

function ScrollScrubVideo({ chapter, progress }) {
  const wrapperRef = useRef(null);
  const videoRef = useRef(null);
  const frameRef = useRef(0);
  const lastSeekRef = useRef(0);
  const targetProgressRef = useRef(0);
  const [metadataReady, setMetadataReady] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const shouldLoad = useNearViewport(wrapperRef);
  const structureOpacity = mapRange(progress, 0.14, 0.72);

  useEffect(() => {
    targetProgressRef.current = clamp(progress);
  }, [progress]);

  useEffect(() => {
    const video = videoRef.current;
    if (!shouldLoad || !video || !metadataReady || !Number.isFinite(video.duration) || video.duration <= 0) return;

    let active = true;
    const duration = Math.max(video.duration - 0.04, 0);

    const scrub = () => {
      if (!active) return;

      const targetTime = targetProgressRef.current * duration;
      const delta = targetTime - video.currentTime;
      const now = performance.now();

      if (Math.abs(delta) > 0.025 && video.readyState >= 2 && !video.seeking && now - lastSeekRef.current > 32) {
        const maxStep = Math.abs(delta) > 1 ? 0.34 : 0.18;
        const nextTime = video.currentTime + clamp(delta * 0.36, -maxStep, maxStep);
        try {
          video.currentTime = clamp(nextTime, 0, duration);
          lastSeekRef.current = now;
        } catch {
          setFailed(true);
        }
      }

      frameRef.current = requestAnimationFrame(scrub);
    };

    frameRef.current = requestAnimationFrame(scrub);

    return () => {
      active = false;
      cancelAnimationFrame(frameRef.current);
    };
  }, [metadataReady, shouldLoad]);

  if (failed || !chapter.video?.src) {
    return <FrameStack chapter={chapter} progress={progress} />;
  }

  return (
    <div
      ref={wrapperRef}
      className={`video-stack ${chapter.kind}`}
      style={{
        "--scan": `${Math.round(progress * 100)}%`,
        "--video-progress": progress,
        "--structure-opacity": structureOpacity
      }}
    >
      <img className="video-poster" src={chapter.video.poster} alt="" loading="eager" decoding="async" />
      <video
        ref={videoRef}
        className={`scroll-video ${ready ? "is-ready" : ""}`}
        src={shouldLoad ? chapter.video.src : undefined}
        poster={chapter.video.poster}
        preload={shouldLoad ? "auto" : "none"}
        muted
        playsInline
        onLoadedMetadata={() => {
          const video = videoRef.current;
          if (video) {
            video.muted = true;
            video.pause();
            video.currentTime = 0;
          }
          setMetadataReady(true);
        }}
        onLoadedData={() => setReady(true)}
        onCanPlay={() => setReady(true)}
        onError={() => setFailed(true)}
        aria-hidden="true"
      />
      <div className="scene-grade" />
    </div>
  );
}

function VisualSequence({ chapter, progress, mobileExperience, staticExperience }) {
  if (mobileExperience && chapter.video?.mobileSequence) {
    return <MobileCanvasSequence chapter={chapter} progress={progress} />;
  }

  if (staticExperience) {
    return <StaticBuildScene chapter={chapter} progress={progress} />;
  }

  if (chapter.video?.src) {
    return <ScrollScrubVideo chapter={chapter} progress={progress} />;
  }

  return <FrameStack chapter={chapter} progress={progress} />;
}

function ConstructionChapter({ chapter }) {
  const sectionRef = useRef(null);
  const progress = useSectionProgress(sectionRef);
  const isCompactViewport = useMediaQuery("(max-width: 820px)");
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const saveData = useSaveData();
  const mobileExperience = isCompactViewport && !prefersReducedMotion && !saveData;
  const staticExperience = prefersReducedMotion || (isCompactViewport && saveData);
  const visualProgress = prefersReducedMotion ? 1 : progress;
  const currentStage = Math.min(chapter.stages.length - 1, Math.floor(visualProgress * chapter.stages.length));
  const statsVisible = prefersReducedMotion || visualProgress > 0.78;
  const copyFade = prefersReducedMotion ? 0 : mapRange(progress, 0.12, 0.28);

  return (
    <section
      id={chapter.id}
      className={`construction-chapter ${chapter.kind} ${staticExperience ? "static-experience" : ""}`}
      ref={sectionRef}
    >
      <div className="construction-sticky">
        <VisualSequence
          chapter={chapter}
          progress={visualProgress}
          mobileExperience={mobileExperience}
          staticExperience={staticExperience}
        />
        <StageRail stages={chapter.stages} progress={visualProgress} />
        <div
          className="chapter-copy"
          style={{
            "--copy-opacity": 1 - copyFade,
            "--copy-offset": `${-24 * copyFade}px`
          }}
        >
          <span>{chapter.sequence}</span>
          <h1>{chapter.title}</h1>
          <p>{chapter.intro}</p>
        </div>
        <div className="stage-label">
          <span>{String(currentStage + 1).padStart(2, "0")}</span>
          <strong>{chapter.stages[currentStage]}</strong>
        </div>
        <div className={`chapter-stats ${statsVisible ? "is-visible" : ""}`}>
          {chapter.stats.map(([value, label]) => (
            <div key={`${value}-${label}`}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  return (
    <section id="process" className="after-reveal">
      <div className="after-copy" data-slide>
        <p>Contractor Landing Page</p>
        <h2>Show the transformation before the homeowner asks for a quote.</h2>
        <span>
          For a building contractor, the cinematic opening is not decoration. It explains the value:
          empty land, structure, exterior, landscaping, and finished home in one memorable scroll.
        </span>
      </div>
      <div className="after-proof" data-slide>
        <div>
          <strong>1</strong>
          <span>Premium Job Can Pay For It</span>
        </div>
        <div>
          <strong>24/7</strong>
          <span>Sales Page Online</span>
        </div>
        <div>
          <strong>Ajax</strong>
          <span>Local Search Intent</span>
        </div>
        <div>
          <strong>Quote</strong>
          <span>Lead Capture Goal</span>
        </div>
      </div>
    </section>
  );
}

function ResidencesSection() {
  const sectionRef = useRef(null);
  const progress = useSectionProgress(sectionRef);
  const shift = 8 - progress * 58;

  return (
    <section id="services" className="residences-section" ref={sectionRef}>
      <div className="residences-sticky">
        <div className="residences-heading">
          <p>High-Ticket Services</p>
          <h2>Sideways browsing for the projects homeowners actually need.</h2>
          <span>Scroll to move through service types instead of reading a normal contractor list.</span>
        </div>
        <div className="residence-track" style={{ transform: `translate3d(${shift}vw, 0, 0)` }}>
          {residences.map((residence, index) => (
            <article className="residence-card" key={residence.name}>
              <div className="residence-image">
                <img src={residence.image} alt={residence.name} />
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="residence-meta">
                <p>{residence.location}</p>
                <h3>{residence.name}</h3>
                <strong>{residence.price}</strong>
                <div>
                  {residence.stats.map(stat => (
                    <span key={stat}>{stat}</span>
                  ))}
                </div>
                <small>{residence.note}</small>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function DetailsSection() {
  return (
    <section id="details" className="details-section">
      <div className="details-intro" data-slide>
        <p>How The Page Sells</p>
        <h2>A clear construction process makes a big project feel safer to start.</h2>
      </div>
      <div className="details-grid">
        {detailGroups.map(group => (
          <article data-slide key={group.title}>
            <h3>{group.title}</h3>
            <div>
              {group.items.map(item => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
      <div className="estate-feature" data-slide>
        <img src="/assets/great-room.png" alt="Luxury estate interior" />
        <div>
          <p>Trust Builder</p>
          <h3>From scroll-stopping build reveal to estimate request in one continuous story.</h3>
          <span>
            This gives a contractor more than a basic directory listing. It gives homeowners a reason to
            believe the work is serious, organized, and worth calling about.
          </span>
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  const [sent, setSent] = useState(false);

  return (
    <section id="contact" className="contact-section">
      <div className="contact-copy" data-slide>
        <p>Request An Estimate</p>
        <h2>Ready to discuss a custom build, renovation, or addition?</h2>
      </div>
      <form
        data-slide
        onSubmit={event => {
          event.preventDefault();
          setSent(true);
        }}
      >
        {contactFields.map(field => (
          <label htmlFor={`contact-${field.name}`} key={field.name}>
            <span>{field.label}</span>
            <input
              id={`contact-${field.name}`}
              name={field.name}
              type={field.type}
              autoComplete={field.autoComplete}
              required
            />
          </label>
        ))}
        <label className="message-field" htmlFor="contact-message">
          <span>Message</span>
          <textarea id="contact-message" name="message" rows="4" />
        </label>
        <button type="submit">
          Request Estimate
          <ArrowIcon />
        </button>
        {sent && (
          <p className="form-success" role="status" aria-live="polite">
            Estimate request received. This demo keeps the form local.
          </p>
        )}
      </form>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <span>BDL Construction</span>
      <a href="#estate">Back to top</a>
    </footer>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollProgress = useScrollProgress();
  useReveal();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "instant" }));
  }, []);

  const progressStyle = useMemo(() => ({ transform: `scaleX(${scrollProgress})` }), [scrollProgress]);

  return (
    <>
      <div className="scroll-progress" style={progressStyle} aria-hidden="true" />
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main>
        {chapters.map(chapter => (
          <ConstructionChapter chapter={chapter} key={chapter.id} />
        ))}
        <ProcessSection />
        <ResidencesSection />
        <DetailsSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
