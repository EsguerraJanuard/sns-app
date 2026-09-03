# Future Features (On Standby)

## 1. 1-Click Cash-In / Cash-Out (with Auto-Fees)
- **Problem**: Currently, if a customer cashes in ₱10,000, the user has to manually create two transactions: one Money OUT from GCash (₱10,000) and one Money IN to Cash (₱10,100). This is tedious and prone to errors.
- **Proposed Solution**: 
  - Create a specialized "Cash-In / Cash-Out" form.
  - Provide quick-select buttons for common charge fees (e.g., ₱0 for family, ₱5, ₱10, ₱15, ₱20, ₱25, ₱30).
  - Must allow selecting a "0" fee (e.g., when sending GCash to their children/family members where no charge is applied).
  - Must allow selecting a discounted/custom fee (e.g., a relative pays only a ₱5 fee instead of the standard ₱10 fee for a ₱200 cash-in).
  - Implement a standard base rate for GCash, Maya, and MariBank. If the user doesn't manually select a fee, the system automatically computes and adds the default fee for that bracket.
  - **Flexible Destination:** The system should not strictly assume that the received money goes to physical "Cash". If a customer pays for a GCash cash-in by transferring money to the user's MariBank account, the user must be able to select MariBank as the destination for the principal + fee.
  - Under the hood, the system will automatically generate the two paired transactions (deducting the principal from the e-wallet, and adding principal + fee to the selected destination wallet).

## 2. Wallet QR Code Display
- **Problem**: Customers often need the user's GCash or Maya QR code to send payments. 
- **Proposed Solution**: 
  - Allow uploading/storing QR code images per wallet.
  - Display the QR code directly inside the specific Wallet Page (e.g., `/wallets/gcash`) so the user can quickly show their phone to a customer.
