import { NextResponse } from 'next/server';

/**
 * Meta Data Deletion Callback
 * This endpoint is required by Meta to allow users to request deletion of their data.
 * When a user removes the app from their Facebook settings, Meta pings this URL.
 */
export async function GET() {
  return NextResponse.json({
    status: 'active',
    message: 'InstaFlow Data Deletion Endpoint is live. Meta should use POST to request deletion.'
  });
}

export async function POST(request: Request) {
  try {
    // Meta sends a signed_request in the POST body
    // For this automation builder, we provide a confirmation code and a status URL.
    const confirmationCode = `DEL-${Math.random().toString(36).toUpperCase().slice(2, 10)}`;
    
    // In a production app, you would parse the signed_request here
    // and mark the user's data for deletion in your database.
    
    return NextResponse.json({
      url: 'https://makecom-azure.vercel.app/privacy', // URL where user can check status
      confirmation_code: confirmationCode
    });
  } catch (error) {
    console.error('Data deletion error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
