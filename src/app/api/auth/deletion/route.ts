import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Meta sends a signed_request. For simple apps, we can just return a confirmation
    // of how to delete data or a success status.
    
    // To comply with Meta's requirements, we return a URL where users can see 
    // their data deletion status or instructions.
    
    return NextResponse.json({
      url: 'https://makecom-azure.vercel.app/privacy#deletion',
      confirmation_code: 'del_' + Math.random().toString(36).substring(7)
    });

  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  // Fallback for verification
  return new NextResponse('Data deletion instructions: Users can delete their accounts and data directly from the Settings page within the InstaFlow application.');
}
