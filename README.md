# Shubham Gupta — Portfolio

Cinematic single-page portfolio (React 19 + Vite + GSAP + Lenis) for **Shubham Gupta** —
Offensive Security Intern at Macbease Pvt. Ltd., ICSS Campus Ambassador and B.Tech CSE student at LPU.

## Run locally

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the production build
npm run lint
```

## Where to edit content

All personal content lives in the data block at the top of `src/App.jsx`:

| Constant          | What it controls                                   |
| ----------------- | -------------------------------------------------- |
| `PERSONAL`        | Name, role, email, phone, social/profile links     |
| `EXPERIENCE`      | Experience Log cards                               |
| `PROJECTS`        | Horizontal project story (add `url` / `repo` links) |
| `SKILLS`, `STATS` | Skills & Stats section                             |
| `CERTS_DATA`      | Certification cards (PDFs in `src/assets/Certificates`) |
| `CODING_PROFILES` | TryHackMe / LeetCode / GitHub flip cards            |
| `TECH_MARQUEE`    | Scrolling tech marquee                             |

Other assets: résumé `src/assets/RESUME/Shubham_Gupta_CV.pdf`, footer raven `src/assets/RAVEN/`,
project covers `src/assets/projects/`, gallery rows `src/components/GallerySection.jsx`.

## Theme

Dark (blue on black) is the default; the sun/moon button in the top-right toggles the light
(blue on white) theme and remembers the choice. Colours are CSS variables at the top of
`src/index.css` (`:root` for dark, `:root[data-theme='light']` for light).
