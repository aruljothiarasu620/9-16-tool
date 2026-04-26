import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { shortLivedToken } = await req.json();

    if (!shortLivedToken) {
      return NextResponse.json({ error: 'Missing shortLivedToken' }, { status: 400 });
    }

    // 1. Get Meta Config from Firestore
    const docRef = doc(db, 'config', 'meta');
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      return NextResponse.json({ error: 'Meta App Credentials not configured in Admin Panel' }, { status: 500 });
    }

    const { appId, appSecret } = snap.data();

    if (!appId || !appSecret) {
      return NextResponse.json({ error: 'Meta App ID or Secret missing in Admin Panel' }, { status: 500 });
    }

    // 2. Exchange for Long-Lived Token
    const url = `https://graph.facebook.com/v22.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      console.error('Meta Token Exchange Error:', data.error);
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    // Returns: { access_token, token_type, expires_in }
    return NextResponse.json({
      longLivedToken: data.access_token,
      expiresIn: data.expires_in
    });

  } catch (err: any) {
    console.error('API Exchange Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
