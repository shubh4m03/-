export class ElectricBorder {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext("2d");

        this.width = options.width || 354;
        this.height = options.height || 504;
        this.octaves = options.octaves || 10;
        this.lacunarity = options.lacunarity || 1.6;
        this.gain = options.gain || 0.6;
        this.amplitude = options.amplitude || 0.2;
        this.frequency = options.frequency || 5;
        this.baseFlatness = options.baseFlatness || 0.2;
        this.displacement = options.displacement || 60;
        this.speed = options.speed || 1;
        this.borderOffset = options.borderOffset || 60;
        this.borderRadius = options.borderRadius || 40;
        this.lineWidth = options.lineWidth || 1;
        this.color = options.color || "#60A5FA";

        this.animationId = null;
        this.time = 0;
        this.lastFrameTime = 0;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.start();
    }

    random(x) { return (Math.sin(x * 12.9898) * 43758.5453) % 1; }

    noise2D(x, y) {
        const i = Math.floor(x), j = Math.floor(y);
        const fx = x - i, fy = y - j;
        const a = this.random(i + j * 57), b = this.random(i + 1 + j * 57);
        const c = this.random(i + (j + 1) * 57), d = this.random(i + 1 + (j + 1) * 57);
        const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
        return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
    }

    octavedNoise(x, octaves, lacunarity, gain, baseAmplitude, baseFrequency, time = 0, seed = 0, baseFlatness = 1) {
        let y = 0, amplitude = baseAmplitude, frequency = baseFrequency;
        for (let i = 0; i < octaves; i++) {
            let oa = i === 0 ? amplitude * baseFlatness : amplitude;
            y += oa * this.noise2D(frequency * x + seed * 100, time * frequency * 0.3);
            frequency *= lacunarity; amplitude *= gain;
        }
        return y;
    }

    getRoundedRectPoint(t, left, top, width, height, radius) {
        const sw = width - 2 * radius, sh = height - 2 * radius;
        const ca = (Math.PI * radius) / 2;
        const total = 2 * sw + 2 * sh + 4 * ca;
        let d = t * total, acc = 0;
        if (d <= acc + sw) { return { x: left + radius + (d - acc) / sw * sw, y: top }; } acc += sw;
        if (d <= acc + ca) { return this.getCornerPoint(left + width - radius, top + radius, radius, -Math.PI / 2, Math.PI / 2, (d - acc) / ca); } acc += ca;
        if (d <= acc + sh) { return { x: left + width, y: top + radius + (d - acc) / sh * sh }; } acc += sh;
        if (d <= acc + ca) { return this.getCornerPoint(left + width - radius, top + height - radius, radius, 0, Math.PI / 2, (d - acc) / ca); } acc += ca;
        if (d <= acc + sw) { return { x: left + width - radius - (d - acc) / sw * sw, y: top + height }; } acc += sw;
        if (d <= acc + ca) { return this.getCornerPoint(left + radius, top + height - radius, radius, Math.PI / 2, Math.PI / 2, (d - acc) / ca); } acc += ca;
        if (d <= acc + sh) { return { x: left, y: top + height - radius - (d - acc) / sh * sh }; } acc += sh;
        return this.getCornerPoint(left + radius, top + radius, radius, Math.PI, Math.PI / 2, (d - acc) / ca);
    }

    getCornerPoint(cx, cy, r, startAngle, arcLen, progress) {
        const angle = startAngle + progress * arcLen;
        return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    }

    drawElectricBorder(currentTime = 0) {
        if (!this.canvas || !this.ctx) return;
        const dt = (currentTime - this.lastFrameTime) / 1000;
        this.time += dt * this.speed;
        this.lastFrameTime = currentTime;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.lineCap = "round";
        this.ctx.lineJoin = "round";
        const scale = this.displacement;
        const left = this.borderOffset, top = this.borderOffset;
        const bw = this.canvas.width - 2 * this.borderOffset, bh = this.canvas.height - 2 * this.borderOffset;
        const maxR = Math.min(bw, bh) / 2;
        const r = Math.min(this.borderRadius, maxR);
        const approxP = 2 * (bw + bh) + 2 * Math.PI * r;
        const sampleCount = Math.floor(approxP / 2);
        this.ctx.beginPath();
        for (let i = 0; i <= sampleCount; i++) {
            const progress = i / sampleCount;
            const point = this.getRoundedRectPoint(progress, left, top, bw, bh, r);
            const xN = this.octavedNoise(progress * 8, this.octaves, this.lacunarity, this.gain, this.amplitude, this.frequency, this.time, 0, this.baseFlatness);
            const yN = this.octavedNoise(progress * 8, this.octaves, this.lacunarity, this.gain, this.amplitude, this.frequency, this.time, 1, this.baseFlatness);
            const dx = point.x + xN * scale, dy = point.y + yN * scale;
            i === 0 ? this.ctx.moveTo(dx, dy) : this.ctx.lineTo(dx, dy);
        }
        this.ctx.closePath();
        this.ctx.stroke();
        this.animationId = requestAnimationFrame(t => this.drawElectricBorder(t));
    }

    start() { this.animationId = requestAnimationFrame(t => this.drawElectricBorder(t)); }
    stop() { if (this.animationId) { cancelAnimationFrame(this.animationId); this.animationId = null; } }
}
