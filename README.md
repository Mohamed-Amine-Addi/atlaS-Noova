# Abandoned but not Forgotten

An interactive 3D story of the hardware NASA has left on the Moon, on Mars and in deep space.

Built for the NASA hackathon challenge **"Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars"**.

Visitors fly around a 3D Moon, a 3D Mars and a schematic deep-space map, click glowing markers placed at real coordinates, and read a short story about each machine: what it was, why it was sent, what it discovered, and where it is now.

- **17 artifacts** across 3 worlds, from Surveyor 3 (1967) to the Ingenuity helicopter (2024)
- **3 languages:** English, French and Arabic (full right-to-left layout)
- **No database, no login:** one Python service and one JSON file

---

## Table of contents

1. [Who it is for](#who-it-is-for)
2. [Features](#features)
3. [The 17 artifacts](#the-17-artifacts)
4. [Mission data: built to last versus actually lasted](#mission-data-built-to-last-versus-actually-lasted)
5. [Technology stack](#technology-stack)
6. [Architecture](#architecture)
7. [Project structure](#project-structure)
8. [Run it locally](#run-it-locally)
9. [Deploy it](#deploy-it)
10. [API](#api)
11. [Editing the content](#editing-the-content)
12. [Languages and accessibility](#languages-and-accessibility)
13. [Data sources and credits](#data-sources-and-credits)
14. [Verification status](#verification-status)
15. [Known limitations](#known-limitations)
16. [Roadmap](#roadmap)
17. [AI assistance disclosure](#ai-assistance-disclosure)

---

## Who it is for

School-age and casual space enthusiasts. Every story is short and written in plain language, every machine has a clear status line (for example "Lost in a dust storm, 2018"), and the numbers are chosen to surprise: a rover built for 90 days that worked for 14 years.

## Features

| Feature | Description |
|---|---|
| Intro screen | Full-screen opening over a rotating Moon with the title, a tagline, three key numbers and a start button. |
| Interactive 3D globes | Moon and Mars with surface textures. Drag to rotate, scroll to zoom. The globe auto-rotates until an artifact is chosen. |
| Real coordinates | Pulsing markers sit at each artifact's latitude and longitude. |
| Fly-to camera | Clicking a marker, a year on the timeline or an item in the list flies the camera to that artifact. |
| Story panel | NASA photo (when available), name, year, status, story, "what it taught us" and source links. |
| Mission data | Coordinates and a designed-versus-actual lifetime comparison with animated bars and a multiplier such as x58. |
| Timeline | A clickable bar of years for the current world. |
| Ghost mode | Markers fade and pulse like ghosts of the abandoned machines. |
| Surprise me | Jumps to a random artifact in the current world. |
| Hover labels | Hovering a marker shows its name and year. |
| Three languages | English, French and Arabic, switched instantly. Arabic mirrors the whole layout. |
| Graceful fallback | If WebGL or the 3D libraries fail to load, the story panel, list and timeline still show every story. |
| Branding | Original SVG logo (a lander under signal arcs), also used as the browser-tab icon. |

## The 17 artifacts

**Moon**
- Apollo 11 Eagle (1969), the descent stage left as a launch pad
- ALSEP, Apollo 12 (1969), the scientific instrument package
- Surveyor 3 (1967), the robotic lander visited by Apollo 12 astronauts
- Lunar Roving Vehicle (1971-1972), three electric moon buggies

**Mars**
- Viking 1 (1976) and Viking 2 (1976)
- Sojourner (1997)
- Spirit (2004) and Opportunity (2004)
- Phoenix (2008)
- InSight (2018)
- Ingenuity (2021)

**Deep space**
- Pioneer 10 (1972) and Pioneer 11 (1973)
- NEAR Shoemaker (1996), resting on asteroid Eros
- Dawn (2007), orbiting Ceres
- Kepler Space Telescope (2009), drifting behind Earth

## Mission data: built to last versus actually lasted

For 12 artifacts the story panel compares the designed lifetime with the actual working lifetime. Durations are computed from launch or landing dates and end-of-mission dates, and stored in days in `data/artifacts.json`.

| Artifact | Designed | Actual | Times longer |
|---|---|---|---|
| ALSEP Apollo 12 | 12 months | 7.9 years | x8 |
| Viking 1 | 90 days | 6.3 years | x26 |
| Viking 2 | 90 days | 3.6 years | x15 |
| Sojourner | 7 days | 83 days | x12 |
| Spirit | 90 days | 6.2 years | x25 |
| Opportunity | 90 days | 14.4 years | x58 |
| Phoenix | 90 days | 5 months | x2 |
| InSight | 23 months | 4.1 years | x2 |
| Ingenuity | 30 days | 2.7 years | x33 |
| Pioneer 10 | 21 months | 30.9 years | x18 |
| Pioneer 11 | 21 months | 22.6 years | x13 |
| Kepler | 3.5 years | 9.6 years | x3 |

Artifacts without reliable planned-lifetime figures (Eagle, Lunar Roving Vehicle, Surveyor 3, NEAR Shoemaker, Dawn) show coordinates only.

## Technology stack

| Layer | Tool | Role |
|---|---|---|
| Backend | Python 3.10+, FastAPI, Uvicorn | Serves the API, the static files and the page. |
| 3D | Three.js r160 (loaded from a CDN with an import map) | Renderer, camera, lights, OrbitControls, raycasting for clicks and hover. |
| Frontend | HTML5, CSS3, vanilla JavaScript (ES modules) | UI, state, story panel, timeline, language switch. No framework and no build step. |
| Typography | Google Fonts: Fraunces, Atkinson Hyperlegible, Noto Naskh Arabic | Headings, readable body text, Arabic script. |
| Data | One JSON file | All content in three languages. |
| Imagery | NASA photos, planet surface maps | Realism and storytelling. |
| Logo | Hand-written SVG | Brand mark and favicon. |
| Tools | VS Code, Python venv, pip, Git, GitHub | Development and version control. |

## Architecture

```
BROWSER
  index.html + style.css
  3D canvas (Three.js) | Story panel | Timeline bar
            \               |              /
          main.js  (state: world, selected artifact, language)
   scene.js  globe.js  markers.js  camera.js  panel.js  timeline.js  i18n.js
                          |  fetch("/api/artifacts")
SERVER (Python)
  main.py (FastAPI + Uvicorn)
    GET /                    -> static/index.html
    GET /static/...          -> JS, CSS, textures, logo
    GET /api/artifacts       -> all artifacts (optional ?world=moon)
    GET /api/artifacts/{id}  -> one artifact
            |  reads at startup
     data/artifacts.json  (single source of truth)
```

**Data flow**

1. The browser loads `index.html` from FastAPI, and `main.js` fetches the artifact list.
2. `globe.js` builds the Moon, Mars or deep-space sphere, and `markers.js` places one marker per artifact from its latitude and longitude.
3. A click on a marker, a timeline year or a list item updates the selected artifact in `main.js`.
4. `camera.js` flies to it, `markers.js` highlights it and `panel.js` shows the story in the chosen language.
5. Switching worlds repeats the process with that world's artifacts.

**Design decisions**

- **One source of truth:** all content lives in `artifacts.json`. Fixing a fact means editing one file.
- **Thin backend:** no database and no login, so very little can break.
- **One deployed service:** FastAPI serves the frontend too, so there is a single URL and no CORS setup.
- **One job per module:** the 3D view, the panel and the timeline never call each other. They only talk through the state in `main.js`, so any module can be removed without touching the core.
- **Graceful fallback:** the 3D modules are loaded with dynamic imports inside a try/catch.
- **No stale files while developing:** the server sends `Cache-Control: no-store`.

## Project structure

```
abandoned-not-forgotten/
  main.py                 FastAPI app
  requirements.txt        fastapi, uvicorn
  README.md
  data/
    artifacts.json        all content (single source of truth)
  static/
    index.html            page shell, intro, header, panel, timeline
    style.css             design system, RTL support, Mission data styles
    logo.svg              logo and favicon
    textures/             Moon and Mars surface maps
    js/
      main.js             state and orchestration
      scene.js            renderer, camera, lights, stars, controls
      globe.js            Moon / Mars / deep-space spheres and textures
      markers.js          lat/lon to 3D, raycasting, hover, ghost mode
      camera.js           fly-to animation
      panel.js            story panel and Mission data
      timeline.js         year bar
      i18n.js             English, French and Arabic interface text
```

## Run it locally

You need Python 3.10 or newer and an Internet connection (Three.js and the fonts load from CDNs, and photos load from NASA).

**Windows (PowerShell)**

```
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

If PowerShell blocks the activation script, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first.

**macOS / Linux**

```
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Then open http://127.0.0.1:8000.

If `uvicorn` is not recognized, use `python -m uvicorn main:app --reload`. If port 8000 is busy, add `--port 8001`.

## Deploy it

Push the project to GitHub and create a web service on a Python host such as Render, Railway or Fly.io.

- **Build command:** `pip install -r requirements.txt`
- **Start command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

Because FastAPI serves the frontend, the result is one public URL.

## API

| Method and path | Returns |
|---|---|
| `GET /` | The web page. |
| `GET /api/artifacts` | All artifacts. |
| `GET /api/artifacts?world=moon` | Artifacts of one world (`moon`, `mars` or `space`). |
| `GET /api/artifacts/{id}` | One artifact, or 404. |
| `GET /static/...` | JavaScript, CSS, textures and the logo. |

## Editing the content

Everything lives in `data/artifacts.json`. To fix a fact or add an artifact, edit that file. No code change is needed.

```json
{
  "id": "viking1",
  "name": "Viking 1",
  "world": "mars",
  "lat": 22.483,
  "lon": -47.94,
  "year": 1976,
  "status":  { "en": "...", "fr": "...", "ar": "..." },
  "summary": { "en": "...", "fr": "...", "ar": "..." },
  "science": { "en": "...", "fr": "...", "ar": "..." },
  "sources": [ { "title": "NASA - Viking 1", "url": "https://science.nasa.gov/mission/viking-1/" } ],
  "image": "https://...",
  "life": { "planned": 90, "actual": 2305 }
}
```

| Field | Required | Notes |
|---|---|---|
| `id`, `name`, `world` | yes | `world` is `moon`, `mars` or `space`. |
| `lat`, `lon` | yes | Degrees. West and south are negative. |
| `year` | yes | Used to sort the timeline. |
| `status`, `summary`, `science` | yes | One entry per language: `en`, `fr`, `ar`. |
| `sources` | yes | A list of URL strings or `{ "title", "url" }` objects. |
| `image` | no | A NASA photo URL. If it fails to load, the panel hides it. |
| `life` | no | `planned` and `actual` in days, to show the lifetime bars. |
| `yearLabel` | no | Text shown instead of `year`, for example "1971-1972". |
| `place` | no | Text per language shown instead of coordinates (used by the Lunar Roving Vehicle). |
| `mlat`, `mlon` | no | Moves only the marker, so two nearby artifacts do not overlap. The panel still shows the real coordinates. |

Interface text (buttons, section titles, world introductions) is in `static/js/i18n.js`.

## Languages and accessibility

- English, French and Arabic switch instantly, without reloading.
- Arabic sets `dir="rtl"` on the page, so the layout mirrors, and uses an Arabic font.
- Readable typography (Atkinson Hyperlegible), visible keyboard focus on all buttons, an ARIA live region for the story panel and reduced-motion support in the CSS.
- The story panel, the list and the timeline work even if the 3D view cannot load.

## Data sources and credits

- **Stories and facts:** NASA pages from the challenge resources (NASA Science and the NSSDCA catalog), linked under each story.
- **Photos:** NASA images, loaded from NASA's servers and credited "Image: NASA" in the panel.
- **Planet textures:** the current Moon and Mars surface maps come from a public GitHub repository (`jeromeetienne/threex.planets`). The planned replacements are NASA's own maps: the Moon color map from NASA's CGI Moon Kit (NASA/Goddard/Scientific Visualization Studio, LRO data, https://svs.gsfc.nasa.gov/4720) and the Mars texture from NASA/JPL-Caltech (https://science.nasa.gov/3d-resources/mars).
- **3D engine:** Three.js (MIT licence).
- **Fonts:** Google Fonts (open licences).
- **Logo and code:** created for this project.

## Credits

Data and imagery: NASA. Created for the NASA hackathon.
