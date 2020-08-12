import { NativeModules } from 'react-native';

const { StripePayments } = NativeModules;

export interface InitParams {
  publishingKey: string,
  stripeAccount: string,
}

export interface CardDetails {
  number: string,
  expMonth: number,
  expYear: number,
  cvc: string,
}

export interface PaymentResult {
  id: string,
  paymentMethodId: string,
}

class Stripe {
  _stripeInitialized = false;

  setOptions = (options: InitParams) => {
    if (this._stripeInitialized) { return; }
    StripePayments.init(options.publishingKey, options.stripeAccount);
    this._stripeInitialized = true;
  };

  confirmPayment(clientSecret: string, cardDetails: CardDetails): Promise<PaymentResult> {
    return StripePayments.confirmPayment(clientSecret, cardDetails)
  }

  isCardValid(cardDetails: CardDetails): boolean {
    return StripePayments.isCardValid(cardDetails) == true;
  }
}

export default new Stripe();
