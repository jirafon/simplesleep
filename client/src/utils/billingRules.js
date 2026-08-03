export const BILLING_BLOCK_PRICE = 5990;
export const PACKS_PER_BLOCK = 3;
export const CUSTOM_EXAMS_PER_BLOCK = 9;

function toSafeQuantity(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function isPackCartItem(item) {
  if (!item || typeof item !== 'object') {
    return false;
  }

  if (item.pricingType === 'pack') {
    return true;
  }

  if (Array.isArray(item.exams) && item.exams.length > 0) {
    return true;
  }

  return String(item.category || '').toLowerCase().includes('pack');
}

export function calculateCartBilling(items = []) {
  let packUnits = 0;
  let customExamUnits = 0;

  items.forEach((item) => {
    const quantity = toSafeQuantity(item?.quantity);
    if (isPackCartItem(item)) {
      packUnits += quantity;
      return;
    }
    customExamUnits += quantity;
  });

  const packBlocks = Math.ceil(packUnits / PACKS_PER_BLOCK);
  const customExamBlocks = Math.ceil(customExamUnits / CUSTOM_EXAMS_PER_BLOCK);

  const packsAmount = packBlocks * BILLING_BLOCK_PRICE;
  const customAmount = customExamBlocks * BILLING_BLOCK_PRICE;
  const total = packsAmount + customAmount;

  return {
    packUnits,
    customExamUnits,
    packBlocks,
    customExamBlocks,
    packsAmount,
    customAmount,
    subtotal: total,
    taxes: 0,
    total,
    currency: 'CLP',
    blockPrice: BILLING_BLOCK_PRICE,
    packsPerBlock: PACKS_PER_BLOCK,
    customExamsPerBlock: CUSTOM_EXAMS_PER_BLOCK
  };
}
