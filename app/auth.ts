import NextAuth, { AuthOptions, getServerSession } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import {
  isAllowedAdminEmail,
  parseAdminAllowedEmails,
} from "@/lib/adminAuthorization"

function envValue(name: string): string | undefined {
  const value = process.env[name]?.trim()
  return value ? value : undefined
}

function getAuthSecret(): string | undefined {
  return envValue("AUTH_SECRET") ?? envValue("NEXTAUTH_SECRET")
}

function getCredentialsAuthConfig(): {
  username: string
  password: string
} | null {
  const username = envValue("AUTH_USERNAME")
  const password = envValue("AUTH_PASSWORD")

  if (!username || !password) return null
  return { username, password }
}

function getGoogleAuthConfig(): {
  clientId: string
  clientSecret: string
} | null {
  const clientId = envValue("AUTH_GOOGLE_CLIENT_ID")
  const clientSecret = envValue("AUTH_GOOGLE_CLIENT_SECRET")

  if (!clientId || !clientSecret) return null
  return { clientId, clientSecret }
}

const providers = []
const googleAuth = getGoogleAuthConfig()
const credentialsAuth = getCredentialsAuthConfig()

if (googleAuth) {
  providers.push(
    GoogleProvider({
      clientId: googleAuth.clientId,
      clientSecret: googleAuth.clientSecret,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          scope: "openid email profile",
        },
      },
    }),
  )
}

if (credentialsAuth) {
  providers.push(
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "username" },
        password: { label: "Password", type: "password", placeholder: "********" },
      },
      async authorize(credentials) {
        // Read credentials at request time so a server process does not depend on
        // values captured during the build/import phase.
        const current = getCredentialsAuthConfig()
        if (
          current &&
          credentials?.username === current.username &&
          credentials?.password === current.password
        ) {
          return { name: current.username, id: current.username }
        }

        return null
      },
    }),
  )
}

const authOptions: AuthOptions = {
  // AUTH_SECRET is the project-standard name. NEXTAUTH_SECRET remains a safe
  // compatibility fallback for NextAuth deployments.
  secret: getAuthSecret(),
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        return isAllowedAdminEmail(user.email)
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
      return "/admin"
    },
  },
  theme: {
    colorScheme: "light",
  },
}

/**
 * Helper function to get the session on the server without having to import the
 * authOptions object every single time.
 */
const getSession = () => getServerSession(authOptions)

/**
 * The admin is available only when credentials auth is configured, or when
 * Google OAuth is configured with at least one explicitly allowed email.
 * Environment values are checked at call time to avoid stale build-time state.
 */
const isAdminInterfaceEnabled = () => {
  const google = getGoogleAuthConfig()
  const credentials = getCredentialsAuthConfig()

  return Boolean(
    (google && parseAdminAllowedEmails().length > 0) || credentials,
  )
}

export { authOptions, getSession, isAdminInterfaceEnabled }
