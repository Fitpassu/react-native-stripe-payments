import { NativeModules } from "react-native";

const { StripePayments } = NativeModules;

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

class Stripe {
  _stripeInitialized = false;

  setOptions = (options: InitParams) => {
    if (this._stripeInitialized) {
      return;
    }
    StripePayments.init(options.publishingKey);
    this._stripeInitialized = true;
  };

  confirmPayment(
    publishingKey: string,
    clientSecret: string,
    cardDetails: CardDetails,
  ): Promise<PaymentResult> {
    return StripePayments.confirmPayment(
      publishingKey,
      clientSecret,
      cardDetails,
    );
  }
}

export default new Stripe();
