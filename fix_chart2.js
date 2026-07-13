const fs = require('fs');
const file = 'src/components/dashboard/CashFlowChart.tsx';
let code = fs.readFileSync(file, 'utf8');

// The initial month setup
code = code.replace(/\s*renewals: 0,\s*renewalItems: \[\] as TooltipItem\[\],/g, "");

// The rendering of the Yearly Totals renewals value
code = code.replace(/<span style=\{\{ fontSize: '16px', fontWeight: 600, color: '#a855f7' \}\}>\{formatter\.format\(yearlyTotals\.renewals\)}<\/span>/g, "");

// The tooltip block that shows renewals
code = code.replace(/\{m\.renewals > 0 && \([\s\S]*?\}\s*\)\}/g, "");
// And also check for (m.paid === 0 && m.retainer === 0 && m.renewals === 0 && m.hoursBilled === 0)
code = code.replace(/m\.renewals === 0 && /g, "");

fs.writeFileSync(file, code);
