import { NativeModules } from 'react-native';
import creditCardType from 'credit-card-type';
import {
  NativeEventEmitter,
  EmitterSubscription,
} from "react-native";

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
  live_mode: boolean,
  last4: string,
  created: number,
  brand: string
}

export type createEphemeralKeyCallback = (apiVersion: string) => string;

class Stripe {
  _stripeInitialized = false
  eventEmitter: NativeEventEmitter;
  ephemeralKeyListener?: EmitterSubscription;

  setOptions = (options: InitParams) => {
    if (this._stripeInitialized) { return; }
    StripePayments.init(options.publishingKey);
    this.eventEmitter = new NativeEventEmitter(StripePayments);
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
    let setupIntentResult = {
      exp_month: cardParams.expMonth,
      exp_year: cardParams.expYear,
      last4: cardNumber.substr(cardNumber.length - 4),
      brand: brand,
      ...nativeSetupIntentResult      
    }
    return setupIntentResult
  }

  isCardValid(cardDetails: CardParams): boolean {
    return StripePayments.isCardValid(cardDetails) == true;
  }

  /***
   *
   * Customer session management
   *
   */
  initCustomerSession(createEphemeralKey: createEphemeralKeyCallback) {
    //we communicate with the native side with events, as that is the only way to be able
    //to call the callback multiple times (each time the ephemeral key expires)
    this.ephemeralKeyListener = this.eventEmitter.addListener(
      "CreateStripeEphemeralKey",
      (apiVersion: string) => {
        const rawKey = createEphemeralKey(apiVersion);
        StripePayments.onEphemeralKeyUpdate(rawKey);
      }
    );

    //this will internally call the CreateStripeEphemeralKey every time when needed
    return StripePayments.initCustomerSession();
  }

  endCustomerSession() {
    if (this.ephemeralKeyListener) {
      this.ephemeralKeyListener.remove(); //Removes the listener
    }
    return StripePayments.endCustomerSession();
  }
}

export default new Stripe();
