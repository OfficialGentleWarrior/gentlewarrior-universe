// Burning Well V2 - Admin-managed Buy and Burn records
const { isValidSignature, BUY_BURN_WALLET, GWAR_MINT } = require('./buyBurn');
function positiveInteger(value) {
  return typeof value === 'string' && /^[0-9]+$/.test(value) && BigInt(value) > 0n;
}
async function saveCompletedBuyBurn(db, input, allocationLamports) {
  if (!db || typeof db.runTransaction !== 'function') throw new Error('Firestore required');
  if (!input || !isValidSignature(input.purchaseSignature) || !isValidSignature(input.burnSignature) || input.purchaseSignature === input.burnSignature) throw new Error('Invalid transaction signatures');
  if (!positiveInteger(input.solSpentLamports) || !(typeof input.gwarBurned === 'string' && /^(?:0|[1-9][0-9]*)(?:\.[0-9]{1,9})?$/.test(input.gwarBurned) && /[1-9]/.test(input.gwarBurned))) throw new Error('Invalid Buy and Burn amounts');
  if (typeof allocationLamports !== 'string' || !/^[0-9]+$/.test(allocationLamports)) throw new Error('Invalid allocation');
  const id = input.purchaseSignature;
  const budgetRef = db.collection('buy_burn_settings').doc('budget');
  const batchRef = db.collection('buy_burn_batches').doc(id);
  const purchaseRef = db.collection('buy_burn_transactions').doc(input.purchaseSignature);
  const burnRef = db.collection('buy_burn_transactions').doc(input.burnSignature);
  const record = { batchId:id, purchaseSignature:input.purchaseSignature, burnSignature:input.burnSignature, solSpentLamports:input.solSpentLamports, gwarBurned:input.gwarBurned, wallet:BUY_BURN_WALLET, mint:GWAR_MINT, status:'completed', verification:'admin_reported', createdAt:new Date().toISOString() };
  await db.runTransaction(async tx => {
    const budgetSnap = await tx.get(budgetRef);
    const existingBatch = await tx.get(batchRef);
    const existingPurchase = await tx.get(purchaseRef);
    const existingBurn = await tx.get(burnRef);
    if (existingBatch.exists || existingPurchase.exists || existingBurn.exists) throw new Error('BUY_BURN_DUPLICATE');
    const spent = BigInt(budgetSnap.exists ? budgetSnap.data().spentLamports : '0');
    const nextSpent = spent + BigInt(input.solSpentLamports);
    if (nextSpent > BigInt(allocationLamports)) throw new Error('BUY_BURN_BUDGET_EXCEEDED');
    tx.set(budgetRef,{spentLamports:nextSpent.toString()});
    tx.set(batchRef,record);
    tx.set(purchaseRef,{batchId:id,type:'purchase'});
    tx.set(burnRef,{batchId:id,type:'burn'});
  });
  return {ok:true,batchId:id};
}
module.exports = {saveCompletedBuyBurn};
