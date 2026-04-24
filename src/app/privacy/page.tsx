'use client';

export default function PrivacyPolicy() {
  return (
    <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', color: 'var(--text-primary)', lineHeight: 1.6 }}>
      <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '24px' }} className="gradient-text">
        Privacy Policy
      </h1>
      
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>1. Introduction</h2>
        <p>
          Welcome to InstaFlow. We respect your privacy and are committed to protecting your personal data. 
          This privacy policy will inform you about how we look after your personal data when you visit our website 
          and tell you about your privacy rights.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>2. Data We Collect</h2>
        <p>
          When you use InstaFlow to automate your Instagram account, we access certain data via the Instagram Graph API:
        </p>
        <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
          <li>Instagram Username and Profile Picture</li>
          <li>Account Insights and Follower Counts</li>
          <li>Media metadata (for publishing and scheduling)</li>
          <li>Access Tokens (stored locally in your browser)</li>
        </ul>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>3. How Your Data is Used</h2>
        <p>
          Your data is used solely to provide the automation services you configure. 
          <strong> We do not store your Instagram Access Tokens on our servers.</strong> 
          All sensitive credentials are stored in your browser's Local Storage.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>4. Data Deletion</h2>
        <p>
          You can revoke access and delete your data at any time by:
        </p>
        <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
          <li>Disconnecting your account in the app settings.</li>
          <li>Clearing your browser's local storage/cache.</li>
          <li>Removing the "InstaFlow" app from your Facebook Business Integrations settings.</li>
        </ul>
        <p style={{ marginTop: '12px' }}>
          To request a manual data deletion or if you have questions, please contact us via the support email provided in your account settings.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>5. Third-Party Links</h2>
        <p>
          This website uses the Facebook/Instagram SDK to facilitate login. Your interaction with these features is 
          governed by Meta's Privacy Policy.
        </p>
      </section>

      <div style={{ marginTop: '60px', padding: '20px', borderTop: '1px solid var(--border)', fontSize: '14px', color: 'var(--text-muted)' }}>
        Last Updated: {new Date().toLocaleDateString()}
      </div>
    </div>
  );
}
