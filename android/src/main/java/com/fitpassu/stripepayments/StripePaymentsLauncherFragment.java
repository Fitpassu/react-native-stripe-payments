package com.fitpassu.stripepayments;

import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;
import com.stripe.android.ApiResultCallback;
import com.stripe.android.Stripe;
import com.stripe.android.model.ConfirmPaymentIntentParams;
import com.stripe.android.model.PaymentIntent;
import com.stripe.android.payments.paymentlauncher.PaymentLauncher;
import com.stripe.android.payments.paymentlauncher.PaymentResult;

import java.util.Arrays;
import java.util.Collections;

public class StripePaymentsLauncherFragment extends Fragment {

    private final Stripe stripe;
    private final String publishableKey;
    private final Promise promise;
    private final ConfirmPaymentIntentParams confirmParams;

    private PaymentLauncher paymentLauncher;

    StripePaymentsLauncherFragment(
            Stripe stripe,
            String publishableKey,
            Promise promise,
            ConfirmPaymentIntentParams confirmParams
    ) {
        this.stripe = stripe;
        this.publishableKey = publishableKey;
        this.promise = promise;
        this.confirmParams = confirmParams;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        paymentLauncher = PaymentLauncher.Companion.create(this, publishableKey, null, result -> {
            if (result instanceof PaymentResult.Completed) {
                stripe.retrievePaymentIntent(
                        confirmParams.getClientSecret(),
                        null,
                        Collections.singletonList("payment_method"),
                        new PaymentResultCallback(promise)
                );
            } else {
                promise.reject("StripeModule.failed", result.toString());
            }
        });
        paymentLauncher.confirm(confirmParams);
        FrameLayout layout = new FrameLayout(requireActivity());
        layout.setVisibility(View.GONE);
        return layout;
    }

    private static final class PaymentResultCallback implements ApiResultCallback<PaymentIntent> {
        private final Promise promise;

        PaymentResultCallback(Promise promise) {
            this.promise = promise;
        }

        @Override
        public void onSuccess(@NonNull PaymentIntent paymentIntent) {
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
