// Test OAuth Configuration
const config = {
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  stravaClientId: process.env.STRAVA_CLIENT_ID,
  stravaClientSecret: process.env.STRAVA_CLIENT_SECRET,
  nextAuthUrl: process.env.NEXTAUTH_URL,
  nextAuthSecret: process.env.NEXTAUTH_SECRET
};

console.log('OAuth Configuration:');
console.log('===================');
console.log('Google Client ID:', config.googleClientId);
console.log('Google Client Secret:', config.googleClientSecret ? '***' + config.googleClientSecret.slice(-4) : 'MISSING');
console.log('Strava Client ID:', config.stravaClientId);
console.log('Strava Client Secret:', config.stravaClientSecret ? '***' + config.stravaClientSecret.slice(-4) : 'MISSING');
console.log('NextAuth URL:', config.nextAuthUrl);
console.log('NextAuth Secret:', config.nextAuthSecret ? '***' + config.nextAuthSecret.slice(-4) : 'MISSING');
console.log('\nExpected Redirect URIs:');
console.log('======================');
console.log('Google:', `${config.nextAuthUrl}/api/auth/callback/google`);
console.log('Strava:', `${config.nextAuthUrl}/api/auth/callback/strava`);
