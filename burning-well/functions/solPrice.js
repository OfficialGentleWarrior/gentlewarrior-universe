const SOL_MINT='So11111111111111111111111111111111111111112';
const CACHE_TTL_MS=60000;
let cachedPrice=null,expiresAt=0;
async function getSolPriceUsd(){if(cachedPrice&&Date.now()<expiresAt)return cachedPrice;const response=await fetch('https://lite-api.jup.ag/price/v3?ids='+SOL_MINT,{signal:AbortSignal.timeout(8000)});if(!response.ok)throw new Error('Jupiter price request failed: '+response.status);const data=await response.json();const price=Number(data?.[SOL_MINT]?.usdPrice);if(!Number.isFinite(price)||price<=0)throw new Error('Invalid SOL/USD market price');cachedPrice={solPriceUsd:price,updatedAt:new Date().toISOString(),source:'Jupiter'};expiresAt=Date.now()+CACHE_TTL_MS;return cachedPrice;}
module.exports={getSolPriceUsd};
