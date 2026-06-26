export const alertConditions = ["greater_than", "less_than"] as const
export const alertFrequencies = ["1m", "15m", "1h", "1d"] as const

export type AlertCondition = (typeof alertConditions)[number]
export type AlertFrequency = (typeof alertFrequencies)[number]

export const alertConditionLabels: Record<AlertCondition, string> = {
  greater_than: "Greater than (>)",
  less_than: "Less than (<)",
}

export const alertFrequencyLabels: Record<AlertFrequency, string> = {
  "1m": "Every minute",
  "15m": "Every 15 minutes",
  "1h": "Once per hour",
  "1d": "Once per day",
}

const frequencyDurations: Record<AlertFrequency, number> = {
  "1m": 60 * 1000,
  "15m": 15 * 60 * 1000,
  "1h": 60 * 60 * 1000,
  "1d": 24 * 60 * 60 * 1000,
}

export function isAlertCondition(value: string): value is AlertCondition {
  return alertConditions.includes(value as AlertCondition)
}

export function isAlertFrequency(value: string): value is AlertFrequency {
  return alertFrequencies.includes(value as AlertFrequency)
}

export function shouldCheckAlert(
  frequency: AlertFrequency,
  lastCheckedAt: Date | null,
  now = new Date()
) {
  if (!lastCheckedAt) {
    return true
  }

  return (
    now.getTime() - lastCheckedAt.getTime() >= frequencyDurations[frequency]
  )
}

export function shouldSendAlert(
  condition: AlertCondition,
  price: number,
  threshold: number,
  frequency: AlertFrequency,
  lastTriggeredAt: Date | null,
  now = new Date()
) {
  const crossed =
    condition === "greater_than" ? price > threshold : price < threshold

  if (!crossed) {
    return false
  }

  if (!lastTriggeredAt) {
    return true
  }

  return (
    now.getTime() - lastTriggeredAt.getTime() >= frequencyDurations[frequency]
  )
}

export function formatAlertCondition(
  condition: AlertCondition,
  threshold: number
) {
  const operator = condition === "greater_than" ? ">" : "<"

  return `Price ${operator} ${formatPrice(threshold)}`
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value)
}
