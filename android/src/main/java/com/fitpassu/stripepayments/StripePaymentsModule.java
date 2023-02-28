package com.fitpassu.stripepayments;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentActivity;
import androidx.fragment.app.FragmentManager;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

import com.stripe.android.PaymentConfiguration;
import com.stripe.android.Stripe;
import com.stripe.android.model.ConfirmPaymentIntentParams;
import com.stripe.android.model.PaymentMethodCreateParams;

public class StripePaymentsModule extends ReactContextBaseJavaModule {

    private static ReactApplicationContext reactContext;

    private Stripe stripe;

    StripePaymentsModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @NonNull
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
        return true;
//        Card card =  new Card.Builder(
//                    cardParams.getString("number"),
//                    cardParams.getInt("expMonth"),
//                    cardParams.getInt("expYear"),
//                    cardParams.getString("cvc")
//                )
//                .build();
//        return card.validateNumber() && card.validateExpiryDate() && card.validateExpMonth() && card.validateCVC();
    }

    @ReactMethod
    public void confirmPayment(String secret, ReadableMap cardParams, final Promise promise) {
        final PaymentConfiguration paymentConfiguration
                = PaymentConfiguration.getInstance(reactContext);

        stripe = new Stripe(
                reactContext,
                paymentConfiguration.getPublishableKey(),
                paymentConfiguration.getStripeAccountId()
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
        Fragment fragment = new StripePaymentsLauncherFragment(
                stripe,
                paymentConfiguration.getPublishableKey(),
                promise,
                confirmParams
        );

        try {
            FragmentActivity fragmentActivity = (FragmentActivity)getCurrentActivity();
            if (fragmentActivity != null) {
                FragmentManager manager = fragmentActivity.getSupportFragmentManager();
                manager
                        .beginTransaction()
                        .add(fragment, "payment_launcher_fragment")
                        .commit();
            } else {
                promise.reject("StripeModule.failed", "FragmentActivity is null");
            }
        } catch (IllegalStateException error) {
            promise.reject("StripeModule.failed", error.toString());
        }
    }
}
