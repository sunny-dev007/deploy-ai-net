import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { google } from 'googleapis';

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope: [
            'openid',
            'email', 
            'profile',
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/drive.appdata',
            'https://www.googleapis.com/auth/drive.metadata'
          ].join(' '),
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }: any) {
      // Persist the OAuth access_token and refresh_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at * 1000;
      }
      
      // If token has expired, try to refresh it
      if (Date.now() < token.accessTokenExpires) {
        return token;
      }
      
      return await refreshAccessToken(token);
    },
    async session({ session, token }: any) {
      // Send properties to the client
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Helper function to refresh token
async function refreshAccessToken(token: any) {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      refresh_token: token.refreshToken
    });

    const { credentials } = await oauth2Client.refreshAccessToken();

    return {
      ...token,
      accessToken: credentials.access_token,
      accessTokenExpires: Date.now() + (credentials.expiry_date || 3600) * 1000,
    };
  } catch (error) {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 