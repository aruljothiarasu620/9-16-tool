import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Helper to overlay transparent PNG watermark on an image buffer
async function addWatermark(imgBuffer: Buffer): Promise<Buffer> {
  const meta = await sharp(imgBuffer).metadata();
  const imgWidth = meta.width || 1080;
  const imgHeight = meta.height || 1080;

  // Render watermark at 25% width of the target image to look crisp on any resolution
  const wmWidth = Math.max(160, Math.round(imgWidth * 0.25));
  const wmHeight = Math.round(wmWidth * (44 / 380));

  const wmPath = path.join(process.cwd(), 'public', 'watermark.png');
  
  if (!fs.existsSync(wmPath)) {
    throw new Error(`Watermark file not found at path: ${wmPath}`);
  }
  
  const watermarkPngBuffer = fs.readFileSync(wmPath);
  console.log(`Loaded watermark PNG from ${wmPath}: ${watermarkPngBuffer.length} bytes`);
  
  if (watermarkPngBuffer.length === 0) {
    throw new Error(`Watermark file at ${wmPath} is empty`);
  }
  
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
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  let debugInfo: any = {};
  try {
    const imageUrl = req.nextUrl.searchParams.get('imageUrl');

    if (!imageUrl) {
      return new Response('imageUrl query parameter is required', { status: 400 });
    }

    debugInfo.imageUrl = imageUrl;
    console.log(`Watermark parameterized GET triggered for URL: ${imageUrl}`);
    const imgRes = await fetch(imageUrl, { cache: 'no-store' });
    
    debugInfo.fetchStatus = imgRes.status;
    debugInfo.contentType = imgRes.headers.get('content-type');
    
    console.log(`Fetch status: ${imgRes.status}, Content-Type: ${imgRes.headers.get('content-type')}`);
    if (!imgRes.ok) {
      return new Response(`Failed to fetch source image (status ${imgRes.status})`, { status: 400 });
    }

    const arrayBuffer = await imgRes.arrayBuffer();
    const imgBuffer = Buffer.from(arrayBuffer);
    debugInfo.imgBufferLength = imgBuffer.length;
    console.log(`Fetched image buffer length: ${imgBuffer.length} bytes`);

    if (imgBuffer.length === 0) {
      return new Response('Fetched image buffer is empty', { status: 400 });
    }

    // Diagnostic filesystem check
    const wmPath = path.join(process.cwd(), 'public', 'watermark.png');
    debugInfo.wmPath = wmPath;
    debugInfo.wmExists = fs.existsSync(wmPath);
    if (debugInfo.wmExists) {
      debugInfo.wmSize = fs.statSync(wmPath).size;
    }

    const watermarkedBuffer = await addWatermark(imgBuffer);

    return new Response(new Uint8Array(watermarkedBuffer), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (err: any) {
    console.error('Watermark GET API error:', err);
    return new Response(
      `Watermark rendering failed: ${err.message}\n\nStack:\n${err.stack}\n\nDebug Info:\n${JSON.stringify(debugInfo, null, 2)}`, 
      { status: 500 }
    );
  }
}

// POST method: Backwards compatibility
export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 });
    }

    const imgRes = await fetch(imageUrl, { cache: 'no-store' });
    if (!imgRes.ok) {
      return NextResponse.json({ error: `Failed to fetch image: status ${imgRes.status}` }, { status: 400 });
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
