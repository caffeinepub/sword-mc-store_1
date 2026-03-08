# SWORD MC Store

## Current State

Full-stack Minecraft store with:
- Home, Ranks, Coins pages
- Player login/register system
- UPI payment modal with QR code, UPI ID, and Transaction ID input field
- Admin dashboard showing orders with TX ID column
- Content editor for admins
- Backend Order type has: username, itemName, price, transactionId, timestamp, status

## Requested Changes (Diff)

### Add
- Minecraft username input field in UPI payment modal (player enters their MC username)
- Screenshot upload field in UPI payment modal (player uploads payment screenshot as base64 image)
- Admin dashboard: screenshot preview/link column and minecraft username column

### Modify
- UPI payment modal: remove Transaction ID input, add Minecraft username input + screenshot upload
- Backend Order type: remove `transactionId`, add `minecraftUsername: Text` and `screenshotUrl: Text`
- Admin dashboard table: replace TX ID column with Minecraft Username + Screenshot columns
- submitOrder backend function: accept updated Order type without transactionId

### Remove
- Transaction ID input from payment modal
- transactionId field from Order type
- TX ID column from admin orders table

## Implementation Plan

1. Regenerate backend Motoko with updated Order type (minecraftUsername, screenshotUrl instead of transactionId)
2. Update UpiPaymentModal:
   - Add Minecraft username text input (required)
   - Add screenshot file upload (accepts image files, converts to base64 data URL, required)
   - Remove transaction ID input
   - Pass minecraftUsername and screenshotUrl in submitOrder call
3. Update AdminDashboard:
   - Replace TX ID column header with MC USERNAME and SCREENSHOT
   - Show minecraftUsername in MC USERNAME column
   - Show clickable thumbnail/link for screenshotUrl in SCREENSHOT column
   - Update table row key to not use transactionId
