import { NativeModules } from 'react-native';
import creditCardType from 'credit-card-type';

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
  paymentMethodId: string,
  liveMode: boolean,
  last4: string,
  created: number,
  brand: string
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

  async confirmSetup(clientSecret: string, cardDetails: CardDetails): Promise<SetupIntentResult>{
    const nativeSetupIntentResult = await StripePayments.confirmSetup(clientSecret, cardDetails);
    const cardNumber = cardDetails.number;
    const cardType = creditCardType(cardNumber);
    let brand = "";
    if (cardType.length > 0) {
      brand = cardType[0].type;
    }

    return {
      ...nativeSetupIntentResult,
      brand
    }
  }

  isCardValid(cardDetails: CardDetails): boolean {
    return StripePayments.isCardValid(cardDetails) == true;
  }
}

export default new Stripe();
