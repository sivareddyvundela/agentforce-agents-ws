# healthEdge AI — Provider Enrollment Agent (Demo)

This is a standalone, static, Vercel-deployable pre-sales demo website for the
**Provider Enrollment Agent**, one of six agent demos in the healthEdge AI
suite built for a healthcare payer organization. It showcases how the agent
guides a new healthcare provider through a single conversational intake —
capturing contact details, credentials, specialty, and network, plus a
supporting document upload — and creates an enrollment record with a
trackable application id.

The site is plain HTML/CSS/JS with no build step, no npm/node dependencies,
no framework, and no external CDNs. It is a marketing/login page plus an
authenticated dashboard shell with realistic mock data, built around a
placeholder integration point where a human will later paste the real
Agentforce embedded-service chat script.

## Login credentials (demo only)

| Field    | Value                  |
|----------|------------------------|
| Username | `enrollment.specialist` |
| Password | `Demo@123`             |

Entering any other combination shows an inline "Invalid credentials" error.
On success, the app sets `sessionStorage` flags and redirects to
`dashboard.html`. Signing out (or losing the session flag) redirects back to
`index.html`.

## Sidebar tabs (dashboard.html)

1. **Overview** — stat tiles by enrollment status, plus a summary of what the
   agent automates.
2. **New Enrollment** — a guided form (First Name, Last Name, Phone, Email,
   NPI Number, License Number, Specialty, Network, Plan Level, and a
   supporting document upload) that mirrors the real agent's custom form.
   Submitting adds a new row to the in-memory Enrollment Queue and shows a
   success toast.
3. **Enrollment Queue** — table of provider enrollment applications with
   status and plan-level pills.
4. **Document Uploads** — table of supporting credential documents linked to
   enrollment ids.
5. **Specialties Directory** — the 8 supported specialties with a one-line
   description of each.

## Where to paste the real Agentforce embed script

Open `dashboard.html` and find the placeholder block immediately before the
closing `</body>` tag:

```html
<!-- ============================================================
     AGENTFORCE EMBED SCRIPT
     Paste the Agentforce Agent embedded-service bootstrap script
     here to enable the live chat experience for this demo.
     ============================================================ -->
<!-- <script src="REPLACE_WITH_AGENTFORCE_EMBED_SCRIPT_URL"></script> -->
```

Replace that commented-out `<script>` tag with the real Agentforce embedded
service bootstrap script. The floating chat-launcher button in the bottom
right currently opens a stub panel ("This is where the live Agentforce agent
will appear once embedded.") — once the real script is wired in, the actual
Agentforce chat widget will take over that experience.

## Deploying to Vercel

From inside this folder:

```bash
cd ProviderEnrollmentAgent
vercel deploy
vercel --prod
```

No build configuration is required — `vercel.json` sets `cleanUrls: true`
and `trailingSlash: false`, and the site is served as-is.
