#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
@import Stripe;

@interface StripePayments : NSObject<RCTBridgeModule, STPAuthenticationContext>

@end
