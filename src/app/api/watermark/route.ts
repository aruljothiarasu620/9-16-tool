import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 });
    }

    // Fetch the original image
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 400 });
    }

    const imgBuffer = Buffer.from(await imgRes.arrayBuffer());

    // Get image metadata to size the watermark correctly
    const meta = await sharp(imgBuffer).metadata();
    const imgWidth = meta.width || 1080;
    const imgHeight = meta.height || 1080;

    // Build SVG watermark text overlay
    const fontSize = Math.max(20, Math.round(imgWidth * 0.025));
    const padding = Math.round(fontSize * 0.6);
    const textWidth = Math.round(fontSize * 9.5); // approx char width * chars
    const textHeight = Math.round(fontSize * 1.8);
    const x = imgWidth - textWidth - padding;
    const y = imgHeight - textHeight - padding;

    const svgWatermark = `
      <svg width="${imgWidth}" height="${imgHeight}" xmlns="http://www.w3.org/2000/svg">
        <rect 
          x="${x - padding}" 
          y="${y - padding}" 
          width="${textWidth + padding * 2}" 
          height="${textHeight + padding}" 
          rx="6" ry="6" 
          fill="rgba(0,0,0,0.45)"
        />
        <text
          x="${x}"
          y="${y + fontSize}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${fontSize}"
          font-weight="bold"
          fill="rgba(255,255,255,0.90)"
          letter-spacing="0.5"
        >fullsizepost.online</text>
      </svg>
    `;

    // Composite watermark on top of image
    const watermarkedBuffer = await sharp(imgBuffer)
      .composite([
        {
          input: Buffer.from(svgWatermark),
          gravity: 'southeast',
          blend: 'over',
        },
      ])
      .jpeg({ quality: 90 })
      .toBuffer();

    // Return as base64 data URL (can be used directly as image src)
    const base64 = watermarkedBuffer.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64}`;

    return NextResponse.json({ watermarkedUrl: dataUrl, success: true });
  } catch (err: any) {
    console.error('Watermark API error:', err);
    return NextResponse.json({ error: err.message || 'Watermark failed' }, { status: 500 });
  }
}
