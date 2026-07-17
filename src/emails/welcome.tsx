import { Button, Heading, Section, Text } from "@react-email/components"
import type { UserRole } from "@/types/enums"
import { APP_URL, EmailLayout, styles } from "./layout"

interface WelcomeEmailProps {
  firstName: string
  role: Extract<UserRole, "figurant" | "production">
}

const nextSteps: Record<WelcomeEmailProps["role"], string[]> = {
  figurant: [
    "Complétez votre profil et ajoutez vos photos pour vous démarquer.",
    "Parcourez les castings ouverts en Belgique.",
    "Postulez en un clic aux rôles qui vous correspondent.",
  ],
  production: [
    "Créez votre premier projet et ses castings.",
    "Diffusez vos annonces auprès de figurants disponibles.",
    "Gérez les candidatures et confirmez vos figurants.",
  ],
}

export function WelcomeEmail({ firstName, role }: WelcomeEmailProps) {
  const steps = nextSteps[role]
  const ctaLabel = role === "figurant" ? "Découvrir les castings" : "Créer un projet"

  return (
    <EmailLayout preview="Bienvenue sur OnSet 🎬">
      <Heading style={styles.heading}>Bienvenue {firstName} 👋</Heading>

      <Text style={styles.paragraph}>
        Votre compte OnSet est prêt. Nous sommes ravis de vous compter parmi
        {role === "figurant" ? " nos figurants" : " les productions"}.
      </Text>

      <Text style={styles.paragraph}>Voici comment bien démarrer :</Text>

      <Section>
        {steps.map((step, index) => (
          <Text key={step} style={styles.paragraph}>
            <span style={styles.detailLabel}>{index + 1}.</span> {step}
          </Text>
        ))}
      </Section>

      <Section style={styles.buttonSection}>
        <Button href={`${APP_URL}/app/dashboard`} style={styles.button}>
          {ctaLabel}
        </Button>
      </Section>

      <Text style={styles.paragraph}>
        À très vite sur les plateaux,
        <br />
        L'équipe OnSet
      </Text>
    </EmailLayout>
  )
}

export default WelcomeEmail
