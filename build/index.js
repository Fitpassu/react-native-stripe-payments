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
    Stripe.prototype.confirmPaymentWithCardParams = function (clientSecret, cardParams) {
        return StripePayments.confirmPaymentWithCardParams(clientSecret, cardParams);
    };
    Stripe.prototype.confirmPaymentWithPaymentMethodId = function (clientSecret, paymentMethodId) {
        return StripePayments.confirmPaymentWithPaymentMethodId(clientSecret, paymentMethodId);
    };
    Stripe.prototype.confirmSetup = function (clientSecret, cardParams) {
        return __awaiter(this, void 0, void 0, function () {
            var nativeSetupIntentResult, cardNumber, cardType, brand;
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
                        delete cardParams['cvc'];
                        delete cardParams['number'];
                        cardParams['last4'] = cardNumber.substr(cardNumber.length - 4);
                        return [2 /*return*/, __assign(__assign(__assign({}, nativeSetupIntentResult), cardParams), { brand: brand })];
                }
            });
        });
    };
    Stripe.prototype.isCardValid = function (cardDetails) {
        return StripePayments.isCardValid(cardDetails) == true;
    };
    return Stripe;
}());
export default new Stripe();
//# sourceMappingURL=index.js.map