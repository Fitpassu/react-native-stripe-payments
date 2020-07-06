#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <Stripe/Stripe.h>

@interface StripePayments : NSObject<RCTBridgeModule, STPAuthenticationContext>

@end
