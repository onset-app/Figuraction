import { Heading, Section, Text } from "@react-email/components"
import { EmailLayout, styles } from "./layout"

interface ConvocationEmailProps {
  firstName: string
  projectTitle: string
  location: string
  address: string
  date: string
  time: string
  instructions: string
  contactName: string
  contactPhone: string
}

export function ConvocationEmail({
  firstName,
  projectTitle,
  location,
  address,
  date,
  time,
  instructions,
  contactName,
  contactPhone,
}: ConvocationEmailProps) {
  return (
    <EmailLayout preview={`Votre convocation pour « ${projectTitle} »`}>
      <Heading style={styles.heading}>Votre convocation 📋</Heading>

      <Text style={styles.paragraph}>
        Bonjour {firstName}, voici votre convocation pour le tournage de{" "}
        <strong>{projectTitle}</strong>. Merci de lire attentivement les informations ci-dessous.
      </Text>

      <Section style={styles.detailBox}>
        <Text style={styles.detailRow}>
          <span style={styles.detailLabel}>Date :</span> {date}
        </Text>
        <Text style={styles.detailRow}>
          <span style={styles.detailLabel}>Heure de convocation :</span> {time}
        </Text>
        <Text style={styles.detailRow}>
          <span style={styles.detailLabel}>Lieu :</span> {location}
        </Text>
        <Text style={styles.detailRow}>
          <span style={styles.detailLabel}>Adresse :</span> {address}
        </Text>
      </Section>

      <Text style={styles.paragraph}>
        <span style={styles.detailLabel}>Consignes & tenue</span>
        <br />
        {instructions}
      </Text>

      <Section style={styles.detailBox}>
        <Text style={styles.detailRow}>
          <span style={styles.detailLabel}>À votre arrivée</span>
        </Text>
        <Text style={styles.detailRow}>
          Présentez-vous à <strong>{contactName}</strong> — {contactPhone}
        </Text>
      </Section>

      <Text style={styles.paragraph}>
        Merci d'être ponctuel(le) et de prévenir votre contact en cas d'imprévu.
      </Text>

      <Text style={styles.paragraph}>
        Bon tournage,
        <br />
        L'équipe OnSet
      </Text>
    </EmailLayout>
  )
}

export default ConvocationEmail
