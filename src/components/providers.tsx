import { Link, useNavigate } from "@tanstack/react-router"
import type { ReactNode } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { authClient } from "@/lib/auth-client"
import { AuthProvider } from "@/components/auth/auth-provider"
import { Toaster } from "@/components/ui/sonner"

const hasGoogleCreds =
  typeof process !== "undefined" &&
  process.env?.GOOGLE_CLIENT_ID &&
  process.env?.GOOGLE_CLIENT_SECRET

const socialProviders = hasGoogleCreds ? ["google"] : undefined

export function Providers({ children }: { children: ReactNode }) {
  const navigate = useNavigate()

  return (
    <ThemeProvider defaultTheme="system" storageKey="theme">
      <AuthProvider
        authClient={authClient}
        navigate={navigate}
        socialProviders={socialProviders}
        localization={{
          auth: {
            alreadyHaveAnAccount: "\u00bfYa tienes una cuenta?",
            confirmPassword: "Confirmar contrase\u00f1a",
            confirmPasswordPlaceholder: "Confirma tu contrase\u00f1a",
            continueWith: "Continuar con {{provider}}",
            email: "Correo electr\u00f3nico",
            emailPlaceholder: "Ingresa tu correo electr\u00f3nico",
            forgotPassword: "Olvid\u00e9 mi contrase\u00f1a",
            forgotPasswordLink: "\u00bfOlvidaste tu contrase\u00f1a?",
            hidePassword: "Ocultar contrase\u00f1a",
            invalidResetPasswordToken:
              "El token para restablecer la contrase\u00f1a no es v\u00e1lido",
            name: "Nombre",
            namePlaceholder: "Ingresa tu nombre",
            needToCreateAnAccount: "\u00bfNecesitas crear una cuenta?",
            newPassword: "Nueva contrase\u00f1a",
            newPasswordPlaceholder: "Ingresa tu nueva contrase\u00f1a",
            or: "O",
            password: "Contrase\u00f1a",
            passwordPlaceholder: "Ingresa tu contrase\u00f1a",
            passwordResetEmailSent:
              "Te enviamos un correo para restablecer tu contrase\u00f1a",
            passwordResetSuccess: "Contrase\u00f1a restablecida correctamente",
            passwordsDoNotMatch: "Las contrase\u00f1as no coinciden",
            rememberMe: "Recordarme",
            rememberYourPassword: "\u00bfRecuerdas tu contrase\u00f1a?",
            resend: "Reenviar",
            resetPassword: "Restablecer contrase\u00f1a",
            sendResetLink: "Enviar enlace de restablecimiento",
            showPassword: "Mostrar contrase\u00f1a",
            signIn: "Iniciar sesi\u00f3n",
            signOut: "Cerrar sesi\u00f3n",
            signUp: "Crear cuenta",
            verificationEmailSent: "\u00a1Correo de verificaci\u00f3n enviado!",
            verifyYourEmail: "Verifica tu correo electr\u00f3nico",
          },
        }}
        Link={Link}
      >
        <div className="flex h-full min-h-0 flex-col">{children}</div>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  )
}
