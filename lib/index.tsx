import { NativeModules } from 'react-native';

const { StripePayments } = NativeModules;

export interface InitParams {
  publishingKey: string
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
export interface SetupIntentResult {
  id: string,
  paymentMethodId: string,
  liveMode: boolean
}

class Stripe {
  _stripeInitialized = false

  setOptions = (options: InitParams) => {
    if (this._stripeInitialized) { return; }
    StripePayments.init(options.publishingKey);
    this._stripeInitialized = true;
  }

  confirmPayment(clientSecret: string, cardDetails: CardDetails, createWithCardParams: boolean): Promise<PaymentResult> {
    return StripePayments.confirmPayment(clientSecret, cardDetails, createWithCardParams)
  }
  confirmSetup(clientSecret: string, cardDetails: CardDetails): Promise<SetupIntentResult>{
    return StripePayments.confirmSetup(clientSecret, cardDetails)
  }

  isCardValid(cardDetails: CardDetails): boolean {
    return StripePayments.isCardValid(cardDetails) == true;
  }
}

export default new Stripe();
