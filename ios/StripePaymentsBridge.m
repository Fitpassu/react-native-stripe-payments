#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(StripePayments, NSObject)

RCT_EXTERN_METHOD(init:(NSString *)publishableKey)
RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(isCardValid:(NSDictionary *)cardParams)
RCT_EXTERN_METHOD(confirmPayment:(NSString *)secret cardParams:(NSDictionary *)cardParams resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

@end
