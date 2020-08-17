import { NativeModules } from 'react-native';
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
        return StripePayments.confirmSetup(clientSecret, cardDetails);
    };
    Stripe.prototype.isCardValid = function (cardDetails) {
        return StripePayments.isCardValid(cardDetails) == true;
    };
    return Stripe;
}());
export default new Stripe();
//# sourceMappingURL=index.js.map