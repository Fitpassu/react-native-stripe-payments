import { useEffect, useState } from "react";
import stripe from "./index";
/**
 *
 * Manages the payment session and links it to React's lifecycle
 *
 */
export default function usePaymentSession() {
    var _a = useState(), paymentMethod = _a[0], setPaymentMethod = _a[1];
    useEffect(function () {
        //create a listener for paymentMethod
        stripe.addListener("stripePaymentMethodSelected", setPaymentMethod);
        stripe.createPaymentSession();
        return function () {
            return stripe.removeListener("stripePaymentMethodSelected", setPaymentMethod);
        }; //when ui is destroyed, stop listening anymore to this session
    }, []);
    return paymentMethod;
}
//# sourceMappingURL=usePaymentSession.js.map