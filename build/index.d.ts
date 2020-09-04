export interface InitParams {
    publishingKey: string;
}
export interface CardParams {
    number: string;
    expMonth: number;
    expYear: number;
    cvc: string;
}
export interface PaymentResult {
    id: string;
    paymentMethodId: string;
}
export interface SetupIntentResult {
    id: string;
    exp_month: string;
    exp_year: string;
    liveMode: boolean;
    last4: string;
    created: number;
    brand: string;
}
declare class Stripe {
    _stripeInitialized: boolean;
    setOptions: (options: InitParams) => void;
    confirmPaymentWithCardParams(clientSecret: string, cardParams: CardParams): Promise<PaymentResult>;
    confirmPaymentWithPaymentMethodId(clientSecret: string, paymentMethodId: string): Promise<PaymentResult>;
    confirmSetup(clientSecret: string, cardParams: CardParams): Promise<SetupIntentResult>;
    isCardValid(cardDetails: CardParams): boolean;
}
declare const _default: Stripe;
export default _default;
