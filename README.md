# API Explorer

A mobile-friendly first version of a Public API Explorer.

## Features
- Live API catalog from `https://api.publicapis.org`
- Search by API name, description, or category
- Category chips
- Auth / HTTPS / CORS filters
- Random API
- API detail modal
- Favorite APIs stored in browser localStorage
- Responsive design for Android/mobile browsers
- No framework and no build step

## Run
Because this is a static app, you can deploy it to GitHub Pages, Cloudflare Pages, Netlify, Vercel, or any static web host.

For local testing, serve the folder with any static HTTP server.

## Data source
The app uses the Public APIs meta-API. Its documented endpoints include `/entries`, `/random`, `/categories`, and `/health`; it supports CORS and does not require authentication. See:
https://github.com/davemachado/public-api

The original catalog:
https://github.com/public-apis/public-apis

## Important
The directory is a catalog of third-party APIs. Availability, rate limits, authentication requirements and terms belong to each individual API provider.
