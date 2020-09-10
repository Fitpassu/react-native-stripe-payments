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

export type createEphemeralKeyCallback = (
  apiVersion: string
) => Promise<string>;

export enum PaymentMethodType {
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
  Sofort = "Sofort",
}

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
    invariant(this.eventEmitter, "Stripe SDK is not initialized");

    //we already have a listner setup, so remove it
    //this can happen especially during dev when certain UI components refresh
    if (this.ephemeralKeyListener) {
      this.ephemeralKeyListener.remove();
    }

    //we communicate with the native side with events, as that is the only way to be able
    //to call the callback multiple times (each time the ephemeral key expires)
    this.ephemeralKeyListener = this.eventEmitter.addListener(
      "StripeModule.createEphemeralKey",
      async (event: { apiVersion: string }) => {
        try {
          const rawKey = await createEphemeralKey(event.apiVersion);
          //while we use typescript and such errors will be determined at compile time
          //if somebody is using the module in JS, the app will simply crash, so
          //provide a better dev experience (as you see the red box)
          invariant(rawKey, "EphemeralKey cannot be null");
          invariant(
            typeof rawKey === "string",
            "EphemeralKey needs to be a string"
          );
          StripePayments.onEphemeralKeyUpdate(rawKey);
        } catch (e) {
          StripePayments.onEphemeralKeyUpdateFailure(
            0,
            e?.message ?? "UNKOWN ERROR"
          );
        }
      }
    );

    //this will internally call the CreateStripeEphemeralKey every time when needed
    return StripePayments.initCustomerSession();
  }

  /**
   *
   * According to this
   * https://github.com/stripe/stripe-android/blob/master/stripe/src/main/java/com/stripe/android/view/PaymentMethodsAdapter.kt#L78
   * The only payment methods supported by the basic integration is currently Card, Fpx
   *
   * @param paymentMethodTypes
   */
  presentPaymentMethodSelection(
    paymentMethodTypes: (PaymentMethodType.Card | PaymentMethodType.Fpx)[]
  ) {
    return StripePayments.presentPaymentMethodSelection(paymentMethodTypes);
  }

  endCustomerSession() {
    if (this.ephemeralKeyListener) {
      this.ephemeralKeyListener.remove(); //Removes the listener
    }
    return StripePayments.endCustomerSession();
  }
}

export default new Stripe();
