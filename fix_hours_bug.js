const fs = require('fs');
const file = 'src/components/dashboard/CashFlowChart.tsx';
let code = fs.readFileSync(file, 'utf8');

// Fix hours bug
code = code.replace(/if \(h\.companies\?\.hourly_rate\) \{/g, "if (h.projects?.hourly_rate) {");
code = code.replace(/const cost = \(h\.minutes \/ 60\) \* h\.companies\.hourly_rate/g, "const cost = (h.minutes / 60) * h.projects.hourly_rate");
code = code.replace(/const clientName = h\.companies\?\.name \? h\.companies\.name : 'Cliente'/g, "const clientName = h.projects?.companies?.name ? h.projects.companies.name : 'Cliente'");
code = code.replace(/const projName = h\.projects\?\.name \? \` \(\$\{h\.projects\.name\}\)\` : ''/g, "const projName = h.projects?.title ? ` (${h.projects.title})` : ''");

fs.writeFileSync(file, code);
