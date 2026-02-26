import { Sheet } from "./types";

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(amount);
};

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const exportToCSV = (sheet: Sheet) => {
  const bom = "\uFEFF"; // Byte Order Mark for Arabic support in Excel
  const totalSpent = sheet.lines.reduce((sum, line) => sum + line.amount + (line.bank_fees || 0), 0);
  const remaining = sheet.custody_amount - totalSpent;

  // Header Summary
  let csvContent = `رقم العهدة,مبلغ العهدة,الإجمالي المنصرف,المتبقي\n`;
  csvContent += `${sheet.custody_number},${sheet.custody_amount},${totalSpent},${remaining}\n\n`;

  // Table Headers
  csvContent += `التاريخ,الشركة,الرقم الضريبي,رقم الفاتورة,البيان,سبب الصرف,المبلغ,مصروفات بنكية,الإجمالي,اسم المشتري,ملاحظات\n`;

  // Rows
  sheet.lines.forEach(line => {
    const lineTotal = line.amount + (line.bank_fees || 0);
    const row = [
      line.date,
      `"${line.company.replace(/"/g, '""')}"`, // Escape quotes
      `"${(line.tax_number || '').replace(/"/g, '""')}"`,
      `"${(line.invoice_number || '').replace(/"/g, '""')}"`,
      `"${line.description.replace(/"/g, '""')}"`,
      line.reason,
      line.amount,
      line.bank_fees || 0,
      lineTotal,
      `"${(line.buyer_name || '').replace(/"/g, '""')}"`,
      `"${(line.notes || '').replace(/"/g, '""')}"`
    ].join(",");
    csvContent += row + "\n";
  });

  const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `custody_sheet_${sheet.custody_number}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};