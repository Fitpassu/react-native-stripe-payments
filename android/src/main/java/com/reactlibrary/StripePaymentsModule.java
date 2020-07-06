package com.reactlibrary;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

public class StripePaymentsModule extends ReactContextBaseJavaModule {

    private static ReactApplicationContext reactContext;

    StripePaymentsModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @Override
    public String getName() {
        return "StripePaymentsModule";
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public void init(String publishableKey) {
        PaymentConfiguration.init(
                reactContext,
                publishableKey
        );
    }

    @ReactMethod(isBlockingSynchronousMethod =  true)
    public boolean isCardValid(ReadableMap cardParams) {
        Card card =  new Card.Builder(
                    cardParams.getString("number"),
                    cardParams.getInt("expMonth"),
                    cardParams.getInt("expYear"),
                    cardParams.getString("cvc")
                )
                .build();
        return card.validateNumber() && card.validateExpiryDate() && card.validateExpMonth() && card.validateCVC();
    }

    @ReactMethod
    public void confirmPayment(String secret, ReadableMap cardParams, final Promise promise) {
        PaymentMethodCreateParams.Card card = new PaymentMethodCreateParams.Card(
                cardParams.getString("number"),
                cardParams.getInt("expMonth"),
                cardParams.getInt("expYear"),
                cardParams.getString("cvc"),
                null,
                null
        );
        PaymentMethodCreateParams params = PaymentMethodCreateParams.create(card);
        ConfirmPaymentIntentParams confirmParams = ConfirmPaymentIntentParams
                .createWithPaymentMethodCreateParams(params, secret);
        if (params == null) {
            promise.reject("", "StripeModule.invalidPaymentIntentParams");
            return;
        }
        MainActivity activity = (MainActivity)getCurrentActivity();
        activity.confirmPayment(
                new Stripe(
                        reactContext,
                        PaymentConfiguration.getInstance(reactContext).getPublishableKey()
                ),
                confirmParams,
                promise
        );
    }
}
