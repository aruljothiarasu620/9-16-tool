# Walkthrough - Watermark Fixes

We successfully identified and resolved the blurry/box-like watermark rendering issue in production on Vercel serverless containers.

## What Was Fixed

1. **Embedded Vector-Crisp Base64 PNG Watermark:**
   - Serverless Linux environments on Vercel do not have local standard TrueType fonts like `Arial` or `Helvetica` installed by default. Because of this, text tags (`<text>`) inside SVGs render as empty boxes/squares.
   - We pre-rendered the `fullsizepost.online` text overlay with a clean rounded dark pill background using Arial Bold locally.
   - The watermark is dynamically scaled to exactly **25%** of the target image's width during execution to look crisp and proportioned on any image resolution.

2. **Decoupled Assets (Disk Loading):**
   - Decoupled the binary watermark from the API route code by saving the transparent high-res PNG into `public/watermark.png`.
   - The Next.js API routes (`/api/watermark` and `/api/watermark/[filename]`) load the image overlay from disk at runtime using path resolution (`path.join(process.cwd(), 'public', 'watermark.png')`).
   - This prevents compile size limitations and avoids hitting prompt/response token limits in subsequent code updates.

3. **GET Binary Image API:**
   - Changed the watermark endpoint to support `GET` requests returning raw image binary files with `Content-Type: image/jpeg` header.
   - Enables Meta Graph API to fetch and download the watermarked post directly from our domain without CORS or base64 data URL issues.

4. **Super Admin Watermark Toggle:**
   - Integrated `💧 Watermark Test: ON/OFF` toggle in the [builder/page.tsx](file:///c:/Users/arulj/Desktop/make.com/src/app/builder/page.tsx) page specifically for the Super Admin user to test watermarking overlays.

## Verification

- The project builds cleanly with zero TypeScript errors.
- Verified on remote production target: [https://fullsizepost.online](https://fullsizepost.online).
