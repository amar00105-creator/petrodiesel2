/**
 * Shared Print Preview Utility
 * Opens A4-formatted print preview in a new window with consistent branding.
 * 
 * @param {Object} options
 * @param {string} options.title - Report title (Arabic)
 * @param {string} options.subtitle - Subtitle/date text
 * @param {string} options.content - HTML content (table, etc.)
 * @param {string} [options.extraStyles] - Additional CSS
 * @param {boolean} [options.landscape] - Use landscape orientation (297mm x 210mm)
 */
export function openPrintPreview({ title, subtitle, content, extraStyles = '', landscape = false }) {
    const baseUrl = window.BASE_URL || '';
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('الرجاء السماح بالنوافذ المنبثقة لعرض المعاينة');
        return;
    }

    const pageWidth = landscape ? '297mm' : '210mm';
    const pageHeight = landscape ? '210mm' : '297mm';
    const bgImage = landscape ? 'background-landscape.png' : 'background.png';
    const pageSize = landscape ? 'A4 landscape' : 'A4';

    printWindow.document.write(`
        <html dir="rtl" lang="ar">
        <head>
            <title>${title}</title>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet">
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { 
                    font-family: 'Cairo', sans-serif; 
                    background: #f0f0f0; 
                    padding: 20px;
                    display: flex;
                    justify-content: center;
                }
                .a4-page {
                    width: ${pageWidth};
                    min-height: ${pageHeight};
                    background: white url('${baseUrl}/img/${bgImage}') no-repeat center center;
                    background-size: cover;
                    padding: 8mm 15mm 15mm 15mm;
                    box-shadow: 0 0 20px rgba(0,0,0,0.15);
                    position: relative;
                }
                .report-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 3px solid #374151;
                    padding-bottom: 15px;
                    margin-bottom: 20px;
                }
                .logo-section img {
                    height: 60px;
                    width: auto;
                }
                .title-section {
                    text-align: center;
                    flex: 1;
                }
                .title-section h1 {
                    font-size: 20px;
                    font-weight: 900;
                    color: #1f2937;
                    margin-bottom: 5px;
                }
                .title-section p {
                    font-size: 14px;
                    color: #6b7280;
                }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                th, td { border: 1px solid #333; padding: 8px; text-align: center; font-size: 11px; }
                th { background: #374151; color: white; font-weight: bold; }
                tfoot td { font-weight: bold; }
                tr:nth-child(even) { background: rgba(0,0,0,0.02); }
                .text-right { text-align: right; }
                .text-left { text-align: left; }
                .text-green { color: #059669; }
                .text-red { color: #dc2626; }
                .text-blue { color: #2563eb; }
                .bg-yellow { background: #fefce8; }
                .bg-gray { background: #f3f4f6; }
                .font-bold { font-weight: bold; }
                .print\\:hidden { display: none !important; }
                ${extraStyles}
                @media print {
                    @page { size: ${pageSize}; margin: 10mm; }
                    body { background: white; padding: 0; }
                    .a4-page { box-shadow: none; padding: 10mm; }
                }
            </style>
        </head>
        <body>
            <div class="a4-page">
                <div class="report-header">
                    <div class="logo-section">
                        <img src="${baseUrl}/img/logo.png" alt="Petro Diesel" />
                    </div>
                    <div class="title-section">
                        <h1>${title}</h1>
                        <p>${subtitle}</p>
                    </div>
                    <div class="logo-section" style="visibility: hidden;">
                        <img src="${baseUrl}/img/logo.png" alt="" />
                    </div>
                </div>
                ${content}
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
}

/**
 * Helper: Extract HTML from a DOM element by selector and strip Tailwind classes
 * for clean print output, while preserving table structure.
 * 
 * @param {string} selector - CSS selector to extract content from
 * @returns {string} - Clean HTML content
 */
export function extractTableHTML(selector) {
    const el = document.querySelector(selector);
    if (!el) return '<p style="text-align:center;padding:40px;color:#999;">لا توجد بيانات للعرض</p>';
    
    // Clone and clean up for print
    const clone = el.cloneNode(true);
    
    // Remove any elements marked as print:hidden
    clone.querySelectorAll('[class*="print:hidden"], [class*="print\\:hidden"]').forEach(e => e.remove());
    
    // Remove buttons and interactive elements
    clone.querySelectorAll('button, input, select, .animate-spin').forEach(e => e.remove());
    
    return clone.innerHTML;
}

/**
 * Helper: Format a date in Arabic locale
 * @param {string} dateStr - Date string (YYYY-MM-DD)
 * @returns {string} - Formatted Arabic date
 */
export function formatDateArabic(dateStr) {
    return new Date(dateStr).toLocaleDateString('ar-EG', { 
        year: 'numeric', month: 'long', day: 'numeric' 
    });
}

/**
 * Helper: Build a simple HTML table from array data
 * @param {string[]} headers - Array of header labels
 * @param {string[][]} rows - 2D array of row data
 * @param {Object} [options] - Optional: { footerRow: string[], highlightCol: number }
 * @returns {string} - HTML table string
 */
export function buildPrintTable(headers, rows, options = {}) {
    const { footerRow, highlightCol } = options;
    
    let html = '<table>';
    
    // Header
    html += '<thead><tr>';
    headers.forEach((h, i) => {
        const style = i === highlightCol ? ' style="background:#2563eb;"' : '';
        html += `<th${style}>${h}</th>`;
    });
    html += '</tr></thead>';
    
    // Body
    html += '<tbody>';
    if (rows.length === 0) {
        html += `<tr><td colspan="${headers.length}" style="padding:30px;color:#999;text-align:center;">لا توجد بيانات</td></tr>`;
    } else {
        rows.forEach(row => {
            html += '<tr>';
            row.forEach((cell, i) => {
                const style = i === highlightCol ? ' style="background:rgba(37,99,235,0.05);"' : '';
                html += `<td${style}>${cell ?? '-'}</td>`;
            });
            html += '</tr>';
        });
    }
    html += '</tbody>';
    
    // Footer
    if (footerRow) {
        html += '<tfoot><tr>';
        footerRow.forEach((cell, i) => {
            html += `<td>${cell}</td>`;
        });
        html += '</tr></tfoot>';
    }
    
    html += '</table>';
    return html;
}
