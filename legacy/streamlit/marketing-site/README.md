# Marketing Site

Static public landing page for Digital Kids Assistant.

## Purpose

This page is a marketing landing page only. It does not replace the Streamlit app and it does not contain backend logic or authentication.

All main CTA buttons redirect users to:

`https://app.kids.dawnsynch.co.ke`

## Files

- `index.html`
- `styles.css`
- `assets/images/*`

## Local Preview

Open the file directly:

```bash
open index.html
```

Or serve it locally:

```bash
python3 -m http.server 8080
```

Then open:

`http://localhost:8080`

## Deployment

Deploy this repository root as a static site through any simple web server or static hosting setup.

Examples:

- Nginx static root
- Netlify
- Vercel static deployment
- GitHub Pages
- S3 + CloudFront

## Image Mapping

- `hero_banner.png`: hero section
- `practise_questions.png`: Learn / CBC revision card
- `coding_lessons.png`: Build / Coding & AI card
- `music.png`: Create / Hobbies & Creativity card
- `wisdom_prayer.png`: Grow / Values and Bible lessons card
- `personalized_learning.png`: Personalized learning section
- `parent_involvement.png`: Parent-guided learning flow section
- `journey.png`: Whole-child progress portfolio section
- `start_learning_today.png`: Final pilot CTA section

## Notes

- The landing page is fully static.
- No build step is required.
- The design is responsive and mobile-first.
- For Docker deployment in a standalone landing-page repository, keep these files at the repository root:
  - `Dockerfile`
  - `docker-compose.prod.yml`
  - `docker-compose.server-build.yml`
  - `.github/workflows/deploy-marketing.yml`
