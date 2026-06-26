import nodemailer from "nodemailer"

type AlertEmail = {
  to: string
  subject: string
  text: string
}

function getTransport() {
  const host = process.env.SMTP_HOST ?? "smtp.gmail.com"
  const port = Number(process.env.SMTP_PORT)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!pass) {
    throw new Error("SMTP_PASS is not configured.")
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  })
}

export async function sendAlertEmail({ to, subject, text }: AlertEmail) {
  const from =
    process.env.SMTP_FROM ??
    "Candlestick Alerts <arjunv.prakash12345@gmail.com>"

  await getTransport().sendMail({
    from,
    to,
    subject,
    text,
  })
}
