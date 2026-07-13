const fs = require('fs');
const file = 'src/components/dashboard/CashFlowChart.tsx';
let code = fs.readFileSync(file, 'utf8');

// State hook
code = code.replace(/useState\<'paid'\|'retainer'\|'renewals'\|'hours'\|null\>/g, "useState<'paid'|'retainer'|'hours'|null>");

// months initialization
code = code.replace(/renewals: 0,\s*renewalItems: \[\] as TooltipItem\[\],/g, "");

// aggregate services block
code = code.replace(/\/\/ Aggregate services renewals[\s\S]*?\/\/ Aggregate company hours/g, "// Aggregate company hours");

// maxAmount and total values
code = code.replace(/m\.paid \+ m\.retainer \+ m\.renewals \+ m\.hoursBilled/g, "m.paid + m.retainer + m.hoursBilled");

// yearlyTotals logic
code = code.replace(/renewals: acc\.renewals \+ m\.renewals,/g, "");
code = code.replace(/paid: 0, retainer: 0, renewals: 0, hoursBilled: 0, total: 0/g, "paid: 0, retainer: 0, hoursBilled: 0, total: 0");

// yearlyTotals UI box
code = code.replace(/<div style=\{\{ display: 'flex', flexDirection: 'column' \}\}>\s*<span style=\{\{ fontSize: '11px', opacity: 0\.6, textTransform: 'uppercase', letterSpacing: '0\.5px' \}\}>Scadenze<\/span>\s*<span style=\{\{ fontSize: '16px', fontWeight: 600, color: '#a855f7' \}\}>\{formatter\.format\(yearlyTotals\.renewals\)}<\/span>\s*<\/div>/g, "");

// Height calculation
code = code.replace(/const renewalsHeight = \(m\.renewals \/ maxAmount\) \* 100\n/g, "");

// Tooltip block
code = code.replace(/\{m\.renewals > 0 && \(\s*<div style=\{\{ display: 'flex', flexDirection: 'column', gap: '4px' \}\}>\s*<div style=\{\{ display: 'flex', justifyContent: 'space-between' \}\}>\s*<span style=\{\{ opacity: 0\.8, fontWeight: 600 \}\}>Scadenze:<\/span>\s*<span style=\{\{ fontWeight: 700, color: '#a855f7' \}\}>\{formatter\.format\(m\.renewals\)}<\/span>\s*<\/div>\s*\{m\.renewalItems\.length > 0 && \([\s\S]*?\}\s*\)\}\s*<\/div>\s*\)\}/g, "");

// All 0 check
code = code.replace(/m\.renewals === 0 && /g, "");

// Bar block
code = code.replace(/\{\/\* Renewals Bar \*\/\}\s*\{renewalsHeight > 0 && \([\s\S]*?<\/div>\s*\)\}/g, "");

// Border radius logic
code = code.replace(/renewalsHeight === 0/g, "false");

// Legend block
code = code.replace(/<div style=\{\{ display: 'flex', alignItems: 'center', gap: '6px' \}\}>\s*<div style=\{\{ width: '14px', height: '14px', background: 'rgba\(168, 85, 247, 0\.8\)', borderRadius: '3px' \}\}><\/div>\s*<span style=\{\{ fontWeight: 500 \}\}>Scadenze \/ Rinnovi<\/span>\s*<\/div>/g, "");

// Analisi andamento row
code = code.replace(/<tr>\s*<td style=\{\{ textAlign: 'left', padding: '0\.5rem', color: 'var\(--color-text-muted\)' \}\}>Rinnovi \(Scadenze\)<\/td>[\s\S]*?<\/tr>/g, "");

fs.writeFileSync(file, code);
