import { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import bgMusic from '../assets/BGMMUSIC/0309.mp3';

const TARGET_VOLUME = 0.4;

/**
 * Background music.
 * Browsers only allow audio to start after a real user gesture (click / tap / key), unless the site
 * already has enough media engagement. So:
 *  - playback is attempted immediately on page load (while the loader is still showing);
 *  - if the browser blocks that, the first click / tap / key press anywhere — loader included — starts it;
 *  - once the site is revealed (`revealed`) and audio still isn't playing, a small "TAP FOR SOUND" hint
 *    sits next to the button.
 * The button starts playback when nothing is playing yet, and only mutes/unmutes afterwards
 * (previously a first click on the button started the track already muted).
 */
const BackgroundMusic = ({ revealed = true }) => {
    const audioRef = useRef(null);
    const fadeRef = useRef(null);
    const startingRef = useRef(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    // The hint only shows near the top of the page, so it never sits on top of content further down
    const [nearTop, setNearTop] = useState(true);

    useEffect(() => {
        if (isPlaying) return undefined;
        let raf = 0;
        const check = () => {
            raf = 0;
            const next = window.scrollY < window.innerHeight * 0.5;
            setNearTop(prev => (prev === next ? prev : next));
        };
        const onScroll = () => { if (!raf) raf = requestAnimationFrame(check); };
        check();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
            cancelAnimationFrame(raf);
        };
    }, [isPlaying]);

    const fadeIn = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        clearInterval(fadeRef.current);
        let vol = audio.volume;
        fadeRef.current = setInterval(() => {
            vol = Math.min(TARGET_VOLUME, vol + 0.02);
            audio.volume = vol;
            if (vol >= TARGET_VOLUME) clearInterval(fadeRef.current);
        }, 100);
    }, []);

    // Returns true if playback started
    const start = useCallback(async () => {
        const audio = audioRef.current;
        if (!audio || !audio.paused || startingRef.current) return !audio?.paused;
        startingRef.current = true;
        try {
            await audio.play();
            setIsPlaying(true);
            fadeIn();
            return true;
        } catch {
            return false; // blocked until a user gesture
        } finally {
            startingRef.current = false;
        }
    }, [fadeIn]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return undefined;
        audio.volume = 0;
        audio.loop = true;
        return () => clearInterval(fadeRef.current);
    }, []);

    // Try to start as soon as the page loads; otherwise wait for the first gesture (loader included).
    useEffect(() => {
        if (isPlaying) return undefined;
        let cancelled = false;
        const events = ['pointerdown', 'click', 'keydown', 'touchstart'];
        const onGesture = (e) => {
            // The music button handles its own click (see onButtonClick)
            if (e.target?.closest?.('.music-control-btn')) return;
            start().then(ok => { if (ok) detach(); });
        };
        const detach = () => events.forEach(ev => window.removeEventListener(ev, onGesture, true));
        start().then(ok => {
            if (!ok && !cancelled) events.forEach(ev => window.addEventListener(ev, onGesture, true));
        });
        return () => { cancelled = true; detach(); };
    }, [isPlaying, start]);

    // Second attempt when the site is revealed (some browsers unlock media after page load completes)
    useEffect(() => {
        if (revealed && !isPlaying) start();
    }, [revealed, isPlaying, start]);

    const onButtonClick = async () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (audio.paused) {
            // Nothing playing yet → this click is the gesture that starts the music (unmuted)
            audio.muted = false;
            setIsMuted(false);
            await start();
            return;
        }
        const nextMuted = !isMuted;
        audio.muted = nextMuted;
        setIsMuted(nextMuted);
    };

    const showHint = revealed && !isPlaying && nearTop;

    return (
        <>
            <audio ref={audioRef} src={bgMusic} preload="auto" />
            <button
                className={`music-control-btn ${isPlaying ? 'playing' : ''} ${isMuted ? 'muted' : ''}`}
                onClick={onButtonClick}
                aria-label={!isPlaying ? 'Play background music' : isMuted ? 'Unmute music' : 'Mute music'}
            >
                <div className="music-btn-glass">
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </div>
                {isPlaying && !isMuted && (
                    <div className="music-pulse">
                        <div className="pulse-ring"></div>
                        <div className="pulse-ring"></div>
                    </div>
                )}
            </button>
            {showHint && (
                <div className="music-hint font-mono" aria-hidden="true">TAP FOR SOUND</div>
            )}
        </>
    );
};

export default BackgroundMusic;
