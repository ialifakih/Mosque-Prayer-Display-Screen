import NextAuth, { AuthOptions, getServerSession } from "next-auth"
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from "next-auth/providers/credentials"
import {
  isAllowedAdminEmail,
  parseAdminAllowedEmails,
} from "@/lib/adminAuthorization"

const AUTH_GOOGLE_CLIENT_ID = process.env.AUTH_GOOGLE_CLIENT_ID
const AUTH_GOOGLE_CLIENT_SECRET = process.env.AUTH_GOOGLE_CLIENT_SECRET
const AUTH_USERNAME = process.env.AUTH_USERNAME
const AUTH_PASSWORD = process.env.AUTH_PASSWORD
const AUTH_SECRET = process.env.AUTH_SECRET
const ADMIN_ALLOWED_EMAILS = process.env.ADMIN_ALLOWED_EMAILS

const providers = []

if (AUTH_GOOGLE_CLIENT_ID && AUTH_GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: AUTH_GOOGLE_CLIENT_ID!,
      clientSecret: AUTH_GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          scope: "openid email profile"
        },
      },
    }),
  )
}

if (AUTH_USERNAME && AUTH_PASSWORD) {
  providers.push(
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text", placeholder: "username" },
        password: { label: "Password", type: "password", placeholder: "********" }
      },
      async authorize(credentials) {
        if (credentials?.username === AUTH_USERNAME && credentials?.password === AUTH_PASSWORD) {
          return { name: AUTH_USERNAME, id: AUTH_USERNAME }
        }

        // Return null if user data could not be retrieved
        return null
      }
    })
  )
}

const authOptions: AuthOptions = {
  secret: AUTH_SECRET,
  providers: providers,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        return isAllowedAdminEmail(user.email, ADMIN_ALLOWED_EMAILS)
      }

      return account?.provider === "credentials"
    },
    async jwt({ token, account }) {
      if (account?.provider != null) {
        token.provider = account.provider
      }
      return token
    },
    async session({ session, token }) {
      return { ...session, provider: token.provider as string | undefined }
    },
    async redirect() {
      // ALWAYS redirect to /admin after sign in
      return "/admin";
    },
  },
  theme: {
    colorScheme: "light",

  }
}

/**
 * Helper function to get the session on the server without having to import the authOptions object every single time
 * @returns The session object or null
 */
const getSession = () => getServerSession(authOptions)

/**
 * The admin is available only when credentials auth is configured, or when
 * Google OAuth is configured with at least one explicitly allowed email.
 */
const isAdminInterfaceEnabled = () => (
  (AUTH_GOOGLE_CLIENT_ID != null &&
    AUTH_GOOGLE_CLIENT_SECRET != null &&
    parseAdminAllowedEmails(ADMIN_ALLOWED_EMAILS).length > 0)
  || (AUTH_USERNAME != null && AUTH_PASSWORD != null)
)

export { authOptions, getSession, isAdminInterfaceEnabled }
