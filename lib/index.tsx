import { NativeModules } from 'react-native';
import creditCardType from 'credit-card-type';

const { StripePayments } = NativeModules;

export interface InitParams {
  publishingKey: string
}

export interface CardParams {
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
  exp_month: string,
  exp_year: string,
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

  confirmPaymentWithCardParams(clientSecret: string, cardParams: CardParams): Promise<PaymentResult> {
    return StripePayments.confirmPaymentWithCardParams(clientSecret, cardParams)
  }

  confirmPaymentWithPaymentMethodId(clientSecret: string, paymentMethodId: string): Promise<PaymentResult> {
    return StripePayments.confirmPaymentWithPaymentMethodId(clientSecret, paymentMethodId);
  }

  async confirmSetup(clientSecret: string, cardParams: CardParams): Promise<SetupIntentResult>{
    const nativeSetupIntentResult = await StripePayments.confirmSetup(clientSecret, cardParams);
    const cardNumber = cardParams.number;
    const cardType = creditCardType(cardNumber);
    let brand = "";
    if (cardType.length > 0) {
      brand = cardType[0].type;
    }
    delete cardParams['cvc']
    delete cardParams['number']
    cardParams['last4'] = cardNumber.substr(cardNumber.length - 4); 
    return {
      ...nativeSetupIntentResult,
      ...cardParams,
      brand
    }
  }

  isCardValid(cardDetails: CardParams): boolean {
    return StripePayments.isCardValid(cardDetails) == true;
  }
}

export default new Stripe();
