# Solar Wind Sherpas

Cinematic website for the Solar Wind Sherpas — scientists and explorers who travel the world to observe total solar eclipses and study the solar corona.

```sh
npm install
npm run dev
```

| Command | Action |
| --- | --- |
| `npm run dev` | Local server at `http://localhost:4321` |
| `npm run build` | Production build to `./dist/` |
| `npm run preview` | Preview the production build |

The home page includes a scroll-linked eclipse-to-logo transition (GSAP ScrollTrigger). Inner pages — About, Science, Expeditions, Join / Support — keep the settled header identity. New expedition and team entries can be added as Markdown in `src/content/`.
