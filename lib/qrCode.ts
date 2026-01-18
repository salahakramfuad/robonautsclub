/**
 * QR Code generation utility
 * Uses dynamic imports for code splitting
 */

/**
 * Generate QR code as image buffer
 * @param text - Text/URL to encode in QR code
 * @param size - Size of QR code in pixels (default: 300)
 * @returns Promise<Buffer> - QR code image buffer
 */
export async function generateQRCodeBuffer(
  text: string,
  size: number = 300
): Promise<Buffer> {
  // Dynamically import QRCode only when needed (code splitting)
  const QRCode = (await import('qrcode')).default
  try {
    const qrCodeBuffer = await QRCode.toBuffer(text, {
      type: 'png',
      width: size,
      margin: 2,
      errorCorrectionLevel: 'M', // Medium error correction
      color: {
        dark: '#000000', // Black
        light: '#FFFFFF', // White
      },
    })
    return qrCodeBuffer
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

/**
 * Generate QR code as data URL (base64)
 * Useful for embedding in HTML
 */
export async function generateQRCodeDataURL(
  text: string,
  size: number = 300
): Promise<string> {
  // Dynamically import QRCode only when needed (code splitting)
  const QRCode = (await import('qrcode')).default
  try {
    const dataURL = await QRCode.toDataURL(text, {
      type: 'image/png',
      width: size,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
    return dataURL
  } catch (error) {
    console.error('Error generating QR code data URL:', error)
    throw new Error('Failed to generate QR code')
  }
}

