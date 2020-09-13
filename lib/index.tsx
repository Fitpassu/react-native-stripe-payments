import { NativeModules } from 'react-native';
import creditCardType from 'credit-card-type';
import {
  NativeEventEmitter,
  EmitterSubscription,
} from "react-native";
import invariant from "invariant";

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

/* Partial implementation (Card only / for now) */
export interface PaymentMethod {
  id: string;
  created: number;
  liveMode: boolean;
  card?: {
    brandDisplayName: string;
    expiryMonth: number;
    expiryYear: number;
    funding: string;
    last4: string;
  };
}

//inspired from the Keyboard module
//https://github.com/facebook/react-native/blob/master/Libraries/Components/Keyboard/Keyboard.js
const eventEmitter = new NativeEventEmitter(NativeModules.StripePayments);

export type StripeEventName =
  | "stripeCreateEphemeralKey"
  | "stripePaymentMethodSelected";
export type StripeEvent = "";

class Stripe {
  _stripeInitialized = false;
  eventEmitter: NativeEventEmitter;
  ephemeralKeyListener?: EmitterSubscription;

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
    //we already have a listner setup, so remove it
    //this can happen especially during dev when certain UI components refresh
    if (this.ephemeralKeyListener) {
      this.ephemeralKeyListener.remove();
    }

    //we communicate with the native side with events, as that is the only way to be able
    //to call the callback multiple times (each time the ephemeral key expires)
    this.ephemeralKeyListener = eventEmitter.addListener(
      "stripeCreateEphemeralKey",
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
   * Start a payment session for the customer session
   * @param paymentMethodTypes
   */
  createPaymentSession(
    paymentMethodTypes: (PaymentMethodType.Card | PaymentMethodType.Fpx)[] = []
  ) {
    return StripePayments.createPaymentSession(paymentMethodTypes);
  }

  /**
   *
   * According to this
   * https://github.com/stripe/stripe-android/blob/master/stripe/src/main/java/com/stripe/android/view/PaymentMethodsAdapter.kt#L78
   * The only payment methods supported by the basic integration is currently Card, Fpx
   *
   * @param paymentMethodTypes
   */
  presentPaymentMethodSelection(paymentMethodId: string | null = null) {
    return StripePayments.presentPaymentMethodSelection(paymentMethodId);
  }

  /**
   *
   *
   * @param paymentMethodTypes
   */
  addPaymentMethod(
    paymentMethodType:
      | PaymentMethodType.Card
      | PaymentMethodType.Fpx = PaymentMethodType.Card
  ): Promise<PaymentMethod> {
    return StripePayments.addPaymentMethod(paymentMethodType);
  }

  endCustomerSession() {
    if (this.ephemeralKeyListener) {
      this.ephemeralKeyListener.remove(); //Removes the listener
    }
    return StripePayments.endCustomerSession();
  }

  /**
   * Event Listeners
   */
  addListener(
    eventName: "stripePaymentMethodSelected",
    callback: (paymentMethod: PaymentMethod) => void
  ): void; //while the native eventEmitter does return a EventSubscription, calling remove on it durin unmount will fail. This is how all @react-native-community/hooks work
  addListener(eventName: StripeEventName, callback: (e: any) => void) {
    return eventEmitter.addListener(eventName, callback);
  }

  /**
   *
   */
  removeListener(
    eventName: "stripePaymentMethodSelected",
    callback: (paymentMethod: PaymentMethod) => void
  ): void;
  removeListener(eventName: StripeEventName, callback: (e: any) => void) {
    return eventEmitter.removeListener(eventName, callback);
  }
}

const stripe = new Stripe(); //helps with autocomplete in VS Code

export default stripe;
