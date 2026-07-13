const fs = require('fs');
const file = 'src/components/dashboard/CashFlowChart.tsx';
let code = fs.readFileSync(file, 'utf8');

// Inside months.map((m, i) => { ...
// We need to add: const isFuture = m.year > currentYear || (m.year === currentYear && m.month > new Date().getMonth())
// But currentYear is selectedYear here.
// Let's use the actual current date for checking if it's future.

code = code.replace(
  /const paidHeight = \(m\.paid \/ maxAmount\) \* 100/,
  `const isFuture = m.year > new Date().getFullYear() || (m.year === new Date().getFullYear() && m.month > new Date().getMonth())\n            const paidHeight = (m.paid / maxAmount) * 100`
);

// Retainer bar
code = code.replace(
  /background: 'rgba\(16, 185, 129, 0\.6\)',\s*borderBottom: 'none',/g,
  `background: isFuture ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.6)',
                      border: isFuture ? '2px dashed rgba(16, 185, 129, 0.5)' : 'none',
                      borderBottom: 'none',`
);

// Hours Billed bar (could also be future if somehow predicted?)
// Unlikely, but just in case
code = code.replace(
  /background: 'rgba\(59, 130, 246, 0\.6\)',\s*borderBottom: 'none',/g,
  `background: isFuture ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.6)',
                      border: isFuture ? '2px dashed rgba(59, 130, 246, 0.5)' : 'none',
                      borderBottom: 'none',`
);

fs.writeFileSync(file, code);
