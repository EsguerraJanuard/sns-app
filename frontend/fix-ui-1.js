const fs = require('fs');
let code = fs.readFileSync('src/actions/transaction.ts', 'utf8');

const attachFn = `
async function attachFundingInfo(primaryTxs: any[]) {
  if (!primaryTxs || primaryTxs.length === 0) return primaryTxs;

  const groupIds = primaryTxs.map(tx => tx.transfer_group_id).filter(Boolean);
  const txIds = primaryTxs.map(tx => tx.id);

  let fundingQuery = supabase
    .from('transactions')
    .select('id, transfer_group_id, amount')
    .eq('status', 'active')
    .eq('note', 'Funded transaction');
  
  if (groupIds.length > 0) {
    fundingQuery = fundingQuery.or(\`transfer_group_id.in.(\${groupIds.join(',')}),transfer_group_id.in.(\${txIds.join(',')})\`);
  } else if (txIds.length > 0) {
    fundingQuery = fundingQuery.in('transfer_group_id', txIds);
  } else {
    return primaryTxs;
  }

  const { data: fundingTxs } = await fundingQuery;

  if (fundingTxs && fundingTxs.length > 0) {
    return primaryTxs.map(tx => {
      if (tx.kind === 'TRANSFER' && tx.direction !== 'IN') {
        return tx;
      }
      const relatedFunding = fundingTxs.filter(f => f.transfer_group_id === tx.transfer_group_id || f.transfer_group_id === tx.id);
      if (relatedFunding.length > 0) {
        return {
          ...tx,
          fundingCount: relatedFunding.length,
          fundingTotal: relatedFunding.reduce((sum, f) => sum + f.amount, 0)
        };
      }
      return tx;
    });
  }

  return primaryTxs;
}

export async function getRecentTransactions`;

if (!code.includes('attachFundingInfo')) {
    code = code.replace("export async function getRecentTransactions", attachFn);
    
    // Fix getRecentTransactions
    code = code.replace(
      /export async function getRecentTransactions([\s\S]*?)\.eq\('status', 'active'\)([\s\S]*?)return data/m,
      "export async function getRecentTransactions$1.eq('status', 'active')\n    .or('note.neq.Funded transaction,note.is.null')$2return await attachFundingInfo(data)"
    );
    
    // Fix searchTransactions
    code = code.replace(
      /export async function searchTransactions([\s\S]*?)\.eq\('status', 'active'\)([\s\S]*?)return data/m,
      "export async function searchTransactions$1.eq('status', 'active')\n      .or('note.neq.Funded transaction,note.is.null')$2return await attachFundingInfo(data)"
    );

    fs.writeFileSync('src/actions/transaction.ts', code);
    console.log('Fixed transaction getters');
}
