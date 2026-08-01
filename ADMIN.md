# Admin Guide: Vercel Deployment Setup & Process

One-time machine setup plus the repeatable process for taking any demo under `AgentDemoWebApps/<AgentFolder>/` from local files to a live Vercel URL. Written from the setup performed on this machine on 2026-08-01.

## Table of Contents

- [1. One-time machine setup](#1-one-time-machine-setup)
- [2. Pre-deployment readiness checklist](#2-pre-deployment-readiness-checklist)
- [3. Deploying a single demo](#3-deploying-a-single-demo)
- [4. Deploying all 12 demos](#4-deploying-all-12-demos)
- [5. Post-deploy verification](#5-post-deploy-verification)
- [6. Wiring the real Agentforce embed script](#6-wiring-the-real-agentforce-embed-script)
- [7. Troubleshooting](#7-troubleshooting)

---

## 1. One-time machine setup

Only needs to be done once per machine/user account.

**1.1 — Check prerequisites**

```bash
node -v   # any recent LTS works — no framework/build step involved
npm -v
```

**1.2 — Fix npm global-install permissions (macOS default npm prefix is often root-owned)**

If `npm install -g <pkg>` fails with `EACCES` on `/usr/local/lib/node_modules`, don't use `sudo`. Point npm's global prefix at a user-owned directory instead:

```bash
mkdir -p ~/.npm-global
npm config set prefix ~/.npm-global
```

Add it to `PATH` (zsh — this repo's shell):

```bash
echo '' >> ~/.zshrc
echo '# Added for user-level global npm packages (e.g. vercel CLI)' >> ~/.zshrc
echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**1.3 — Install the Vercel CLI**

```bash
npm install -g vercel
vercel --version
```

**1.4 — Log in**

```bash
vercel login
```

This starts a device-auth flow: it prints a `https://vercel.com/oauth/device?user_code=XXXX-XXXX` URL — open it in a browser and confirm. The CLI polls and reports `Congratulations! You are now signed in.` once approved. Confirm anytime with:

```bash
vercel whoami
```

Env recorded from this setup: Vercel CLI `58.4.4`, prefix `~/.npm-global`. Re-run `vercel --version` / `vercel whoami` before relying on this doc — versions and login state drift.

---

## 2. Pre-deployment readiness checklist

Every folder under `AgentDemoWebApps/` is plain static HTML/CSS/JS (`index.html`, `dashboard.html`, `assets/css/style.css`, `assets/js/app.js`, `assets/js/data.js`, `vercel.json`) — no build step, no framework, no env vars. Before deploying a demo (new or after edits), verify:

| Check | How |
| --- | --- |
| All `href`/`src` references resolve | Every local link/script/stylesheet in `index.html` and `dashboard.html` points to a file that actually exists under that folder's `assets/` |
| No hardcoded env-specific values | `grep -rniE "localhost\|127\.0\.0\.1"` across the folder's `.html/.js/.css/.json` → should return 0 hits |
| No leaked real secrets | The demo login shown on-screen (`Demo@123`) is intentional mock data, not a real credential — fine as-is. Anything that looks like a real API key/token is not |
| `vercel.json` is valid JSON | `{"cleanUrls": true, "trailingSlash": false}` — no `builds`/`framework` keys (would imply a build step this project doesn't have) |
| No unfinished placeholder copy | No stray `TODO`/`FIXME`/`Lorem ipsum` in visible UI text (form `placeholder="..."` hints and mock contact emails like `*.example.com` in `data.js` are expected, not issues) |
| README matches reality | Each demo's own `README.md` should not claim build steps or env vars it doesn't need |

All 12 current demos passed this checklist as of 2026-08-01 (see repo `README.Md` → [Demo Web Apps](README.Md#demo-web-apps) for the live list and accent colors). Every `dashboard.html` ships a **commented-out** Agentforce embed placeholder (`REPLACE_WITH_AGENTFORCE_EMBED_SCRIPT_URL`) — expected, not a defect; see [§6](#6-wiring-the-real-agentforce-embed-script).

---

## 3. Deploying a single demo

Vercel project names must be **lowercase, kebab-case** — the `<AgentFolder>` names (`ProviderTerminationAgent`) are PascalCase and will be rejected outright by `vercel --yes` with `Project names ... must be lowercase (400)`. Pick a short slug up front (this repo uses `heai-<short-agent-name>`, e.g. `heai-provider-termination`) — Vercel also truncates auto-generated `.vercel.app` aliases around ~36 characters, so keep the slug well under that.

```bash
cd AgentDemoWebApps/<AgentFolder>
vercel project add heai-<short-agent-name>              # create the project first
vercel --prod --yes --project heai-<short-agent-name>    # deploy straight to production, non-interactively
```

The deploy command prints JSON with `deployment.url` — that's a per-deployment hash URL (e.g. `heai-provider-termination-a7u5iyyz6.vercel.app`), not the stable one to hand out. Alias it to the clean slug explicitly (renaming a project does **not** retroactively move its default `.vercel.app` alias):

```bash
vercel alias set <deployment.url from the JSON output> heai-<short-agent-name>.vercel.app
```

**Every new project on this account defaults to SSO Deployment Protection on** (`ssoProtection: "all_except_custom_domains"`) — every URL, including production, shows a Vercel login wall to anyone not logged into this Vercel account. This is a **security-relevant setting change**, so confirm with whoever owns the demo before disabling it project-by-project:

```bash
vercel project protection disable heai-<short-agent-name> --sso
```

Skipping this step means the demo link is unusable for anyone outside your Vercel account/team — verify with a plain `curl` (see §5) that you get real HTML back, not a page titled "Login – Vercel".

Subsequent redeploys reuse the same project automatically once linked (`.vercel/project.json` is written locally — gitignored, machine-specific); the alias only needs to be set once unless a rename or a from-scratch redeploy happens.

---

## 4. Deploying all 12 demos

Run readiness checks (§2) before batch-deploying. macOS ships bash 3.2 (no associative arrays) — use parallel indexed arrays, not `declare -A`, if scripting this as a loop:

```bash
FOLDERS=(EmployerGroupSupportAgent ProviderNetworkSupportAgent ...)   # AgentFolder names
SLUGS=(heai-employer-group-support heai-provider-network-support ...)  # matching slugs, same order

for i in "${!FOLDERS[@]}"; do
  folder="${FOLDERS[$i]}"; slug="${SLUGS[$i]}"
  (cd "AgentDemoWebApps/$folder" && \
    vercel project add "$slug" && \
    deploy_url=$(vercel --prod --yes --project "$slug" | python3 -c "import json,sys; print(json.load(sys.stdin)['deployment']['url'])") && \
    vercel project protection disable "$slug" --sso && \
    vercel alias set "$deploy_url" "$slug.vercel.app")
done
```

`--yes` here means "use existing linked/named project, no prompts" — it does **not** create a project that doesn't exist yet, hence the explicit `vercel project add` first.

---

## 5. Post-deploy verification

No browser automation was available when this was last run, so verification split into what `curl` can and can't confirm:

**Automatable (HTTP-level), per site:**
```bash
curl -s -o /dev/null -w "%{http_code}" -L https://heai-<slug>.vercel.app/                       # expect 200
curl -s -o /dev/null -w "%{http_code}" -L https://heai-<slug>.vercel.app/dashboard.html          # expect 200
curl -s -o /dev/null -w "%{http_code}" -L https://heai-<slug>.vercel.app/assets/css/style.css    # expect 200
curl -s -o /dev/null -w "%{http_code}" -L https://heai-<slug>.vercel.app/assets/js/app.js        # expect 200
curl -s -L https://heai-<slug>.vercel.app/ | grep -o "<title>[^<]*</title>"                      # sanity-check title
curl -s -L https://heai-<slug>.vercel.app/dashboard.html | grep -c "<expected embed deployment name>"  # for wired agents — confirms no cross-wiring
```
A `200` with a login-page-shaped title but wrong content (e.g. `<title>Login – Vercel</title>`) means SSO protection is still on — see §3.

**Requires a real browser (manual, not automatable here):**
1. Log in with that demo's credentials (see `README.Md` → Demo Web Apps table) and confirm the dashboard loads with its mock data populated.
2. Click the chat launcher and confirm the Agentforce widget actually boots and responds — it loads asynchronously and can take a few seconds after `bootstrap.min.js` finishes; a static HTML check cannot observe this.
3. Check the browser console for 404s or CORS/CSP errors the embedded-service script itself might throw.

---

## 6. Wiring the real Agentforce embed script

Each `dashboard.html` has a commented placeholder near the bottom:

```html
<!-- <script src="REPLACE_WITH_AGENTFORCE_EMBED_SCRIPT_URL"></script> -->
```

To go from demo-only to a live embedded agent: uncomment the block and replace the placeholder with the real Agentforce embedded-service script URL for that agent's deployed Salesforce org (see the matching agent's README under `payer_agentforce_agents/<AgentFolder>/README.md` for deploy status first — some agents in this portfolio aren't fully published as live Bots yet; check `README.Md` → [Known Gaps & Notes](README.Md#known-gaps--notes)).

---

## 7. Troubleshooting

| Symptom | Fix |
| --- | --- |
| `npm install -g vercel` → `EACCES ... mkdir '/usr/local/lib/node_modules/vercel'` | Don't `sudo` it — redo §1.2 (user-owned npm prefix) |
| `vercel` / `vercel --version` → `command not found` after install | New prefix not on `PATH` yet — `source ~/.zshrc` or open a new terminal tab |
| `vercel whoami` → prompts a fresh login flow every time | Session expired or was never completed — rerun `vercel login` and finish the device-auth URL in the browser |
| Need to switch Vercel accounts | `vercel logout` then `vercel login` |
| Deployed site 404s on `assets/...` | Almost always a case-sensitivity or relative-path mismatch (Vercel's filesystem is case-sensitive, local macOS often isn't) — verify actual on-disk filenames match `href`/`src` exactly |
| `vercel --prod --yes` (no `--project`) → `Project names ... must be lowercase (400)` | The default project name comes from the folder (`ProviderTerminationAgent`) — always pass an explicit lowercase `--project heai-<slug>` (§3) |
| `vercel --prod --yes --project <name>` → `Project "<name>" was not found in the current scope` | `--yes` won't create a missing project — run `vercel project add <name>` first |
| Production URL shows `<title>Login – Vercel</title>` instead of the demo | SSO Deployment Protection is on for that project (Vercel's default for new projects on this account) — `vercel project protection disable <name> --sso` (confirm with the demo owner first, it's a security-relevant change) |
| A URL works over `curl` even though protection is still on | You likely hit a stale CDN edge cache (`x-vercel-cache: HIT`) from before protection was applied — not reliable; check `vercel project protection <name>` directly rather than trusting one cached `curl` response |
| Clean `<slug>.vercel.app` alias 404s right after `vercel project rename` | Renaming a project does not move its default alias — set it explicitly: `vercel alias set <deployment-url> <slug>.vercel.app` |
