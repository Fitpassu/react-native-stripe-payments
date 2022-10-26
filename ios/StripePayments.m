#import "StripePayments.h"
#import <React/RCTLog.h>
#import <React/RCTConvert.h>

@implementation StripePayments

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(init:(NSString *)publishableKey)
{
    [StripeAPI setDefaultPublishableKey:publishableKey];
}

RCT_EXPORT_METHOD(confirmPayment:(NSString *)publishableKey secret:(NSString *)secret cardParams:(NSDictionary *)cardParams resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
    [STPAPIClient sharedClient].publishableKey = publishableKey;
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
                    if ([error.debugDescription rangeOfString:@"You cannot confirm this PaymentIntent because it has already succeeded after being previously confirmed."].location == NSNotFound) {
                        reject(@"StripeModule.failed", error.localizedDescription, nil);
                    } else {
                        reject(@"StripeModule.failed", @"You cannot confirm this PaymentIntent because it has already succeeded after being previously confirmed.", nil);
                    }
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
