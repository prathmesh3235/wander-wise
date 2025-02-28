import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from '../../../api-lib/db';
import User from '../../../models/User';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await dbConnect();
        
        // Find user by email
        const user = await User.findOne({ email: credentials.email }).select('+password');
        
        // Check if user exists and password matches
        if (user && await user.matchPassword(credentials.password)) {
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.profileImage
          };
        }
        
        return null;
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      return session;
    },
    async signIn({ user, account }) {
      if (account.provider === 'google') {
        await dbConnect();
        
        // Check if user already exists
        const existingUser = await User.findOne({ email: user.email });
        
        if (!existingUser) {
          // Create new user from Google data
          await User.create({
            name: user.name,
            email: user.email,
            profileImage: user.image,
            password: Math.random().toString(36).slice(-10) // Random password
          });
        }
      }
      return true;
    }
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET
});
