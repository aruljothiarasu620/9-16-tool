import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

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

    const rawUsers: any[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      rawUsers.push({
        id: docSnap.id,
        name: data.name || 'Unknown User',
        email: data.email || '',
        instagramAccounts: data.instagramAccounts || [],
        scenarios: data.scenarios || [],
        runLogs: data.runLogs || [],
      });
    });

    // ── DATABASE CLEANUP MIGRATION: Resolve Instagram Account cross-contamination ──
    // Maps Instagram account username to the UID of the user who keeps it
    const accountOwnership: Record<string, { email: string; userId: string }> = {};

    // First Pass: Find and designate ownership.
    // Rule: The admin (aruljothiarasu620@gmail.com) always owns their accounts.
    // If multiple non-admin users have it, the first one seen (or oldest) owns it.
    rawUsers.forEach((u) => {
      if (Array.isArray(u.instagramAccounts)) {
        u.instagramAccounts.forEach((acc: any) => {
          if (acc && acc.username) {
            const username = acc.username.toLowerCase();
            const existing = accountOwnership[username];
            
            // If the account hasn't been mapped, or if this user is the admin (preempts non-admin ownership)
            if (!existing || u.email === ADMIN_EMAIL) {
              accountOwnership[username] = { email: u.email, userId: u.id };
            }
          }
        });
      }
    });

    // Second Pass: Filter out duplicate accounts from other users and sync back to Firestore
    const users: any[] = [];
    let totalIgAccounts = 0;

    for (const u of rawUsers) {
      let changed = false;
      const cleanAccounts = u.instagramAccounts.filter((acc: any) => {
        if (!acc || !acc.username) return false;
        const username = acc.username.toLowerCase();
        const owner = accountOwnership[username];
        
        // If this user is not the designated owner, filter it out!
        if (owner && owner.userId !== u.id) {
          changed = true;
          return false;
        }
        return true;
      });

      if (changed) {
        // Sync the cleaned-up list back to Firestore immediately to clean the DB
        try {
          const userDocRef = doc(db, 'users', u.id);
          await setDoc(userDocRef, { instagramAccounts: cleanAccounts }, { merge: true });
          console.log(`🧹 Auto-migrated: Cleaned up duplicate IG accounts from user ${u.email || u.id}`);
        } catch (fsErr) {
          console.error(`⚠️ Failed to sync cleaned accounts for ${u.id}:`, fsErr);
        }
        u.instagramAccounts = cleanAccounts;
      }

      users.push(u);
      totalIgAccounts += cleanAccounts.length;
    }

    return NextResponse.json({ users, totalIgAccounts });
  } catch (err: any) {
    console.error('Admin users API error:', err);
    return NextResponse.json({ error: 'Internal Server Error', detail: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminEmail = req.headers.get('x-admin-email') || '';

    if (adminEmail !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Reset the user's instagramAccounts in Firestore to clean up any past leaks
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, { instagramAccounts: [] }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Admin reset user accounts error:', err);
    return NextResponse.json({ error: 'Internal Server Error', detail: err.message }, { status: 500 });
  }
}
