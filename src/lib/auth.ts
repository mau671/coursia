import { betterAuth } from "better-auth"
import { magicLink } from "better-auth/plugins"

const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

export const auth = betterAuth({
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
  ],
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    magicLink({
      expiresIn: 300,
      sendMagicLink: async ({ email, url }) => {
        console.log(`[Magic Link] Email: ${email}, URL: ${url}`)
      },
    }),
  ],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  ...(googleClientId && googleClientSecret
    ? {
        socialProviders: {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        },
      }
    : {}),
})
