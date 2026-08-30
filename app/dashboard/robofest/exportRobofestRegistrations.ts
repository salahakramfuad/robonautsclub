import { format } from 'date-fns'
import type { RobofestContent, RobofestRegistration } from '@/lib/robofest-content'
import { resolveRobofestRoundVenueLabel } from '@/lib/robofest-venue'
import { formatAgeCategoryLabel } from '@/lib/robofest-registration-options'
import { ROBOFEST_LOCAL } from '@/lib/robofest-local'

export type RobofestExportOptions = {
  /** When false, omit payment status / amounts / trx from exports. */
  includePayments?: boolean
  /** Used to resolve per-division venue in exports. */
  content?: RobofestContent
}

function dateStamp() {
  return format(new Date(), 'yyyy-MM-dd')
}

function ageLabel(r: RobofestRegistration) {
  return r.ageCategory ? formatAgeCategoryLabel(r.ageCategory) : ''
}

function createdLabel(r: RobofestRegistration) {
  if (!r.createdAt) return ''
  try {
    return format(new Date(r.createdAt), 'dd MMM yyyy HH:mm')
  } catch {
    return r.createdAt
  }
}

function venueLabel(
  r: RobofestRegistration,
  content?: RobofestContent,
): string {
  if (!content || !r.roundCity?.trim()) return ''
  return resolveRobofestRoundVenueLabel(content, r.roundCity)
}

function membersLabel(r: RobofestRegistration) {
  const members = r.teamMembers?.filter((m) => m?.name) || []
  if (members.length === 0) {
    return [r.name, r.email, r.phone].filter(Boolean).join(' · ') || '—'
  }
  return members
    .map((m, i) => {
      const detail = [m.email, m.phone, m.school].filter(Boolean).join(' · ')
      return `${i + 1}. ${m.name}${detail ? ` (${detail})` : ''}`
    })
    .join('\n')
}

function memberCells(r: RobofestRegistration) {
  return [0, 1, 2, 3].flatMap((i) => {
    const m = r.teamMembers?.[i]
    return [
      m?.name || '',
      m?.email || '',
      m?.phone || '',
      m?.school || '',
      m?.branch || '',
      m?.grade || '',
    ]
  })
}

async function loadLogoDataUrl(): Promise<string | null> {
  try {
    const logoRes = await fetch('/robologo.png')
    if (!logoRes.ok) return null
    const blob = await logoRes.blob()
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

export function exportRobofestCsv(
  rows: RobofestRegistration[],
  options: RobofestExportOptions = {},
) {
  const includePayments = options.includePayments !== false
  const memberHeaders = [1, 2, 3, 4].flatMap((n) => [
    `Member ${n} Name`,
    `Member ${n} Email`,
    `Member ${n} Phone`,
    `Member ${n} School`,
    `Member ${n} Branch`,
    `Member ${n} Grade`,
  ])
  const headers = [
    'Registration ID',
    'Team Number',
    'Team Name',
    'Contact Email',
    'Contact Phone',
    'Contact School',
    'Age Category',
    'Team Size',
    'Campus Ambassador',
    'Ambassador School',
    'Division',
    'Venue',
    'Competition',
    'Status',
    ...(includePayments ? (['Payment', 'Amount Paid', 'Trx ID'] as const) : []),
    'Created At',
    'Notes',
    ...memberHeaders,
  ]
  const lines = rows.map((r) =>
    [
      r.registrationId || '',
      r.teamNumber || '',
      r.name,
      r.email,
      r.phone,
      r.school,
      ageLabel(r),
      r.teamSize ?? r.teamMembers?.length ?? '',
      r.campusAmbassadorName || '',
      r.campusAmbassadorSchool || '',
      r.roundCity,
      venueLabel(r, options.content),
      r.category,
      r.status,
      ...(includePayments
        ? [r.paymentStatus || '', r.amountPaid ?? '', r.trxId || '']
        : []),
      r.createdAt || '',
      r.notes || '',
      ...memberCells(r),
    ]
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(','),
  )
  const blob = new Blob([[headers.join(','), ...lines].join('\n')], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `robofest-registrations-${dateStamp()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export async function exportRobofestExcel(
  rows: RobofestRegistration[],
  options: RobofestExportOptions = {},
) {
  const includePayments = options.includePayments !== false
  const XLSX = await import('xlsx')
  const exportData = rows.map((r, index) => {
    const row: Record<string, string | number> = {
      'No.': index + 1,
      'Registration ID': r.registrationId || '',
      'Team Number': r.teamNumber || '',
      'Team Name': r.name || '',
      Competition: r.category || '',
      Division: r.roundCity || '',
      Venue: venueLabel(r, options.content),
      'Age Category': ageLabel(r),
      'Team Size': r.teamSize ?? r.teamMembers?.length ?? '',
      'Contact Email': r.email || '',
      'Contact Phone': r.phone || '',
      'Contact School': r.school || '',
      'Campus Ambassador': r.campusAmbassadorName || '',
      'Ambassador School': r.campusAmbassadorSchool || '',
      Status: r.status || '',
      ...(includePayments
        ? {
            Payment: r.paymentStatus || '',
            'Amount Paid': r.amountPaid ?? '',
            'Trx ID': r.trxId || '',
          }
        : {}),
      'Created At': createdLabel(r),
      Notes: r.notes || '',
    }
    for (let i = 0; i < 4; i += 1) {
      const m = r.teamMembers?.[i]
      const n = i + 1
      row[`Member ${n} Name`] = m?.name || ''
      row[`Member ${n} Email`] = m?.email || ''
      row[`Member ${n} Phone`] = m?.phone || ''
      row[`Member ${n} School`] = m?.school || ''
      row[`Member ${n} Branch`] = m?.branch || ''
      row[`Member ${n} Grade`] = m?.grade || ''
    }
    return row
  })

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(exportData)
  ws['!cols'] = Object.keys(exportData[0] || { No: 1 }).map((key) => ({
    wch: Math.min(36, Math.max(12, key.length + 2)),
  }))
  XLSX.utils.book_append_sheet(wb, ws, 'Registrations')
  XLSX.writeFile(wb, `robofest-registrations-${dateStamp()}.xlsx`)
}

export async function exportRobofestPdf(
  rows: RobofestRegistration[],
  options: RobofestExportOptions = {},
) {
  const includePayments = options.includePayments !== false
  const division = options.division?.trim() || ''
  const venueLabel = options.venueLabel?.trim() || ''
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])
  const autoTable = autoTableModule.default
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const marginX = 24

  const navy: [number, number, number] = [15, 76, 129]
  const navyDeep: [number, number, number] = [8, 45, 78]
  const cyan: [number, number, number] = [14, 165, 233]
  const slate: [number, number, number] = [71, 85, 105]
  const ink: [number, number, number] = [15, 23, 42]
  const mist: [number, number, number] = [241, 245, 249]
  const soft: [number, number, number] = [248, 250, 252]

  const hasDivisionFilter = Boolean(division)
  const headerBand = hasDivisionFilter ? 88 : 78
  const logoDataUrl = await loadLogoDataUrl()

  const exportedAt = new Date().toLocaleString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  // Background wash on first page header area
  doc.setFillColor(...navyDeep)
  doc.rect(0, 0, pageWidth, headerBand, 'F')

  // Accent stripe
  doc.setFillColor(...cyan)
  doc.rect(0, 0, 6, headerBand, 'F')
  doc.setFillColor(...cyan)
  doc.rect(0, headerBand - 3, pageWidth, 3, 'F')

  // Soft highlight on right
  doc.setFillColor(...navy)
  doc.roundedRect(pageWidth - 210, 14, 186, headerBand - 28, 8, 8, 'F')

  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', marginX + 10, 18, 42, 42)
    } catch {
      // ignore
    }
  }

  const titleX = marginX + (logoDataUrl ? 62 : 14)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text(ROBOFEST_LOCAL.headline, titleX, 36)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(186, 220, 245)
  doc.text('Registrations Export  ·  Robonauts Ltd', titleX, 54)

  // Right info card
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(125, 211, 252)
  doc.text('LOCAL ROUND', pageWidth - 198, 32)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(226, 232, 240)
  doc.text(`${rows.length} team${rows.length === 1 ? '' : 's'}`, pageWidth - 198, 46)
  doc.text(exportedAt, pageWidth - 198, 58)

  if (hasDivisionFilter) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(255, 255, 255)
    const divisionLine = venueLabel
      ? `Division: ${division}  ·  Venue: ${venueLabel}`
      : `Division: ${division}`
    doc.text(divisionLine, titleX, 72, {
      maxWidth: pageWidth - titleX - 230,
    })
  }

  // Meta chips
  const metaY = headerBand + 16
  const chipH = 22
  const chips: string[] = [
    `${rows.length} registration${rows.length === 1 ? '' : 's'}`,
  ]
  if (hasDivisionFilter) chips.push(`Division · ${division}`)
  if (hasDivisionFilter && venueLabel) chips.push(`Venue · ${venueLabel}`)

  let chipX = marginX
  for (const label of chips) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    const w = doc.getTextWidth(label) + 18
    doc.setFillColor(...soft)
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.6)
    doc.roundedRect(chipX, metaY - 12, w, chipH, 11, 11, 'FD')
    doc.setTextColor(...navy)
    doc.text(label, chipX + 9, metaY + 2)
    chipX += w + 8
  }

  const showDivisionCol = !hasDivisionFilter
  const head = [
    'No.',
    'Team #',
    'Competition',
    ...(showDivisionCol ? (['Division'] as const) : []),
    'Age',
    'Members',
    'Ambassador',
    'Status',
    ...(includePayments ? (['Payment'] as const) : []),
  ]

  const body = rows.map((r, index) => {
    const cells: string[] = [
      String(index + 1),
      r.name || '',
      r.category || '',
      r.roundCity || '',
      venueLabel(r, options.content) || '—',
      ageLabel(r) || '—',
      membersLabel(r),
      r.campusAmbassadorName
        ? `${r.campusAmbassadorName}${
            r.campusAmbassadorSchool ? `\n${r.campusAmbassadorSchool}` : ''
          }`
        : '—',
      (r.status || '—').toUpperCase(),
    )
    if (includePayments) cells.push(r.paymentStatus || '—')
    return cells
  })

  const statusCol = showDivisionCol ? 7 : 6
  const paymentCol = includePayments ? statusCol + 1 : -1

  autoTable(doc, {
    startY: 92,
    head: [
      [
        'No.',
        'Team',
        'Competition',
        'Division',
        'Venue',
        'Age',
        'Team members',
        'Status',
        ...(includePayments ? (['Payment'] as const) : []),
      ],
    ],
    body,
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: { top: 6, right: 5, bottom: 6, left: 5 },
      overflow: 'linebreak',
      valign: 'top',
      textColor: ink,
      lineColor: [226, 232, 240],
      lineWidth: 0.35,
      minCellHeight: 22,
    },
    headStyles: {
      fillColor: navy,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: { top: 7, right: 5, bottom: 7, left: 5 },
      valign: 'middle',
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
    },
    alternateRowStyles: {
      fillColor: mist,
    },
    columnStyles: showDivisionCol
      ? {
          0: { cellWidth: 28, halign: 'center', valign: 'middle' },
          1: { cellWidth: 54, fontStyle: 'bold' },
          2: { cellWidth: 88 },
          3: { cellWidth: 62 },
          4: { cellWidth: 62 },
          5: { cellWidth: 'auto' },
          6: { cellWidth: 90 },
          7: { cellWidth: 62, fontStyle: 'bold', halign: 'center' },
          ...(includePayments
            ? { 8: { cellWidth: 58, halign: 'center', valign: 'middle' } }
            : {}),
        }
      : {
          0: { cellWidth: 30, halign: 'center', valign: 'middle' },
          1: { cellWidth: 58, fontStyle: 'bold' },
          2: { cellWidth: 100 },
          3: { cellWidth: 70 },
          4: { cellWidth: 'auto' },
          5: { cellWidth: 100 },
          6: { cellWidth: 66, fontStyle: 'bold', halign: 'center' },
          ...(includePayments
            ? { 7: { cellWidth: 62, halign: 'center', valign: 'middle' } }
            : {}),
        },
    margin: { left: marginX, right: marginX, bottom: 40 },
    didParseCell: (data) => {
      if (data.section !== 'body') return
      if (data.column.index === statusCol) {
        const value = String(data.cell.raw || '').toLowerCase()
        if (value === 'confirmed') data.cell.styles.textColor = [21, 128, 61]
        else if (value === 'cancelled') data.cell.styles.textColor = [185, 28, 28]
        else if (value === 'pending') data.cell.styles.textColor = [180, 83, 9]
      }
      if (data.column.index === paymentCol) {
        const value = String(data.cell.raw || '').toLowerCase()
        if (value === 'paid') data.cell.styles.textColor = [21, 128, 61]
        else if (value === 'unpaid' || value === 'pending') {
          data.cell.styles.textColor = [180, 83, 9]
        }
      }
    },
  })

  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i)
    // Footer bar
    doc.setFillColor(...soft)
    doc.rect(0, pageHeight - 28, pageWidth, 28, 'F')
    doc.setFillColor(...cyan)
    doc.rect(0, pageHeight - 28, pageWidth, 2, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...slate)
    doc.text(
      `${ROBOFEST_LOCAL.headline}  ·  Robonauts Ltd  ·  Confidential`,
      marginX,
      pageHeight - 12,
    )
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...navy)
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - marginX, pageHeight - 12, {
      align: 'right',
    })
  }

  doc.save(`robofest-bangladesh-2026-${dateStamp()}.pdf`)
}
