import config from "../config";

export const calculateTax = (amount: number) => {
    const TAX_RATE = config.payment.TAX_RATE;
    return parseFloat((amount * TAX_RATE).toFixed(2));
}
