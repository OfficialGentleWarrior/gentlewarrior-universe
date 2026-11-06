/* EVENT WALLET MODAL UI READY */
export function openEventWalletModal(wallets, onSelect) {
  document.getElementById(
'walletModal'
)?.remove();
  const modal = document.createElement(
'div'
);
  modal.id =
'walletModal'
;
  modal.className =
'wallet-modal'
;
  const backdrop = document.createElement(
'div'
);
  backdrop.className =
'wallet-modal-backdrop'
;
  const card = document.createElement(
'div'
);
  card.className =
'wallet-modal-card'
;
  card.setAttribute(
'role'
,
'dialog'
);
  card.setAttribute(
'aria-modal'
,
'true'
);
  const heading = document.createElement(
'h2'
);
  heading.textContent =
'Connect Your Wallet'
;
  const subtitle = document.createElement(
'p'
);
  subtitle.className =
'wallet-modal-subtitle'
;
  subtitle.textContent =
'Choose a Solana wallet to continue.'
;
  const list = document.createElement(
'div'
);
  list.className =
'wallet-list'
;
  const close = document.createElement(
'button'
);
  close.type =
'button'
;
  close.className =
'wallet-modal-close'
;
  close.textContent =
'X'
;
  const dismiss = () => { modal.remove(); onSelect(null); };
  close.addEventListener(
'click'
, dismiss);
  backdrop.addEventListener(
'click'
, dismiss);
  for (const wallet of wallets) {
    const button = document.createElement(
'button'
);
    button.type =
'button'
;
    button.className =
'wallet-option'
;
    button.textContent = wallet.name;
    button.addEventListener(
'click'
, () => { modal.remove(); onSelect(wallet); });
    list.appendChild(button);
  }
  card.append(close, heading, subtitle, list);
  modal.append(backdrop, card);
  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add(
'is-open'
));
}
