import { Button, Heading, Section, Text } from "@react-email/components"
import { getAppUrl } from "@/lib/env"
import { EmailLayout, styles } from "./layout"

interface ApplicationConfirmedEmailProps {
  firstName: string
  castingTitle: string
  projectTitle: string
  location: string
  shootDate: string
}

export function ApplicationConfirmedEmail({
  firstName,
  castingTitle,
  projectTitle,
  location,
  shootDate,
}: ApplicationConfirmedEmailProps) {
  return (
    <EmailLayout preview={`Votre candidature pour « ${castingTitle} » est confirmée 🎉`}>
      <Heading style={styles.heading}>Félicitations {firstName} ! 🎉</Heading>

      <Text style={styles.paragraph}>
        Bonne nouvelle : votre candidature pour le casting <strong>{castingTitle}</strong> a été
        confirmée. Vous faites officiellement partie du tournage !
      </Text>

      <Section style={styles.detailBox}>
        <Text style={styles.detailRow}>
          <span style={styles.detailLabel}>Casting :</span> {castingTitle}
        </Text>
        <Text style={styles.detailRow}>
          <span style={styles.detailLabel}>Projet :</span> {projectTitle}
        </Text>
        <Text style={styles.detailRow}>
          <span style={styles.detailLabel}>Lieu :</span> {location}
        </Text>
        <Text style={styles.detailRow}>
          <span style={styles.detailLabel}>Date de tournage :</span> {shootDate}
        </Text>
      </Section>

      <Text style={styles.paragraph}>
        <span style={styles.detailLabel}>Et maintenant ?</span> La production vous enverra une
        convocation avec l'horaire précis, l'adresse exacte et les consignes (tenue, contact sur
        place) à l'approche du tournage. Gardez un œil sur vos emails et vos candidatures.
      </Text>

      <Section style={styles.buttonSection}>
        <Button href={`${getAppUrl()}/app/candidatures`} style={styles.button}>
          Voir ma candidature
        </Button>
      </Section>

      <Text style={styles.paragraph}>
        Bon tournage,
        <br />
        L'équipe ONSET
      </Text>
    </EmailLayout>
  )
}

export default ApplicationConfirmedEmail
