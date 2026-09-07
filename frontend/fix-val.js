const fs = require('fs');
let code = fs.readFileSync('src/app/transaction/new/TransactionForm.tsx', 'utf8');

const target = `      if (!fundingDebtContact) newErrors.push("Kailangan ang pangalan kung kanino nanghiram pampuno")
    }`;

code = code.replace(target, '');
fs.writeFileSync('src/app/transaction/new/TransactionForm.tsx', code);
console.log('Fixed validate block');
