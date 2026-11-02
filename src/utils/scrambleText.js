/**
 * scrambleText — Matrix-style text decode effect
 * Characters cycle through random chars before settling on the correct character
 * from left to right over the specified duration.
 */
export function scrambleText(element, finalText, duration = 1.2) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';
    let frame = 0;
    const totalFrames = Math.floor(duration * 60); // 60fps

    const interval = setInterval(() => {
        element.textContent = finalText
            .split('')
            .map((char, i) => {
                if (char === ' ') return ' ';
                // Characters "settle" from left to right over time
                const settleProgress = frame / totalFrames;
                const charSettlePoint = i / finalText.length;
                if (settleProgress > charSettlePoint) return char;
                return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('');

        frame++;
        if (frame >= totalFrames) {
            element.textContent = finalText;
            clearInterval(interval);
        }
    }, 1000 / 60);

    return interval; // Return interval ID so it can be cleared if needed
}
