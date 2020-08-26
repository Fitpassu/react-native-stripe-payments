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
    paymentMethodId: string;
    liveMode: boolean;
    last4: string;
    created: number;
    brand: string;
}
declare class Stripe {
    _stripeInitialized: boolean;
    setOptions: (options: InitParams) => void;
    confirmPayment(clientSecret: string, cardParams: CardParams, createWithCardParams: boolean): Promise<PaymentResult>;
    confirmSetup(clientSecret: string, cardParams: CardParams): Promise<SetupIntentResult>;
    isCardValid(cardDetails: CardParams): boolean;
}
declare const _default: Stripe;
export default _default;
