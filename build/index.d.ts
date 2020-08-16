export interface InitParams {
    publishingKey: string;
}
export interface CardDetails {
    number: string;
    expMonth: number;
    expYear: number;
    cvc: string;
}
export interface PaymentResult {
    id: string;
    paymentMethodId: string;
}
declare class Stripe {
    _stripeInitialized: boolean;
    setOptions: (options: InitParams) => void;
    confirmPayment(clientSecret: string, cardDetails: CardDetails): Promise<PaymentResult>;
    isCardValid(cardDetails: CardDetails): boolean;
}
declare const _default: Stripe;
export default _default;
