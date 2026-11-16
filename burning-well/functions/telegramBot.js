"use strict";
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const db = getFirestore();
const TELEGRAM_API = "https://api.telegram.org/bot";
async function telegramRequest(token, method, payload = {}) {
  const response = await fetch(TELEGRAM_API + token + "/" + method, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error("Telegram API request failed: " + method + " (" + response.status + "): " + String(result.description || "Unknown error"));
  return result.result;
}
async function sendTelegramMessage(token, chatId, message) {
  return telegramRequest(token, "sendMessage", {
    chat_id: chatId,
    text: message,
    disable_web_page_preview: true,
  });
}
async function isGroupAdmin(token, chatId, userId) {
  const member = await telegramRequest(token, "getChatMember", {
    chat_id: chatId,
    user_id: userId,
  });
  return member.status === "creator" || member.status === "administrator";
}
function isValidMint(mint) {
  return typeof mint === "string" && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(mint);
}

async function registerGroupToken(token, chatId, userId, mint) {
  if (!(await isGroupAdmin(token, chatId, userId))) {
    return sendTelegramMessage(token, chatId, 'Only group admins can register a token.');
  }
  if (!isValidMint(mint)) {
    return sendTelegramMessage(token, chatId, 'Invalid Solana mint address. Usage: /settoken MINT_ADDRESS');
  }
  await db.collection('telegram_groups').doc(String(chatId)).set({ mint, updatedBy: String(userId), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  return sendTelegramMessage(token, chatId, 'Token registered successfully! Mint: ' + mint);
}

async function showGroupToken(token, chatId) {
  const snap = await db.collection('telegram_groups').doc(String(chatId)).get();
  if (!snap.exists || !snap.data().mint) {
    return sendTelegramMessage(token, chatId, 'No token registered. Group admins can use /settoken MINT_ADDRESS');
  }
  return sendTelegramMessage(token, chatId, 'Registered token mint: ' + snap.data().mint);
}

async function showBotHelp(token, chatId) {
  const message = ['Burning Well - Official Telegram Bot','','Powered by GWAR Labs','','Commands:','/start - Welcome message','/help - Show instructions','/settoken MINT_ADDRESS - Register group token (admins only)','/token - View registered token','','This group receives verified Burning Well notifications for its registered token only.'].join(String.fromCharCode(10));
  return sendTelegramMessage(token, chatId, message);
}

async function handleTelegramWebhook(req, res, token, webhookSecret) {
  if (req.method !== 'POST') return res.sendStatus(405);
  if (!webhookSecret || req.get('X-Telegram-Bot-Api-Secret-Token') !== webhookSecret) return res.sendStatus(403);
  const msg = req.body?.message;
  if (!msg?.text || !msg.chat) return res.sendStatus(200);
  const chatId = msg.chat.id;
  const command = msg.text.trim().split(/\s+/);
  const action = command[0].split('@')[0].toLowerCase();
  if (!['group', 'supergroup'].includes(msg.chat.type)) return res.sendStatus(200);
  try {
    if (action === '/start' || action === '/help') await showBotHelp(token, chatId);
    else if (action === '/token') await showGroupToken(token, chatId);
    else if (action === '/settoken') await registerGroupToken(token, chatId, msg.from?.id, command[1]);
    return res.sendStatus(200);
  } catch (error) {
    console.error('Telegram webhook processing failed', error.message);
    return res.sendStatus(500);
  }
}

function formatBurnNotification(signature, record) {
  const raw = String(record.amountBaseUnits ?? '');
  const decimals = Number(record.decimals);
  let amount = 'Unavailable';
  if (/^\d+$/.test(raw) && Number.isInteger(decimals) && decimals >= 0 && decimals <= 18) {
    const units = BigInt(raw);
    const divisor = 10n ** BigInt(decimals);
    const whole = (units / divisor).toString();
    const fraction = decimals ? (units % divisor).toString().padStart(decimals, '0').replace(/0+$/, '') : '';
    amount = fraction ? whole + '.' + fraction : whole;
  }
  const escapeHtml = v => String(v).replace(/[<>&]/g, c => String.fromCharCode(38,35) + c.charCodeAt(0) + ';');
  const symbol = record.tokenSymbol || 'TOKEN';
  const name = record.tokenName || symbol;
  return ['<b>🔥 BURNING WELL - VERIFIED BURN</b>','','<b>'+escapeHtml(name)+' ($'+escapeHtml(symbol)+')</b>','','🔥 <b>AMOUNT BURNED</b>','<b>'+amount+' '+escapeHtml(symbol)+'</b>','','Successfully burned and verified on Solana.','','🪙 <b>TOKEN MINT</b>','<code>'+escapeHtml(record.mint)+'</code>','','<i>Powered by GWAR Labs</i>'].join(String.fromCharCode(10));
}

async function notifyVerifiedBurn(signature, record, token) {
  if (!record || record.status !== 'verified' || !record.mint) return;
  const groups = await db.collection('telegram_groups').where('mint', '==', record.mint).get();
  if (groups.empty) return;
  const message = formatBurnNotification(signature, record);
  for (const group of groups.docs) {
    const chatId = group.id;
    const deliveryRef = db.collection('telegram_burn_deliveries').doc(signature + '_' + chatId);
    const claimed = await db.runTransaction(async (tx) => {
      const snap = await tx.get(deliveryRef);
      if (snap.exists) { if (Number(snap.data().attempts || 1) >= 3 || (snap.data().status !== 'failed' && !(snap.data().status === 'pending' && Date.now() - (snap.data().retryAt || snap.data().createdAt)?.toMillis() > 600000))) return false; tx.update(deliveryRef, { status: 'pending', attempts: FieldValue.increment(1), retryAt: FieldValue.serverTimestamp() }); return true; }
      tx.create(deliveryRef, { signature, chatId, mint: record.mint, status: 'pending', attempts: 1, createdAt: FieldValue.serverTimestamp() });
      return true;
    });
    if (!claimed) continue;
    try {
      await telegramRequest(token, 'sendMessage', {chat_id:chatId,text:message,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'View on Solscan',url:'https://solscan.io/tx/'+encodeURIComponent(signature)}]]}});
      await deliveryRef.update({ status: 'sent', sentAt: FieldValue.serverTimestamp() });
    } catch (error) {
      await deliveryRef.update({ status: 'failed', error: String(error.message).slice(0, 200) });
      console.error('Telegram burn delivery failed', { signature, chatId });
    }
  }
}
module.exports = { handleTelegramWebhook, notifyVerifiedBurn, retryFailedNotifications };

async function retryFailedNotifications(token) {
  const snap = await db.collection('telegram_burn_deliveries').where('status', 'in', ['failed', 'pending']).limit(25).get();
  if (snap.empty) return;
  for (const delivery of snap.docs) {
    const data = delivery.data();
    const burn = await db.collection('burn_registry').doc(data.signature).get();
    if (!burn.exists || burn.data().status !== 'verified') continue;
    await notifyVerifiedBurn(data.signature, burn.data(), token);
  }
}
