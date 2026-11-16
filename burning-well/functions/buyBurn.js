// Burning Well V2 - Admin-managed Buy and Burn Tracker
const GWAR_MINT = 'Fczgz91jYK6HEQmRhBhUBtAaBabLnyi8RtujacN3pump';
const BUY_BURN_WALLET = '5BjAensFsUaQwakE7vuPDbsDdQLR61qBubeqeqJMvwWM';
const BASE58 = /^[1-9A-HJ-NP-Za-km-z]+$/;
function isValidSignature(signature) {
  if (typeof signature !== 'string' || signature.length < 64 || signature.length > 88 || !BASE58.test(signature)) return false;
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let value = 0n;
  for (const char of signature) value = value * 58n + BigInt(alphabet.indexOf(char));
  let bytes = 0;
  while (value > 0n) { bytes++; value >>= 8n; }
  for (const char of signature) { if (char !== '1') break; bytes++; }
  return bytes === 64;
}
function solscanUrl(signature) {
  if (!isValidSignature(signature)) throw new Error('Invalid transaction signature');
  return 'https://solscan.io/tx/' + signature;
}
module.exports = { GWAR_MINT, BUY_BURN_WALLET, isValidSignature, solscanUrl };
