package com.fitpassu.stripepayments;

import android.app.Activity;
import android.content.Intent;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.BaseActivityEventListener;

import com.facebook.react.bridge.WritableMap;
import com.stripe.android.ApiResultCallback;
import com.stripe.android.PaymentConfiguration;
import com.stripe.android.PaymentIntentResult;
import com.stripe.android.Stripe;
import com.stripe.android.model.Card;
import com.stripe.android.model.ConfirmPaymentIntentParams;
import com.stripe.android.model.PaymentIntent;
import com.stripe.android.model.PaymentMethodCreateParams;

public class StripePaymentsModule extends ReactContextBaseJavaModule {

    private static ReactApplicationContext reactContext;

    private Stripe stripe;
    private Promise paymentPromise;

    private final ActivityEventListener activityListener = new BaseActivityEventListener() {

        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
            if (paymentPromise == null || stripe == null) {
                super.onActivityResult(activity, requestCode, resultCode, data);
            }
            boolean handled = stripe.onPaymentResult(requestCode, data, new PaymentResultCallback(paymentPromise));
            if (!handled) {
                super.onActivityResult(activity, requestCode, resultCode, data);
            }
        }
    };

    StripePaymentsModule(ReactApplicationContext context) {
        super(context);

        context.addActivityEventListener(activityListener);

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

        paymentPromise = promise;
        stripe = new Stripe(
                reactContext,
                PaymentConfiguration.getInstance(reactContext).getPublishableKey()
        );
        stripe.confirmPayment(getCurrentActivity(), confirmParams);
    }

    private static final class PaymentResultCallback implements ApiResultCallback<PaymentIntentResult> {
        private final Promise promise;

        PaymentResultCallback(Promise promise) {
            this.promise = promise;
        }

        @Override
        public void onSuccess(PaymentIntentResult result) {
            PaymentIntent paymentIntent = result.getIntent();
            PaymentIntent.Status status = paymentIntent.getStatus();

            if (
                    status == PaymentIntent.Status.Succeeded ||
                    status == PaymentIntent.Status.Processing
            ) {
                WritableMap map = Arguments.createMap();
                map.putString("id", paymentIntent.getId());
                map.putString("paymentMethodId", paymentIntent.getPaymentMethodId());
                promise.resolve(map);
            } else if (status == PaymentIntent.Status.Canceled) {
                promise.reject("StripeModule.cancelled", "");
            } else {
                promise.reject("StripeModule.failed", status.toString());
            }
        }

        @Override
        public void onError(Exception e) {
            promise.reject("StripeModule.failed", e.toString());
        }
    }
}
