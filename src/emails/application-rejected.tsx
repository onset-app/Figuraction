import { Button, Heading, Section, Text } from "@react-email/components"
import { getAppUrl } from "@/lib/env"
import { EmailLayout, styles } from "./layout"

interface ApplicationRejectedEmailProps {
  firstName: string
  castingTitle: string
}

export function ApplicationRejectedEmail({
  firstName,
  castingTitle,
}: ApplicationRejectedEmailProps) {
  return (
    <EmailLayout preview={`Suite à votre candidature pour « ${castingTitle} »`}>
      <Heading style={styles.heading}>Merci pour votre candidature, {firstName}</Heading>

      <Text style={styles.paragraph}>
        Nous vous remercions de l'intérêt porté au casting <strong>{castingTitle}</strong>. Après
        étude des profils, la production n'a malheureusement pas retenu votre candidature pour ce
        rôle.
      </Text>

      <Text style={styles.paragraph}>
        Cela n'enlève rien à votre profil : chaque casting a des critères très spécifiques (âge,
        physique, disponibilités) et les choix se jouent souvent à peu de chose. De nouvelles
        opportunités sont publiées régulièrement.
      </Text>

      <Text style={styles.paragraph}>
        Continuez à postuler — le rôle idéal est peut-être en ligne dès maintenant.
      </Text>

      <Section style={styles.buttonSection}>
        <Button href={`${getAppUrl()}/app/castings`} style={styles.button}>
          Voir les castings ouverts
        </Button>
      </Section>

      <Text style={styles.paragraph}>
        À bientôt sur ONSET,
        <br />
        L'équipe ONSET
      </Text>
    </EmailLayout>
  )
}

export default ApplicationRejectedEmail
