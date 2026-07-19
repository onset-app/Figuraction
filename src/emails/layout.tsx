import { Body, Container, Head, Hr, Html, Preview, Section, Text } from "@react-email/components"
import type { ReactNode } from "react"

interface EmailLayoutProps {
  /** Short summary shown in the inbox preview line, before the email is opened. */
  preview: string
  children: ReactNode
}

/**
 * Shared layout for all transactional emails: branded header, white card body,
 * and footer. Every template wraps its content in this component so branding
 * and typography stay consistent.
 */
export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>ONSET</Text>
          </Section>

          <Section style={card}>{children}</Section>

          <Hr style={divider} />

          {/* Transactional emails: no unsubscribe link required (and a dead
              "#" link is worse than none). */}
          <Section style={footer}>
            <Text style={footerText}>ONSET — La plateforme des figurants</Text>
            <Text style={footerMuted}>Vous recevez cet email car vous avez un compte ONSET.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#f4f4f5",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
}

const container = {
  margin: "0 auto",
  padding: "24px 0 48px",
  maxWidth: "560px",
}

const header = {
  padding: "0 0 16px",
  textAlign: "center" as const,
}

const logo = {
  fontSize: "28px",
  fontWeight: "700",
  letterSpacing: "-0.5px",
  color: "#18181b",
  margin: "0",
}

const card = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  border: "1px solid #e4e4e7",
  padding: "32px",
}

const divider = {
  borderColor: "#e4e4e7",
  margin: "24px 0",
}

const footer = {
  textAlign: "center" as const,
}

const footerText = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#52525b",
  margin: "0 0 4px",
}

const footerMuted = {
  fontSize: "12px",
  color: "#a1a1aa",
  margin: "0",
}

/**
 * Shared text/element styles exported for use inside templates, so every
 * email renders headings, paragraphs and buttons the same way.
 */
export const styles = {
  heading: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#18181b",
    margin: "0 0 16px",
  },
  paragraph: {
    fontSize: "15px",
    lineHeight: "24px",
    color: "#3f3f46",
    margin: "0 0 16px",
  },
  button: {
    display: "inline-block",
    backgroundColor: "#18181b",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "600",
    textDecoration: "none",
    padding: "12px 24px",
    borderRadius: "8px",
  },
  buttonSection: {
    textAlign: "center" as const,
    margin: "24px 0",
  },
  detailBox: {
    backgroundColor: "#f4f4f5",
    borderRadius: "8px",
    padding: "16px 20px",
    margin: "0 0 16px",
  },
  detailRow: {
    fontSize: "14px",
    lineHeight: "22px",
    color: "#3f3f46",
    margin: "0",
  },
  detailLabel: {
    fontWeight: "600",
    color: "#18181b",
  },
} as const
