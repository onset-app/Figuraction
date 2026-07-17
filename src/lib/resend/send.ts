import { render } from "@react-email/components"
import * as Sentry from "@sentry/nextjs"
import type { ReactElement } from "react"
import { ApplicationConfirmedEmail } from "@/emails/application-confirmed"
import { ApplicationRejectedEmail } from "@/emails/application-rejected"
import { ConvocationEmail } from "@/emails/convocation"
import { WelcomeEmail } from "@/emails/welcome"
import type { UserRole } from "@/types/enums"
import { getResendClient } from "./client"
import { EMAIL_FROM } from "./env"

/**
 * Low-level email dispatch. SERVER-ONLY (never a Server Action): every sender
 * here takes a raw recipient address, so exposing them to the client would be
 * an open relay. They are called exclusively by trusted server code (auth /
 * application actions) that has already authorized the recipient.
 *
 * All senders swallow failures — email is a best-effort side effect and must
 * never break the action that triggered it (a confirmed candidate stays
 * confirmed even if the email bounces). Failures are reported to Sentry.
 */

export type SendResult = { success: boolean }

async function dispatch(to: string, subject: string, template: ReactElement): Promise<SendResult> {
  try {
    const html = await render(template)
    const { error } = await getResendClient().emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    })
    if (error) {
      Sentry.captureException(error, { tags: { feature: "email" }, extra: { subject } })
      return { success: false }
    }
    return { success: true }
  } catch (error) {
    Sentry.captureException(error, { tags: { feature: "email" }, extra: { subject } })
    return { success: false }
  }
}

export function sendWelcomeEmail(params: {
  to: string
  firstName: string
  role: Extract<UserRole, "figurant" | "production">
}): Promise<SendResult> {
  return dispatch(
    params.to,
    "Bienvenue sur OnSet 🎬",
    WelcomeEmail({ firstName: params.firstName, role: params.role })
  )
}

export function sendApplicationConfirmedEmail(params: {
  to: string
  firstName: string
  castingTitle: string
  projectTitle: string
  location: string
  shootDate: string
}): Promise<SendResult> {
  return dispatch(
    params.to,
    `Candidature confirmée — ${params.castingTitle}`,
    ApplicationConfirmedEmail({
      firstName: params.firstName,
      castingTitle: params.castingTitle,
      projectTitle: params.projectTitle,
      location: params.location,
      shootDate: params.shootDate,
    })
  )
}

export function sendApplicationRejectedEmail(params: {
  to: string
  firstName: string
  castingTitle: string
}): Promise<SendResult> {
  return dispatch(
    params.to,
    `Suite à votre candidature — ${params.castingTitle}`,
    ApplicationRejectedEmail({ firstName: params.firstName, castingTitle: params.castingTitle })
  )
}

export function sendConvocationEmail(params: {
  to: string
  firstName: string
  projectTitle: string
  location: string
  address: string
  date: string
  time: string
  instructions: string
  contactName: string
  contactPhone: string
}): Promise<SendResult> {
  return dispatch(
    params.to,
    `Convocation — ${params.projectTitle}`,
    ConvocationEmail({
      firstName: params.firstName,
      projectTitle: params.projectTitle,
      location: params.location,
      address: params.address,
      date: params.date,
      time: params.time,
      instructions: params.instructions,
      contactName: params.contactName,
      contactPhone: params.contactPhone,
    })
  )
}
