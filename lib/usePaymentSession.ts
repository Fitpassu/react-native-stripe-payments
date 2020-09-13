import { useEffect, useState } from "react";
import stripe, { PaymentMethod } from "./index";

/**
 *
 * Manages the payment session and links it to React's lifecycle
 *
 */
export default function usePaymentSession() {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>();

  useEffect(() => {
    //create a listener for paymentMethod
    const listener = stripe.addListener(
      "StripeModule.PaymentSession.onPaymentMethodSelected",
      setPaymentMethod
    );

    stripe.createPaymentSession();

    return listener.remove; //when ui is destroyed, stop listening anymore to this session
  }, []);

  return paymentMethod;
}
