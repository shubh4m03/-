import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const GALLERY_ROWS = [
    { items: ['Python', 'Bash', 'C', 'C++', 'JavaScript', 'HTML', 'CSS', 'React', 'Tailwind CSS', 'Node.js'] },
    { items: ['Nmap', 'Wireshark', 'Burp Suite', 'Netcat', 'Dirb', 'OSINT', 'Pentesting', 'CTF', 'Linux', 'Network Security'] },
    { items: ['MySQL', 'Git', 'GitHub', 'Figma', 'Tkinter', 'Hugging Face', 'PHP', 'WebSocket', 'PWA', 'Marg ERP'] },
];

export default function GallerySection() {
    const sectionRef = useRef(null);
    const innerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const section = sectionRef.current;
            const inner = innerRef.current;

            if (!section || !inner) return;

            // Pinning the section to center it while viewing
            ScrollTrigger.create({
                trigger: section,
                start: 'top top',
                end: 'bottom bottom',
                pin: inner,
                pinSpacing: true,
                anticipatePin: 1,
            });

            // Entry animation
            gsap.fromTo(inner,
                { opacity: 0 },
                {
                    opacity: 1,
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 80%',
                        end: 'top top',
                        scrub: true,
                    }
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            id="gallery"
            style={{
                height: '150vh', // Scrolling duration for pinning
                position: 'relative',
                background: 'var(--black)',
                zIndex: 5
            }}
        >
            <div
                ref={innerRef}
                style={{
                    height: '100vh',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden',
                    position: 'relative',
                }}
            >
                {/* Big watermark in center */}
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 0,
                        pointerEvents: 'none',
                    }}
                >
                    <span
                        className="font-display"
                        style={{
                            fontSize: 'clamp(100px, 22vw, 280px)',
                            color: 'var(--white)',
                            opacity: 0.03,
                            userSelect: 'none',
                            letterSpacing: '0.1em'
                        }}
                    >
                        STACK
                    </span>
                </div>

                {/* Infinite Rollers */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32, position: 'relative', zIndex: 1, width: '100%' }}>
                    {GALLERY_ROWS.map((row, rowIndex) => (
                        <div
                            key={rowIndex}
                            className="marquee-wrapper"
                            style={{
                                overflow: 'hidden',
                                width: '100%',
                                maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                                WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
                            }}
                        >
                            <div className={`marquee-track ${rowIndex % 2 === 0 ? 'marquee-track-left' : 'marquee-track-right'}`}>
                                {/* Repeated items for infinite loop */}
                                {[...row.items, ...row.items, ...row.items, ...row.items].map((item, i) => (
                                    <div
                                        key={i}
                                        className="gallery-pill"
                                        style={{
                                            fontFamily: "'JetBrains Mono', monospace",
                                            fontSize: 'clamp(12px, 1.2vw, 15px)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.15em',
                                            color: 'var(--white)',
                                            padding: '12px 24px',
                                            borderRadius: '2px',
                                            background: 'rgba(var(--fg-rgb),0.03)',
                                            border: '1px solid rgba(var(--fg-rgb),0.08)',
                                            marginRight: 20,
                                            flexShrink: 0,
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
