/**
 * Generate unique registration ID
 * Format: REG-YYYYMMDD-XXXXX
 * Example: REG-20241215-A3K9M
 */

/**
 * Generate a random alphanumeric string
 */
function generateRandomSuffix(length: number = 5): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed similar-looking chars (I, O, 0, 1)
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Format date as YYYYMMDD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

/**
 * Generate unique registration ID
 * Format: REG-YYYYMMDD-XXXXX
 */
export function generateRegistrationId(date: Date = new Date()): string {
  const datePart = formatDate(date)
  const randomSuffix = generateRandomSuffix(5)
  return `REG-${datePart}-${randomSuffix}`
}

