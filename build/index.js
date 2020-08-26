var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { NativeModules } from 'react-native';
import creditCardType from 'credit-card-type';
var StripePayments = NativeModules.StripePayments;
var Stripe = /** @class */ (function () {
    function Stripe() {
        var _this = this;
        this._stripeInitialized = false;
        this.setOptions = function (options) {
            if (_this._stripeInitialized) {
                return;
            }
            StripePayments.init(options.publishingKey);
            _this._stripeInitialized = true;
        };
    }
    Stripe.prototype.confirmPayment = function (clientSecret, cardDetails, createWithCardParams) {
        return StripePayments.confirmPayment(clientSecret, cardDetails, createWithCardParams);
    };
    Stripe.prototype.confirmSetup = function (clientSecret, cardDetails) {
        var nativeSetupIntentResult = StripePayments.confirmSetup(clientSecret, cardDetails);
        var cardNumber = cardDetails.number;
        var cardType = creditCardType(cardNumber);
        var brand = "";
        if (cardType.length > 0) {
            brand = cardType[0].type;
        }
        return __assign(__assign({}, nativeSetupIntentResult), { brand: brand });
    };
    Stripe.prototype.isCardValid = function (cardDetails) {
        return StripePayments.isCardValid(cardDetails) == true;
    };
    return Stripe;
}());
export default new Stripe();
//# sourceMappingURL=index.js.map