# Office Seating Planner

## Live website

- **Main Office · Floor 3 (Top/3D/Walk):** https://office-seating-planner-pkclaude-3994.vercel.app/main-office-floor3.html
- **Main Office · Floor 2 (Top/3D/Walk):** https://office-seating-planner-pkclaude-3994.vercel.app/main-office-floor2.html
- **Main Office · Floor 1 (Top/3D/Walk):** https://office-seating-planner-pkclaude-3994.vercel.app/main-office-floor1.html
- **Beach Office — Seating Editor:** https://office-seating-planner-pkclaude-3994.vercel.app/
- **Beach Office — 2D / 3D / Walk:** https://office-seating-planner-pkclaude-3994.vercel.app/layout.html
- **Main Office — Floors 1, 2, 3:** https://office-seating-planner-pkclaude-3994.vercel.app/main-office.html

**[Open the live Office Seating Planner — 2D & 3D Layout](https://office-seating-planner-pkclaude-3994.vercel.app/layout.html)**

The seating editor is available at [the site homepage](https://office-seating-planner-pkclaude-3994.vercel.app/).

Static seating editor and live Three.js office floor plan using Vercel serverless API and MongoDB Atlas.

## One-time employee list (private static JSON)

Employee search now reads a **fixed JSON snapshot** instead of contacting PeopleSimple on each visit. The site's `/api/employees` endpoint only reads `EMPLOYEE_DIRECTORY_JSON` or a private local file and requires `EMPLOYEE_DIRECTORY_ACCESS_KEY`. No live PeopleSimple calls are made by the deployed site.

**Import the roster once:**

1. On a trusted computer, obtain the PeopleSimple API bearer token securely (never send it in chat, frontend HTML or GitHub).
2. Run `PEOPLESIMPLE_TOKEN=... node scripts/fetch-employees-once.cjs`. This fetches active employees **one time** and writes `.private/employee-directory.json` with `id`, `employeeCode`, `name` only.
3. In **Vercel → Project → Settings → Environment Variables → Production**, securely set `EMPLOYEE_DIRECTORY_JSON` to the contents of that file, and `EMPLOYEE_DIRECTORY_ACCESS_KEY` to a separate strong staff access code. Redeploy production to apply changes.
4. The JSON is reused until **you manually update it**. Search filters that fetched list in the browser.

**Privacy:** This GitHub repository is public. Do **not** commit your real employee roster: `.private/` is ignored. The employee list is not downloadable as a public JSON URL. If you cannot set a sufficiently large JSON environment variable, a private file can be included in a manual server deployment instead. Until the JSON and access key are configured, the directory will report that it is unavailable rather than showing invented employees.

## Employee directory & Main Office seat assignment

**New on Main Office Floors 1–3:** search active employees by name, employee code or ID; select a seat and open **ASSIGN / MOVE**; assign, move, swap, replace or clear an employee. Each floor saves assignments **in that browser only**, preserving legacy name-only assignments. These are **not yet shared through MongoDB**; Beach Office's MongoDB assignments are unaffected.

**Production setup (Vercel → Settings → Environment Variables → Production):**
- `EMPLOYEE_DIRECTORY_JSON` — private static employee JSON snapshot created by the one-time import script; **never commit real employee data to public GitHub**.
- `EMPLOYEE_DIRECTORY_ACCESS_KEY` — a separate long random access code for staff using the directory; **do not reuse the PeopleSimple token**.

The static JSON snapshot and access code are required. The `/api/employees` endpoint checks the access code before reading the saved employee JSON and returns only the stored employee names/IDs/codes. Authorized users click **ACCESS EMPLOYEE LIST** and enter the separate access code, which is held in their browser session. Without these variables, the employee list shows a configuration error rather than exposing data. Employee IDs in seating assignments remain local to the browser.

To validate the source: `npm run check`.

## Functionality

- **Main Office** has independent Three.js models for Floors 1–3, traced from the supplied sketches: 34, 26 and 48 workstation seats respectively. Top, orbit and walk views support seat naming, search and PNG export. Employee assignments are stored locally in each browser. Existing local image/annotation data is retained in storage but is not displayed in the 3D views.
- Existing Beach Office seating data, geometry and MongoDB API remain untouched.
- `index.html` — editable seats with automatic PATCH saving and live GET refresh.
- `layout.html` — immersive office model supplied by the project owner, with **Top View**, **3D View**, **Walk**, seat selection, and **Edit Name** action.
- `api/seats.js` — shared MongoDB endpoint, using `MONGODB_URI` from server-side environment variables.
- 42 seats: T1/T2/T3 = 3 per side; T4/T5 = 6 per side.
- Original MongoDB document `_id: "main"` in collection `seating_plans` is retained.

## Layout geometry

The model uses the supplied reference HTML: from top to bottom T5, T4, T3, T2, T1 with the dining area in front of T1. Conference rooms C1/C2 and washroom to the right, entrance and store room to the left. No 3D sample employee names are written to MongoDB.

## Environment

Set `MONGODB_URI` in **Vercel → Project → Settings → Environment Variables**, Production. Do not commit it or print it.

## GitHub CI/CD

The workflow in `.github/workflows/ci.yml` validates every PR against `main` and deploys **only pushes to `main`** to the existing Vercel production project. Pull requests do not deploy.

Create a **private** repository, push this directory to the `main` branch, and set these variables in GitHub repository settings:

- **Secret** `VERCEL_TOKEN`: a Vercel token (never paste it in chat or code).
- **Variable** `VERCEL_ORG_ID`: `team_rDw84UOM0PmU6hjWJCsjVZpL`.
- **Variable** `VERCEL_PROJECT_ID`: `prj_dOsjqlsk1vZEnOg5UU4r9YBJ3Mcs`.

To avoid duplicate deployments, leave Vercel automatic Git deployment **disabled** when using the included GitHub Actions production deployment workflow.

Push from terminal after creating an empty repository on GitHub:

```sh
git init -b main
git add .
git commit -m "Initialize office seating planner with shared 2D and 3D layout"
git remote add origin https://github.com/<YOUR-USERNAME>/office-seating-planner.git
git push -u origin main
```

For production, restrict GitHub `production` environment deployments to the `main` branch, and enable branch protections/reviews as appropriate.

## Security

The site is publicly viewable and presently allows editing without authentication, so anyone can change a name. Consider editor authentication and rate limiting. Rotate database credentials that were previously shared in chat and update the Vercel environment variable.
## Mouse controls

Top view: drag to pan and scroll to zoom. 3D view: left drag rotates, right drag pans, scroll zooms. Click a chair to select it, double-click to edit its name, or select from the sidebar and use Edit Name. The floor model and text labels now share the same canvas bounds.
