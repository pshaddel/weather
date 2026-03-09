import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Hls from "hls.js";

// Backoff configuration
const INITIAL_RETRY_DELAY = 5000; // 5 seconds
const MAX_RETRY_DELAY = 60000; // 60 seconds
const MAX_RETRIES = 10;
const OFFLINE_ERROR_MESSAGE = 'Offline - waiting for connection...';
const FORCE_RELOAD_INTERVAL = 60 * 60 * 1000; // 1 hour

const getYouTubeEmbedUrl = (inputUrl: string): string | null => {
    try {
        const parsedUrl = new URL(inputUrl);
        const host = parsedUrl.hostname.replace(/^www\./, '');

        if (host === 'youtu.be') {
            const videoId = parsedUrl.pathname.split('/').filter(Boolean)[0];
            return videoId
                ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&rel=0`
                : null;
        }

        if (host === 'youtube.com' || host === 'm.youtube.com') {
            if (parsedUrl.pathname === '/watch') {
                const videoId = parsedUrl.searchParams.get('v');
                return videoId
                    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&rel=0`
                    : null;
            }

            const liveOrEmbedMatch = parsedUrl.pathname.match(/^\/(live|embed)\/([^/?#]+)/);
            if (liveOrEmbedMatch?.[2]) {
                return `https://www.youtube.com/embed/${liveOrEmbedMatch[2]}?autoplay=1&mute=1&playsinline=1&rel=0`;
            }
        }

        return null;
    } catch {
        return null;
    }
};

export default function Stream() {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const retryCountRef = useRef(0);
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const forceReloadIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isOffline, setIsOffline] = useState(false);

    // Get URL from query parameters
    const url = (router.query.url as string) || 'https://freqsyndlin.redbull.com/582/hls/master/playlist.m3u8';
    const qualityParam = Array.isArray(router.query.quality)
        ? router.query.quality[0]
        : router.query.quality;
    const requestedQuality = Number(qualityParam);
    const youtubeEmbedUrl = getYouTubeEmbedUrl(url);
    const isYouTubeSource = Boolean(youtubeEmbedUrl);

    const calculateBackoff = (retryCount: number): number => {
        // Exponential backoff with jitter
        const delay = Math.min(
            INITIAL_RETRY_DELAY * Math.pow(2, retryCount),
            MAX_RETRY_DELAY
        );
        // Add random jitter (±20%)
        const jitter = delay * 0.2 * (Math.random() * 2 - 1);
        return delay + jitter;
    };

    const reloadPage = () => {
        if (retryCountRef.current >= MAX_RETRIES) {
            console.error(`Max retries (${MAX_RETRIES}) reached. Stopping reload attempts.`);
            setError(`Stream failed after ${MAX_RETRIES} attempts. Please refresh manually.`);
            return;
        }

        const backoffDelay = calculateBackoff(retryCountRef.current);
        console.log(`Scheduling page reload in ${Math.round(backoffDelay / 1000)}s (attempt ${retryCountRef.current + 1}/${MAX_RETRIES})`);

        retryTimeoutRef.current = setTimeout(() => {
            console.log('Reloading page due to stream error...');
            window.location.reload();
        }, backoffDelay);

        retryCountRef.current++;
    };

    const initializePlayer = () => {
        const video = videoRef.current;
        if (!video) return;

        if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
            });
            hlsRef.current = hls;

            hls.loadSource(url);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log('Stream manifest parsed successfully');
                if (Number.isFinite(requestedQuality) && requestedQuality > 0 && hls.levels.length > 0) {
                    const nearestLevel = hls.levels.reduce(
                        (nearest, level, index) => {
                            const levelQuality = level.height || Math.round(level.bitrate / 1000);
                            const difference = Math.abs(levelQuality - requestedQuality);

                            if (difference < nearest.difference) {
                                return { index, difference, quality: levelQuality };
                            }

                            return nearest;
                        },
                        {
                            index: 0,
                            difference: Number.POSITIVE_INFINITY,
                            quality: hls.levels[0].height || Math.round(hls.levels[0].bitrate / 1000),
                        }
                    );

                    hls.autoLevelCapping = nearestLevel.index;
                    console.log(
                        `Quality cap requested: ${requestedQuality}. Nearest available: ${nearestLevel.quality} (level ${nearestLevel.index}).`
                    );
                }
                // Reset retry count on successful connection
                retryCountRef.current = 0;
                video.play().catch((err) => {
                    console.error('Autoplay failed:', err);
                    setError('Click to play the stream');
                });
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                console.error('HLS Error:', data);

                if (data.fatal) {
                    console.log('fatal', data);
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.error('Fatal network error encountered, trying to recover...');
                            setError('Network error - attempting recovery...');
                            hls.startLoad();
                            // If recovery fails, schedule page reload
                            setTimeout(() => {
                                if (video.paused || video.readyState === 0) {
                                    console.error('Recovery failed, scheduling page reload');
                                    reloadPage();
                                } else {
                                    console.log('Network recovery successful');
                                    if (navigator.onLine) {
                                        setError(null);
                                    }
                                }
                            }, 5000);
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.error('Fatal media error encountered, trying to recover...');
                            setError('Media error - attempting recovery...');
                            hls.recoverMediaError();
                            // If recovery fails, schedule page reload
                            setTimeout(() => {
                                if (video.paused || video.readyState === 0) {
                                    console.error('Recovery failed, scheduling page reload');
                                    reloadPage();
                                } else {
                                    console.log('Media recovery successful');
                                    if (navigator.onLine) {
                                        setError(null);
                                    }
                                }
                            }, 5000);
                            break;
                        default:
                            console.error('Fatal error, reloading page...');
                            setError('Stream error - reloading...');
                            reloadPage();
                            break;
                    }
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari)
            video.src = url;
            video.addEventListener('loadedmetadata', () => {
                console.log('Stream loaded (native HLS)');
                retryCountRef.current = 0;
                video.play().catch((err) => {
                    console.error('Autoplay failed:', err);
                    setError('Click to play the stream');
                });
            });

            video.addEventListener('error', (e) => {
                console.error('Video error:', e);
                setError('Stream error - reloading...');
                reloadPage();
            });
        } else {
            console.error('HLS is not supported in this browser');
            setError('HLS playback not supported in this browser');
        }
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;

        forceReloadIntervalRef.current = setInterval(() => {
            console.log('Forcing hourly page reload...');
            window.location.reload();
        }, FORCE_RELOAD_INTERVAL);

        return () => {
            if (forceReloadIntervalRef.current) {
                clearInterval(forceReloadIntervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        // Wait for router to be ready before initializing
        if (!router.isReady) return;

        if (isYouTubeSource) {
            setError(null);
            return () => {
                if (retryTimeoutRef.current) {
                    clearTimeout(retryTimeoutRef.current);
                }
            };
        }

        initializePlayer();

        // Cleanup function
        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
            }
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
        };
    }, [router.isReady, url, requestedQuality, isYouTubeSource]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const syncOnlineStatus = () => {
            const offline = !navigator.onLine;
            setIsOffline(offline);
            if (offline) {
                setError(OFFLINE_ERROR_MESSAGE);
            } else {
                setError((previousError) =>
                    previousError === OFFLINE_ERROR_MESSAGE ? null : previousError
                );
            }
        };

        syncOnlineStatus();
        window.addEventListener('online', syncOnlineStatus);
        window.addEventListener('offline', syncOnlineStatus);

        return () => {
            window.removeEventListener('online', syncOnlineStatus);
            window.removeEventListener('offline', syncOnlineStatus);
        };
    }, []);

    // Monitor video stalling
    useEffect(() => {
        if (isYouTubeSource) return;

        const video = videoRef.current;
        if (!video) return;

        let stalledTimeout: NodeJS.Timeout;

        const handleStalled = () => {
            console.error('Video stalled');
            setError('Stream stalled - reloading...');
            stalledTimeout = setTimeout(() => {
                reloadPage();
            }, 10000); // Wait 10 seconds before reloading
        };

        const handlePlaying = () => {
            console.log('Video playing');
            if (navigator.onLine) {
                setError(null);
            }
            if (stalledTimeout) {
                clearTimeout(stalledTimeout);
            }
        };

        video.addEventListener('stalled', handleStalled);
        video.addEventListener('playing', handlePlaying);
        video.addEventListener('waiting', () => console.log('Video buffering...'));

        return () => {
            video.removeEventListener('stalled', handleStalled);
            video.removeEventListener('playing', handlePlaying);
            if (stalledTimeout) {
                clearTimeout(stalledTimeout);
            }
        };
    }, [isYouTubeSource]);

    const displayError = isOffline ? OFFLINE_ERROR_MESSAGE : error;

    return (
        <div className="fixed inset-0 bg-black" style={{ zIndex: 9999 }}>
            {displayError && (
                <div className="absolute top-3 left-3 z-10 max-w-xs rounded-md bg-black/75 px-3 py-2 text-xs text-white shadow-sm pointer-events-none">
                    {displayError}
                </div>
            )}
            {isYouTubeSource && youtubeEmbedUrl ? (
                <iframe
                    src={youtubeEmbedUrl}
                    title="YouTube Stream"
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    className="w-full h-full"
                    style={{
                        width: '100vw',
                        height: '100vh',
                        border: 0,
                    }}
                />
            ) : (
                    <video
                        ref={videoRef}
                        controls
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full"
                        style={{
                            objectFit: 'contain',
                            width: '100vw',
                            height: '100vh'
                        }}
                    />
            )}
        </div>
    );
}