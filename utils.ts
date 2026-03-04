import { Sheet, ExpenseReason } from "./types";
import ExcelJS from "exceljs";

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(amount);
};

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Color map for each expense reason (hex without #)
const REASON_EXCEL_COLORS: Record<ExpenseReason, { bg: string; font: string }> = {
  [ExpenseReason.PROJECTS]: { bg: 'DBEAFE', font: '1D4ED8' },
  [ExpenseReason.ADMINISTRATION]: { bg: 'F3E8FF', font: '7C3AED' },
  [ExpenseReason.BRANCHES]: { bg: 'CCFBF1', font: '0F766E' },
  [ExpenseReason.LOGISTICS]: { bg: 'FFEDD5', font: 'C2410C' },
  [ExpenseReason.MOVEMENT]: { bg: 'E0E7FF', font: '4338CA' },
  [ExpenseReason.SERVICES]: { bg: 'CFFAFE', font: '0E7490' },
  [ExpenseReason.WAREHOUSES]: { bg: 'FEF3C7', font: 'B45309' },
  [ExpenseReason.MISC]: { bg: 'F1F5F9', font: '475569' },
  [ExpenseReason.COMMUNICATION]: { bg: 'FAE8FF', font: 'A21CAF' },
  [ExpenseReason.FOOD]: { bg: 'FFE4E6', font: 'BE123C' },
  [ExpenseReason.ACCOMMODATION]: { bg: 'E0F2FE', font: '0369A1' },
  [ExpenseReason.TECHNICAL]: { bg: 'ECFCCB', font: '4D7C0F' },
  [ExpenseReason.OTHER]: { bg: 'F4F4F5', font: '52525B' },
};

export const exportToCSV = async (sheet: Sheet) => {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'نظام المصروفات';
  wb.created = new Date();

  const ws = wb.addWorksheet('تقرير العهدة', {
    properties: { defaultRowHeight: 22 },
    views: [{ rightToLeft: true }]
  });

  // ===== Column definitions =====
  ws.columns = [
    { header: '#', key: 'index', width: 6 },
    { header: 'التاريخ', key: 'date', width: 14 },
    { header: 'الجهة المستفيدة', key: 'company', width: 28 },
    { header: 'الرقم الضريبي', key: 'tax_number', width: 18 },
    { header: 'رقم الفاتورة', key: 'invoice_number', width: 16 },
    { header: 'البيان', key: 'description', width: 35 },
    { header: 'التصنيف', key: 'reason', width: 26 },
    { header: 'المبلغ', key: 'amount', width: 14 },
    { header: 'رسوم بنكية', key: 'bank_fees', width: 12 },
    { header: 'الإجمالي', key: 'total', width: 14 },
    { header: 'المشتري', key: 'buyer_name', width: 18 },
    { header: 'ملاحظات', key: 'notes', width: 30 },
  ];

  // ===== Title Row (merged) =====
  ws.insertRow(1, []);
  ws.mergeCells('A1:L1');
  const titleCell = ws.getCell('A1');
  titleCell.value = `تقرير عهدة: ${sheet.custody_number}`;
  titleCell.font = { name: 'Tajawal', size: 18, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 40;

  // ===== Summary Row =====
  const totalSpent = sheet.lines.reduce((sum, line) => sum + line.amount + (line.bank_fees || 0), 0);
  const remaining = sheet.custody_amount - totalSpent;

  ws.insertRow(2, []);
  ws.mergeCells('A2:C2');
  ws.mergeCells('D2:F2');
  ws.mergeCells('G2:I2');
  ws.mergeCells('J2:L2');

  const summaryStyle = (cell: ExcelJS.Cell, label: string, value: string, bgColor: string, fontColor: string) => {
    cell.value = `${label}: ${value}`;
    cell.font = { name: 'Tajawal', size: 11, bold: true, color: { argb: fontColor } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  };

  summaryStyle(ws.getCell('A2'), 'رقم العهدة', sheet.custody_number, 'FFF1F5F9', 'FF334155');
  summaryStyle(ws.getCell('D2'), 'مبلغ العهدة', formatCurrency(sheet.custody_amount), 'FFF1F5F9', 'FF334155');
  summaryStyle(ws.getCell('G2'), 'المنصرف', formatCurrency(totalSpent), 'FFFFF7ED', 'FFC2410C');
  const remColor = remaining < 0 ? 'FFFFF1F2' : 'FFF0FDF4';
  const remFont = remaining < 0 ? 'FFBE123C' : 'FF166534';
  summaryStyle(ws.getCell('J2'), 'المتبقي', formatCurrency(remaining), remColor, remFont);
  ws.getRow(2).height = 30;

  // ===== Empty spacer row =====
  ws.insertRow(3, []);
  ws.getRow(3).height = 8;

  // ===== Table Header (row 4) =====
  const headerRow = ws.getRow(4);
  headerRow.values = ['#', 'التاريخ', 'الجهة المستفيدة', 'الرقم الضريبي', 'رقم الفاتورة', 'البيان', 'التصنيف', 'المبلغ', 'رسوم بنكية', 'الإجمالي', 'المشتري', 'ملاحظات'];
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Tajawal', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      bottom: { style: 'medium', color: { argb: 'FF1D4ED8' } },
    };
  });

  // ===== Data Rows =====
  sheet.lines.forEach((line, idx) => {
    const lineTotal = line.amount + (line.bank_fees || 0);
    const rowNum = idx + 5;
    const row = ws.getRow(rowNum);

    row.values = [
      idx + 1,
      line.date,
      line.company,
      line.tax_number || '',
      line.invoice_number || '',
      line.description,
      line.reason,
      line.amount,
      line.bank_fees || 0,
      lineTotal,
      line.buyer_name || '',
      line.notes || ''
    ];

    row.height = 24;
    const isEven = idx % 2 === 0;
    const reasonColor = REASON_EXCEL_COLORS[line.reason] || REASON_EXCEL_COLORS[ExpenseReason.OTHER];

    row.eachCell((cell, colNumber) => {
      // Base styling
      cell.font = { name: 'Tajawal', size: 10, color: { argb: 'FF334155' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };

      // Alternating row background
      if (isEven) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFAFBFC' } };
      }

      // Reason column (7) - colored badge style
      if (colNumber === 7) {
        cell.font = { name: 'Tajawal', size: 10, bold: true, color: { argb: 'FF' + reasonColor.font } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + reasonColor.bg } };
      }

      // Amount columns (8, 9, 10) - right-aligned with mono font
      if (colNumber === 8 || colNumber === 9 || colNumber === 10) {
        cell.numFmt = '#,##0.00';
        cell.font = { name: 'Consolas', size: 10, color: { argb: colNumber === 10 ? 'FF2563EB' : 'FF334155' }, bold: colNumber === 10 };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }

      // Index column
      if (colNumber === 1) {
        cell.font = { name: 'Consolas', size: 9, color: { argb: 'FF94A3B8' } };
      }
    });
  });

  // ===== Totals Row =====
  const totalsRowNum = sheet.lines.length + 5;
  const totalsRow = ws.getRow(totalsRowNum);
  const grandTotal = sheet.lines.reduce((s, l) => s + l.amount + (l.bank_fees || 0), 0);
  const totalAmount = sheet.lines.reduce((s, l) => s + l.amount, 0);
  const totalFees = sheet.lines.reduce((s, l) => s + (l.bank_fees || 0), 0);

  totalsRow.values = ['', '', '', '', '', '', 'الإجمالي', totalAmount, totalFees, grandTotal, '', ''];
  totalsRow.height = 30;
  totalsRow.eachCell((cell, colNumber) => {
    cell.font = { name: 'Tajawal', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = { top: { style: 'medium', color: { argb: 'FF2563EB' } } };

    if (colNumber === 8 || colNumber === 9 || colNumber === 10) {
      cell.numFmt = '#,##0.00';
      cell.font = { name: 'Consolas', size: 12, bold: true, color: { argb: colNumber === 10 ? 'FF60A5FA' : 'FFFFFFFF' } };
    }
  });

  // ===== Department Breakdown Sheet =====
  const breakdownWs = wb.addWorksheet('ملخص الأقسام', {
    properties: { defaultRowHeight: 24 },
    views: [{ rightToLeft: true }]
  });

  breakdownWs.columns = [
    { header: 'القسم', key: 'dept', width: 30 },
    { header: 'عدد البنود', key: 'count', width: 14 },
    { header: 'الإجمالي', key: 'total', width: 18 },
    { header: 'النسبة', key: 'pct', width: 14 },
  ];

  // Title
  breakdownWs.insertRow(1, []);
  breakdownWs.mergeCells('A1:D1');
  const bdTitle = breakdownWs.getCell('A1');
  bdTitle.value = 'ملخص المصروفات حسب القسم';
  bdTitle.font = { name: 'Tajawal', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  bdTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
  bdTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  breakdownWs.getRow(1).height = 36;

  // Header row
  const bdHeaderRow = breakdownWs.getRow(2);
  bdHeaderRow.values = ['القسم', 'عدد البنود', 'الإجمالي', 'النسبة'];
  bdHeaderRow.height = 26;
  bdHeaderRow.eachCell((cell) => {
    cell.font = { name: 'Tajawal', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // Department data
  const breakdown: Record<string, { count: number; total: number }> = {};
  sheet.lines.forEach(line => {
    if (!breakdown[line.reason]) breakdown[line.reason] = { count: 0, total: 0 };
    breakdown[line.reason].count++;
    breakdown[line.reason].total += line.amount + (line.bank_fees || 0);
  });

  const sortedDepts = Object.entries(breakdown).sort(([, a], [, b]) => b.total - a.total);
  sortedDepts.forEach(([reason, data], idx) => {
    const rowNum = idx + 3;
    const row = breakdownWs.getRow(rowNum);
    const pct = grandTotal > 0 ? (data.total / grandTotal * 100) : 0;
    const color = REASON_EXCEL_COLORS[reason as ExpenseReason] || REASON_EXCEL_COLORS[ExpenseReason.OTHER];

    row.values = [reason, data.count, data.total, `${pct.toFixed(1)}%`];
    row.height = 26;
    row.eachCell((cell, colNumber) => {
      cell.font = { name: 'Tajawal', size: 10, color: { argb: 'FF334155' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };

      // Department name - colored
      if (colNumber === 1) {
        cell.font = { name: 'Tajawal', size: 11, bold: true, color: { argb: 'FF' + color.font } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + color.bg } };
      }
      if (colNumber === 3) {
        cell.numFmt = '#,##0.00';
        cell.font = { name: 'Consolas', size: 11, bold: true, color: { argb: 'FF2563EB' } };
      }
    });
  });

  // ===== Generate & Download =====
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `عهدة_${sheet.custody_number}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};