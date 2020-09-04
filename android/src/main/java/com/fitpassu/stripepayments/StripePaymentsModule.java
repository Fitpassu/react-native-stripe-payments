package com.fitpassu.stripepayments;

import java.lang.String;

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

import com.stripe.android.model.SetupIntent;
import com.stripe.android.SetupIntentResult;
import com.stripe.android.model.ConfirmSetupIntentParams;
import com.stripe.android.model.PaymentMethod;
import com.stripe.android.model.PaymentMethod.BillingDetails;

public class StripePaymentsModule extends ReactContextBaseJavaModule {

    private static ReactApplicationContext reactContext;

    private Stripe stripe;
    private Promise paymentPromise, setupPromise;
    private String current= " temp_val";
    
    boolean handled;
    private final ActivityEventListener activityListener = new BaseActivityEventListener() {

        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
            if ((paymentPromise == null && setupPromise == null) || stripe == null) {
                super.onActivityResult(activity, requestCode, resultCode, data);
                return;
            }
            
            if(current.equals("Payment")){
            handled = stripe.onPaymentResult(requestCode, data, new PaymentResultCallback(paymentPromise));
            }else if(current.equals("Setup")){
                 handled = stripe.onSetupResult(requestCode, data, new SetupResultCallback(setupPromise));
            }

            if (!handled){
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
        return "StripePayments";
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
        Card card = new Card.Builder(
                    cardParams.getString("number"),
                    cardParams.getInt("expMonth"),
                    cardParams.getInt("expYear"),
                    cardParams.getString("cvc")
                )
                .build();
        return card.validateNumber() && card.validateExpiryDate() && card.validateExpMonth() && card.validateCVC();
    }

    @ReactMethod
    public void confirmPaymentWithCardParams(String secret, ReadableMap cardParams, final Promise promise) {
        current = "Payment";
        stripe = new Stripe(
                reactContext,
                PaymentConfiguration.getInstance(reactContext).getPublishableKey()
        );

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
        
        stripe.confirmPayment(getCurrentActivity(), confirmParams);
    }

    @ReactMethod
    public void confirmPaymentWithPaymentMethodId(String secret, String paymentMethodId, final Promise promise) {
        current = "Payment";
        stripe = new Stripe(
                reactContext,
                PaymentConfiguration.getInstance(reactContext).getPublishableKey()
        );

        if (paymentMethodId == null) {
            promise.reject("", "StripeModule.invalidPaymentIntentParams");
            return;
        }
        paymentPromise = promise;

        stripe.confirmPayment(
            getCurrentActivity(),
            ConfirmPaymentIntentParams.createWithPaymentMethodId(
                paymentMethodId,
                secret
            )
        );
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
                promise.reject("StripeModule.failed", paymentIntent.getLastPaymentError().getMessage());
            }
        }

        @Override
        public void onError(Exception e) {
            promise.reject("StripeModule.failed", e.toString());
        }
    }
        @ReactMethod
    public void confirmSetup(String secret, ReadableMap cardParams, final Promise promise) {
        current = "Setup";
        PaymentMethodCreateParams.Card card = new PaymentMethodCreateParams.Card(
                cardParams.getString("number"),
                cardParams.getInt("exp_month"),
                cardParams.getInt("exp_year"),
                cardParams.getString("cvc"),
                null,
                null
        );
        PaymentMethod.BillingDetails billingDetails = (new PaymentMethod.BillingDetails.Builder()).setEmail(cardParams.getString("email")).build();
        // PaymentMethodCreateParams params = PaymentMethodCreateParams.create(card);
        if(card == null){
            promise.reject("", "StripeModule.invalidCardParams");
            return;
        }
        PaymentMethodCreateParams params = PaymentMethodCreateParams.create(card, billingDetails);

        if (params == null) {
            promise.reject("", "StripeModule.invalidSetupIntentParams");
            return;
        }
        ConfirmSetupIntentParams confirmParams = ConfirmSetupIntentParams.create(params, secret);



        setupPromise = promise;
        stripe = new Stripe(
                reactContext,
                PaymentConfiguration.getInstance(reactContext).getPublishableKey()
        );
        stripe.confirmSetupIntent(getCurrentActivity(), confirmParams);

    }
    private static final class SetupResultCallback implements ApiResultCallback<SetupIntentResult> {
        private final Promise promise;

        SetupResultCallback(Promise promise) {
            this.promise = promise;
        }

        @Override
        public void onSuccess(SetupIntentResult result) {
            SetupIntent setupIntent = result.getIntent();
            SetupIntent.Status status = setupIntent.getStatus();

            if (
                    status == SetupIntent.Status.Succeeded ||
                    status == SetupIntent.Status.Processing
            ) {
                WritableMap map = Arguments.createMap();
                map.putString("id", setupIntent.getPaymentMethodId());
                map.putString("liveMode", setupIntent.isLiveMode());
                promise.resolve(map);
            } else if (status == SetupIntent.Status.Canceled) {
                promise.reject("StripeModule.cancelled", "");
            } else {
                promise.reject("StripeModule.failed", setupIntent.getLastSetupError().getMessage());
            }
        }
        @Override
        public void onError(Exception e) {
            promise.reject("StripeModule.failed", e.toString());
        }
    }
}
