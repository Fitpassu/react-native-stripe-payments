#import "StripePayments.h"
#import <React/RCTLog.h>
#import <React/RCTConvert.h>

@implementation StripePayments

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(init:(NSString *)publishableKey (NSString *)stripeAccount)
{
    [Stripe setDefaultPublishableKey:publishableKey];
    [STPAPIClient sharedClient] setStripeAccount:stripeAccount];
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(isCardValid:(NSDictionary *)cardParams)
{
    STPCardParams *card = [[STPCardParams alloc] init];
    card.number = [RCTConvert NSString:cardParams[@"number"]];
    card.expYear = [[RCTConvert NSNumber:cardParams[@"expYear"]] unsignedIntegerValue];
    card.expMonth = [[RCTConvert NSNumber:cardParams[@"expMonth"]] unsignedIntegerValue];
    card.cvc = [RCTConvert NSString:cardParams[@"cvc"]];
    BOOL result = ([STPCardValidator validationStateForCard:card] == STPCardValidationStateValid);
    return [NSString stringWithFormat:@"%@", @(result)];
}

RCT_EXPORT_METHOD(confirmPayment:(NSString *)secret cardParams:(NSDictionary *)cardParams resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
    // Collect card details
    STPPaymentMethodCardParams *card = [[STPPaymentMethodCardParams alloc] init];
    card.number = [RCTConvert NSString:cardParams[@"number"]];
    card.expYear = [RCTConvert NSNumber:cardParams[@"expYear"]];
    card.expMonth = [RCTConvert NSNumber:cardParams[@"expMonth"]];
    card.cvc = [RCTConvert NSString:cardParams[@"cvc"]];
    STPPaymentMethodParams *paymentMethodParams = [STPPaymentMethodParams paramsWithCard:card billingDetails:nil metadata:nil];
    STPPaymentIntentParams *paymentIntentParams = [[STPPaymentIntentParams alloc] initWithClientSecret:secret];
    paymentIntentParams.paymentMethodParams = paymentMethodParams;
    paymentIntentParams.setupFutureUsage = @(STPPaymentIntentSetupFutureUsageOnSession);

    // Submit the payment
    STPPaymentHandler *paymentHandler = [STPPaymentHandler sharedHandler];
    [paymentHandler confirmPayment:paymentIntentParams withAuthenticationContext:self completion:^(STPPaymentHandlerActionStatus status, STPPaymentIntent *paymentIntent, NSError *error) {
        dispatch_async(dispatch_get_main_queue(), ^{
            switch (status) {
                case STPPaymentHandlerActionStatusFailed: {
                    reject(@"StripeModule.failed", error.localizedDescription, nil);
                    break;
                }
                case STPPaymentHandlerActionStatusCanceled: {
                    reject(@"StripeModule.cancelled", @"", nil);
                    break;
                }
                case STPPaymentHandlerActionStatusSucceeded: {
                    resolve(@{
                        @"id": paymentIntent.allResponseFields[@"id"],
                        @"paymentMethodId": paymentIntent.paymentMethodId
                    });
                    break;
                }
                default:
                    break;
            }
        });
    }];
}

- (UIViewController *)authenticationPresentingViewController
{
    return RCTPresentedViewController();
}

@end
