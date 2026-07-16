const fs = require('fs');

function updateChart(filename, isCashFlow) {
  let content = fs.readFileSync(filename, 'utf-8');

  // Update Invoice interface
  content = content.replace(/invoice_number\?: string/, "invoice_number?: string\n  project_id?: string");

  // Replace invoice aggregation logic
  const oldAggRegex = /\/\/ Aggregate data[^\n]*\n\s*invoices\.forEach\(inv => \{[\s\S]*?\}\)/;
  
  let newAgg = `// Aggregate data
  invoices.forEach(inv => {
    ${isCashFlow ? "if (inv.status !== 'paid') return; // Solo incassato" : ""}
    const targetDateStr = inv.paid_date || inv.issue_date
    if (!targetDateStr) return
    
    const d = new Date(targetDateStr)
    const mIndex = months.findIndex(m => m.year === d.getFullYear() && m.month === d.getMonth())
    
    if (mIndex !== -1) {
      const proj = projects?.find(p => p.id === inv.project_id)
      const projName = proj?.title || proj?.name || 'Progetto Generico'
      const labelName = inv.invoice_number ? \`Fatt. \${inv.invoice_number} - \${projName}\` : \`Fatt. \${projName}\`

      let isHours = companyHours?.some(h => h.invoice_id === inv.id)
      let type = 'projects'
      if (isHours) type = 'hours'
      else if (proj?.billing_type === 'retainer_monthly' || proj?.billing_type === 'retainer_yearly') type = 'retainer'

      if (inv.status === 'paid') {
        ${isCashFlow ? `
        if (type === 'retainer') months[mIndex].paidRetainer += Number(inv.amount)
        else if (type === 'hours') months[mIndex].paidHours += Number(inv.amount)
        else months[mIndex].paidProjects += Number(inv.amount)
        months[mIndex].paid += Number(inv.amount) // Keep total
        ` : `months[mIndex].paid += Number(inv.amount)`}
        months[mIndex].paidItems.push({
          name: labelName,
          amount: Number(inv.amount)
        })
      } else {
        ${!isCashFlow ? `
        months[mIndex].expected += Number(inv.amount)
        months[mIndex].expectedItems.push({
          name: labelName + ' (Da Incassare)',
          amount: Number(inv.amount)
        })` : ''}
      }
    }
  })`;

  content = content.replace(oldAggRegex, newAgg);

  if (isCashFlow) {
    // Add new fields to months map
    content = content.replace(/paid: 0,/, "paid: 0, paidRetainer: 0, paidHours: 0, paidProjects: 0,");

    // Replace the single paid bar with stacked bars
    const oldBarRegex = /{\/\* Paid Bar \*\/}[\s\S]*?\/>/;
    const newBar = `
                {/* Paid Projects Bar */}
                <div style={{ width: '35px', height: \`\${(m.paidProjects / maxAmount) * 100}%\`, background: 'var(--color-primary)', borderTopLeftRadius: m.paidHours === 0 && m.paidRetainer === 0 ? '4px' : '0', borderTopRightRadius: m.paidHours === 0 && m.paidRetainer === 0 ? '4px' : '0', transition: 'height 0.3s ease, opacity 0.2s', opacity: hoveredMonthIdx !== null && hoveredMonthIdx !== i ? 0.4 : 1 }} />
                {/* Paid Hours Bar */}
                <div style={{ width: '35px', height: \`\${(m.paidHours / maxAmount) * 100}%\`, background: 'var(--color-warning)', borderTopLeftRadius: m.paidRetainer === 0 ? '4px' : '0', borderTopRightRadius: m.paidRetainer === 0 ? '4px' : '0', transition: 'height 0.3s ease, opacity 0.2s', opacity: hoveredMonthIdx !== null && hoveredMonthIdx !== i ? 0.4 : 1 }} />
                {/* Paid Retainer Bar */}
                <div style={{ width: '35px', height: \`\${(m.paidRetainer / maxAmount) * 100}%\`, background: 'var(--color-success)', borderTopLeftRadius: '4px', borderTopRightRadius: '4px', transition: 'height 0.3s ease, opacity 0.2s', opacity: hoveredMonthIdx !== null && hoveredMonthIdx !== i ? 0.4 : 1 }} />
    `;
    content = content.replace(oldBarRegex, newBar);

    // Update legend
    const oldLegendRegex = /<span style={{ fontWeight: 500 }}>Incassato<\/span>\n\s*<\/div>/;
    const newLegend = `<span style={{ fontWeight: 500 }}>Progetti One-off</span>
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
             <div style={{ width: '14px', height: '14px', background: 'var(--color-warning)', borderRadius: '3px' }}></div>
             <span style={{ fontWeight: 500 }}>Ore Consuntivate</span>
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
             <div style={{ width: '14px', height: '14px', background: 'var(--color-success)', borderRadius: '3px' }}></div>
             <span style={{ fontWeight: 500 }}>Canoni Mensili/Annuali</span>
           </div>`;
    content = content.replace(oldLegendRegex, newLegend);
  }

  fs.writeFileSync(filename, content);
}

updateChart('src/components/dashboard/CashFlowChart.tsx', true);
updateChart('src/components/dashboard/ActivityChart.tsx', false);
