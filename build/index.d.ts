import { EmitterSubscription } from "react-native";
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
    live_mode: boolean;
    last4: string;
    created: number;
    brand: string;
}
export declare type createEphemeralKeyCallback = (apiVersion: string) => Promise<string>;
export declare enum PaymentMethodType {
    Alipay = "Alipay",
    AuBecsDebit = "AuBecsDebit",
    BacsDebit = "BacsDebit",
    Bancontact = "Bancontact",
    Card = "Card",
    CardPresent = "CardPresent",
    Eps = "Eps",
    Fpx = "Fpx",
    Giropay = "Giropay",
    Ideal = "Ideal",
    Oxxo = "Oxxo",
    P24 = "P24",
    SepaDebit = "SepaDebit",
    Sofort = "Sofort"
}
export interface PaymentMethod {
    id: string;
    created: number;
    liveMode: boolean;
    card?: {
        brand: string;
        brandDisplayName: string;
        expiryMonth: number;
        expiryYear: number;
        funding: string;
        last4: string;
    };
}
export declare const STRIPE_CANCELLED_ERROR_CODE = "StripeModule.cancelled";
export declare type StripeEventName = "stripeCreateEphemeralKey" | "stripePaymentMethodSelected";
export declare type StripeEvent = "";
declare class Stripe {
    _stripeInitialized: boolean;
    ephemeralKeyListener?: EmitterSubscription;
    setOptions: (options: InitParams) => void;
    confirmPaymentWithCardParams(clientSecret: string, cardParams: CardParams): Promise<PaymentResult>;
    confirmPaymentWithPaymentMethodId(clientSecret: string, paymentMethodId: string): Promise<PaymentResult>;
    confirmSetup(clientSecret: string, cardParams: CardParams): Promise<SetupIntentResult>;
    isCardValid(cardDetails: CardParams): boolean;
    /***
     *
     * Customer session management
     *
     */
    initCustomerSession(createEphemeralKey: createEphemeralKeyCallback): any;
    /**
     *
     * Start a payment session for the customer session
     * @param paymentMethodTypes
     */
    createPaymentSession(paymentMethodTypes?: (PaymentMethodType.Card | PaymentMethodType.Fpx)[]): any;
    /**
     *
     * According to this
     * https://github.com/stripe/stripe-android/blob/master/stripe/src/main/java/com/stripe/android/view/PaymentMethodsAdapter.kt#L78
     * The only payment methods supported by the basic integration is currently Card, Fpx
     *
     * @param paymentMethodTypes
     */
    presentPaymentMethodSelection(paymentMethodId?: string | null): any;
    /**
     *
     *
     * @param paymentMethodTypes
     */
    addPaymentMethod(paymentMethodType?: PaymentMethodType.Card | PaymentMethodType.Fpx): Promise<PaymentMethod>;
    endCustomerSession(): any;
    /**
     * Event Listeners
     */
    addListener(eventName: "stripePaymentMethodSelected", callback: (paymentMethod: PaymentMethod) => void): void;
    /**
     *
     */
    removeListener(eventName: "stripePaymentMethodSelected", callback: (paymentMethod: PaymentMethod) => void): void;
}
declare const stripe: Stripe;
export default stripe;
