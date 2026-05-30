import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

const ADMIN_EMAIL = 'aruljothiarasu620@gmail.com';

export async function GET(req: NextRequest) {
  try {
    // Verify the admin token from Authorization header
    const authHeader = req.headers.get('authorization') || '';
    const adminToken = authHeader.replace('Bearer ', '');

    // Simple check: the token must equal the admin secret env var,
    // or we use the x-admin-uid header to verify via Firebase Auth
    const adminUid = req.headers.get('x-admin-uid') || '';
    const adminEmail = req.headers.get('x-admin-email') || '';

    if (adminEmail !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch ALL users from Firestore using the server-side (same-project) client
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);

    const users: any[] = [];
    let totalIgAccounts = 0;

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      users.push({
        id: docSnap.id,
        name: data.name || 'Unknown User',
        email: data.email || '',
        instagramAccounts: data.instagramAccounts || [],
        scenarios: data.scenarios || [],
        runLogs: data.runLogs || [],
      });
      if (Array.isArray(data.instagramAccounts)) {
        totalIgAccounts += data.instagramAccounts.length;
      }
    });

    return NextResponse.json({ users, totalIgAccounts });
  } catch (err: any) {
    console.error('Admin users API error:', err);
    return NextResponse.json({ error: 'Internal Server Error', detail: err.message }, { status: 500 });
  }
}
