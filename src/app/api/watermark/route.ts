import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

// High-resolution transparent PNG showing "fullsizepost.online" text with a dark rounded pill background
const WATERMARK_BASE64 = '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';

// Helper to overlay transparent PNG watermark on an image buffer
async function addWatermark(imgBuffer: Buffer): Promise<Buffer> {
  const meta = await sharp(imgBuffer).metadata();
  const imgWidth = meta.width || 1080;
  const imgHeight = meta.height || 1080;

  // Render watermark at 25% width of the target image to look crisp on any resolution
  const wmWidth = Math.max(160, Math.round(imgWidth * 0.25));
  const wmHeight = Math.round(wmWidth * (44 / 380));

  const watermarkPngBuffer = Buffer.from(WATERMARK_BASE64, 'base64');
  
  // Resize the watermark overlay dynamically
  const resizedWatermark = await sharp(watermarkPngBuffer)
    .resize({ width: wmWidth, height: wmHeight })
    .toBuffer();

  const padding = Math.round(imgWidth * 0.02); // 2% padding
  const x = imgWidth - wmWidth - padding;
  const y = imgHeight - wmHeight - padding;

  return sharp(imgBuffer)
    .composite([
      {
        input: resizedWatermark,
        left: x,
        top: y,
        blend: 'over',
      },
    ])
    .jpeg({ quality: 90 })
    .toBuffer();
}

// GET method: Serves the binary image directly. Meta/Instagram fetches from this URL.
export async function GET(req: NextRequest) {
  try {
    const imageUrl = req.nextUrl.searchParams.get('imageUrl');

    if (!imageUrl) {
      return new Response('imageUrl query parameter is required', { status: 400 });
    }

    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
      return new Response('Failed to fetch source image', { status: 400 });
    }

    const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
    const watermarkedBuffer = await addWatermark(imgBuffer);

    return new Response(new Uint8Array(watermarkedBuffer), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (err: any) {
    console.error('Watermark GET API error:', err);
    return new Response(err.message || 'Watermark rendering failed', { status: 500 });
  }
}

// POST method: Backwards compatibility
export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 });
    }

    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 400 });
    }

    const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
    const watermarkedBuffer = await addWatermark(imgBuffer);

    const base64 = watermarkedBuffer.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64}`;

    return NextResponse.json({ watermarkedUrl: dataUrl, success: true });
  } catch (err: any) {
    console.error('Watermark POST API error:', err);
    return NextResponse.json({ error: err.message || 'Watermark failed' }, { status: 500 });
  }
}
