import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Hls from "hls.js";

// Backoff configuration
const INITIAL_RETRY_DELAY = 5000; // 5 seconds
const MAX_RETRY_DELAY = 60000; // 60 seconds
const MAX_RETRIES = 10;

export default function Stream() {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const retryCountRef = useRef(0);
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Get URL from query parameters
    const url = (router.query.url as string) || 'https://freqsyndlin.redbull.com/582/hls/master/playlist.m3u8';

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
        // Wait for router to be ready before initializing
        if (!router.isReady) return;

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
    }, [router.isReady, url]);

    // Monitor video stalling
    useEffect(() => {
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
            setError(null);
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
    }, []);

    return (
        <div className="fixed inset-0 bg-black" style={{ zIndex: 9999 }}>
            {error && (
                <div className="absolute top-0 left-0 right-0 p-4 bg-red-900 text-white text-center z-10">
                    {error}
                </div>
            )}
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
        </div>
    );
}