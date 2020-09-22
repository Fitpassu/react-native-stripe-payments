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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { NativeModules } from 'react-native';
import EventEmitter from "react-native/Libraries/vendor/emitter/EventEmitter";
import creditCardType from 'credit-card-type';
import { NativeEventEmitter, } from "react-native";
import invariant from "invariant";
var StripePayments = NativeModules.StripePayments;
export var PaymentMethodType;
(function (PaymentMethodType) {
    PaymentMethodType["Alipay"] = "Alipay";
    PaymentMethodType["AuBecsDebit"] = "AuBecsDebit";
    PaymentMethodType["BacsDebit"] = "BacsDebit";
    PaymentMethodType["Bancontact"] = "Bancontact";
    PaymentMethodType["Card"] = "Card";
    PaymentMethodType["CardPresent"] = "CardPresent";
    PaymentMethodType["Eps"] = "Eps";
    PaymentMethodType["Fpx"] = "Fpx";
    PaymentMethodType["Giropay"] = "Giropay";
    PaymentMethodType["Ideal"] = "Ideal";
    PaymentMethodType["Oxxo"] = "Oxxo";
    PaymentMethodType["P24"] = "P24";
    PaymentMethodType["SepaDebit"] = "SepaDebit";
    PaymentMethodType["Sofort"] = "Sofort";
})(PaymentMethodType || (PaymentMethodType = {}));
export var STRIPE_CANCELLED_ERROR_CODE = "StripeModule.cancelled";
//inspired from the Keyboard module
//https://github.com/facebook/react-native/blob/master/Libraries/Components/Keyboard/Keyboard.js
//protect against people deciding to link only on platform from their react-native-config.js
var eventEmitter = StripePayments ? new NativeEventEmitter(StripePayments) : new EventEmitter(); //fallback to a dummy implementation, so the app does not crash on these platforms
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
    Stripe.prototype.confirmPaymentWithCardParams = function (clientSecret, cardParams) {
        return StripePayments.confirmPaymentWithCardParams(clientSecret, cardParams);
    };
    Stripe.prototype.confirmPaymentWithPaymentMethodId = function (clientSecret, paymentMethodId) {
        return StripePayments.confirmPaymentWithPaymentMethodId(clientSecret, paymentMethodId);
    };
    Stripe.prototype.confirmSetup = function (clientSecret, cardParams) {
        return __awaiter(this, void 0, void 0, function () {
            var nativeSetupIntentResult, cardNumber, cardType, brand, setupIntentResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, StripePayments.confirmSetup(clientSecret, cardParams)];
                    case 1:
                        nativeSetupIntentResult = _a.sent();
                        cardNumber = cardParams.number;
                        cardType = creditCardType(cardNumber);
                        brand = "";
                        if (cardType.length > 0) {
                            brand = cardType[0].type;
                        }
                        setupIntentResult = __assign({ exp_month: cardParams.expMonth, exp_year: cardParams.expYear, last4: cardNumber.substr(cardNumber.length - 4), brand: brand }, nativeSetupIntentResult);
                        return [2 /*return*/, setupIntentResult];
                }
            });
        });
    };
    Stripe.prototype.isCardValid = function (cardDetails) {
        return StripePayments.isCardValid(cardDetails) == true;
    };
    /***
     *
     * Customer session management
     *
     */
    Stripe.prototype.initCustomerSession = function (createEphemeralKey) {
        var _this = this;
        //we already have a listner setup, so remove it
        //this can happen especially during dev when certain UI components refresh
        if (this.ephemeralKeyListener) {
            this.ephemeralKeyListener.remove();
        }
        //we communicate with the native side with events, as that is the only way to be able
        //to call the callback multiple times (each time the ephemeral key expires)
        this.ephemeralKeyListener = eventEmitter.addListener("stripeCreateEphemeralKey", function (event) { return __awaiter(_this, void 0, void 0, function () {
            var rawKey, e_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, createEphemeralKey(event.apiVersion)];
                    case 1:
                        rawKey = _b.sent();
                        //while we use typescript and such errors will be determined at compile time
                        //if somebody is using the module in JS, the app will simply crash, so
                        //provide a better dev experience (as you see the red box)
                        invariant(rawKey, "EphemeralKey cannot be null");
                        invariant(typeof rawKey === "string", "EphemeralKey needs to be a string");
                        StripePayments.onEphemeralKeyUpdate(rawKey);
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _b.sent();
                        StripePayments.onEphemeralKeyUpdateFailure(0, (_a = e_1 === null || e_1 === void 0 ? void 0 : e_1.message) !== null && _a !== void 0 ? _a : "UNKOWN ERROR");
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        //this will internally call the CreateStripeEphemeralKey every time when needed
        return StripePayments.initCustomerSession();
    };
    /**
     *
     * Start a payment session for the customer session
     * @param paymentMethodTypes
     */
    Stripe.prototype.createPaymentSession = function (paymentMethodTypes) {
        if (paymentMethodTypes === void 0) { paymentMethodTypes = []; }
        return StripePayments.createPaymentSession(paymentMethodTypes);
    };
    /**
     *
     * According to this
     * https://github.com/stripe/stripe-android/blob/master/stripe/src/main/java/com/stripe/android/view/PaymentMethodsAdapter.kt#L78
     * The only payment methods supported by the basic integration is currently Card, Fpx
     *
     * @param paymentMethodTypes
     */
    Stripe.prototype.presentPaymentMethodSelection = function (paymentMethodId) {
        if (paymentMethodId === void 0) { paymentMethodId = null; }
        return StripePayments.presentPaymentMethodSelection(paymentMethodId);
    };
    /**
     *
     *
     * @param paymentMethodTypes
     */
    Stripe.prototype.addPaymentMethod = function (paymentMethodType) {
        if (paymentMethodType === void 0) { paymentMethodType = PaymentMethodType.Card; }
        return StripePayments.addPaymentMethod(paymentMethodType);
    };
    Stripe.prototype.endCustomerSession = function () {
        if (this.ephemeralKeyListener) {
            this.ephemeralKeyListener.remove(); //Removes the listener
        }
        return StripePayments.endCustomerSession();
    };
    Stripe.prototype.addListener = function (eventName, callback) {
        return eventEmitter.addListener(eventName, callback);
    };
    Stripe.prototype.removeListener = function (eventName, callback) {
        return eventEmitter.removeListener(eventName, callback);
    };
    return Stripe;
}());
var stripe = new Stripe(); //helps with autocomplete in VS Code
export default stripe;
//# sourceMappingURL=index.js.map