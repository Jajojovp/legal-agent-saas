import NextAuth from 'next-auth';
import { getAuthOptions } from './app/api/auth/[...nextauth]/auth-options';

// Auth.js v5 single initialization point; handlers and server auth share this config.
export const { handlers, auth, signIn, signOut } = NextAuth(getAuthOptions());
