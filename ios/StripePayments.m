#import "StripePayments.h"
#import <React/RCTLog.h>
#import <React/RCTConvert.h>

@implementation StripePayments

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(init:(NSString *)publishableKey)
{
    [Stripe setDefaultPublishableKey:publishableKey];
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

RCT_EXPORT_METHOD(confirmSetup:(NSString *)clientSecret cardParams:(NSDictionary *)cardParams resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{

    // Collect card params
    STPCardParams *card = [[STPCardParams alloc] init];
    card.number = [RCTConvert NSString:cardParams[@"number"]];
    card.expYear = [[RCTConvert NSNumber:cardParams[@"exp_year"]] unsignedIntegerValue];
    card.expMonth = [[RCTConvert NSNumber:cardParams[@"exp_month"]] unsignedIntegerValue];
    card.cvc = [RCTConvert NSString:cardParams[@"cvc"]];
    RCTLogInfo(@"Message: %@", card);

    // Collect the customer's email to know which customer the PaymentMethod belongs to
    STPPaymentMethodBillingDetails *billingDetails = [[STPPaymentMethodBillingDetails alloc] init];
    billingDetails.email = [RCTConvert NSString:cardParams[@"email"]];
    billingDetails.address.postalCode = [RCTConvert NSString:cardParams[@"postalCode"]];
    
    // Create SetupIntent confirm parameters with the above
    STPPaymentMethodCardParams *paymentMethodCardParams =[[STPPaymentMethodCardParams alloc] initWithCardSourceParams:card];
    STPPaymentMethodParams *paymentMethodParams = [STPPaymentMethodParams paramsWithCard:paymentMethodCardParams billingDetails:billingDetails metadata:nil];
    STPSetupIntentConfirmParams *setupIntentConfirmParams = [[STPSetupIntentConfirmParams alloc] initWithClientSecret:clientSecret];
    setupIntentConfirmParams.paymentMethodParams = paymentMethodParams;
    
    // Submit payment intent
    STPPaymentHandler *paymentHandler = [STPPaymentHandler sharedHandler];
    [paymentHandler confirmSetupIntent:setupIntentConfirmParams withAuthenticationContext:self completion:^(STPPaymentHandlerActionStatus status, STPSetupIntent *setupIntent, NSError *error) {
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
                    NSString *customerID = [setupIntent customerID];
                    if (!customerID) {
                      customerID = [NSString string];
                    }
                    
                    resolve(@{
                        @"id": [setupIntent paymentMethodID],
                        @"created": [NSNumber numberWithDouble:[[setupIntent created] timeIntervalSince1970]],
                        @"liveMode": @([setupIntent livemode]),
                    });
                    break;
                }
                default:
                    reject(@"StripeModule.unknown", error.localizedDescription, nil);
                    break;
            }
        });
    }];
}

RCT_EXPORT_METHOD(confirmPaymentWithPaymentMethodId:(NSString *)secret paymentMethodId:(NSString *)paymentMethodId resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
    // Creates the payment intent for 3D secure 2
    STPPaymentIntentParams *paymentIntentParams = [[STPPaymentIntentParams alloc] initWithClientSecret:secret];
    paymentIntentParams.paymentMethodId = [RCTConvert NSString:paymentMethodId];
  
    [self stripeConfirmPayment:paymentIntentParams resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(confirmPaymentWithCardParams:(NSString *)secret cardParams:(NSDictionary *)cardParams resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
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

    [self stripeConfirmPayment:paymentIntentParams resolver:resolve rejecter:reject];
}

- (void) stripeConfirmPayment:(STPPaymentIntentParams *)paymentIntentParams resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject
{
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
