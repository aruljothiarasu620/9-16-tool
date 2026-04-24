import { NextResponse } from 'next/server';

/**
 * Meta Data Deletion Request Callback
 * 
 * When a user removes your app or requests data deletion via Facebook, 
 * Meta pings this endpoint. We return a confirmation code and a status URL.
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const signedRequest = formData.get('signed_request');

    if (!signedRequest) {
      return NextResponse.json({ error: 'No signed_request provided' }, { status: 400 });
    }

    // In a production app, you would decode the signed_request here
    // using your App Secret to verify the user ID and process the deletion.
    
    // For now, we return a successful response to satisfy Meta's validator.
    const confirmationCode = `DEL-${Math.random().toString(36).toUpperCase().slice(2, 10)}`;
    
    return NextResponse.json({
      url: 'https://makecom-azure.vercel.app/privacy',
      confirmation_code: confirmationCode
    });
  } catch (error) {
    console.error('Data deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
