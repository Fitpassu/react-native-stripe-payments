import Foundation
import Stripe

@objc(StripePayments)
class StripePayments: NSObject {

    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }

    @objc(init:)
    func `init`(publishableKey: String) {
        STPAPIClient.shared.publishableKey = publishableKey
    }

    @objc(isCardValid:)
    func isCardValid(cardParams: NSDictionary) -> Bool {
        return true
    }

    @objc(confirmPayment:cardParams:resolver:rejecter:)
    func confirmPayment(
        secret: String,
        cardParams: [String: Any],
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        let card = STPPaymentMethodCardParams()
        card.number = RCTConvert.nsString(cardParams["number"])
        card.expYear = RCTConvert.nsNumber(cardParams["expYear"])
        card.expMonth = RCTConvert.nsNumber(cardParams["expMonth"])
        card.cvc = RCTConvert.nsString(cardParams["cvc"])

        let methodParams = STPPaymentMethodParams(card: card, billingDetails: nil, metadata: nil)
        let intentParams = STPPaymentIntentParams(clientSecret: secret)
        intentParams.paymentMethodParams = methodParams
        intentParams.setupFutureUsage = .onSession

        STPPaymentHandler.shared().confirmPayment(intentParams, with: self) { status, paymentIntent, error in
            switch status {
            case .succeeded:
                var result: [String: Any] = [:]
                result["id"] = paymentIntent?.allResponseFields["id"]
                result["paymentMethodId"] = paymentIntent?.paymentMethodId
                resolver(result)
            case .canceled:
                rejecter("StripeModule.cancelled", "", nil)
            case .failed:
                rejecter("StripeModule.failed", error?.localizedDescription ?? "", nil)
            }
        }
    }
}

extension StripePayments: STPAuthenticationContext {
    func authenticationPresentingViewController() -> UIViewController {
        RCTPresentedViewController()!
    }
}
