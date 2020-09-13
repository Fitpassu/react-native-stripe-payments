package com.fitpassu.stripepayments;

import java.lang.String;
import java.util.List;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import android.app.Activity;
import android.content.Intent;
import androidx.activity.ComponentActivity;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.UiThreadUtil;

import com.facebook.react.bridge.WritableMap;
import com.stripe.android.ApiResultCallback;
import com.stripe.android.PaymentConfiguration;
import com.stripe.android.PaymentIntentResult;
import com.stripe.android.Stripe;
import com.stripe.android.model.Card;
import com.stripe.android.model.ConfirmPaymentIntentParams;
import com.stripe.android.model.PaymentIntent;
import com.stripe.android.model.PaymentMethodCreateParams;
import com.stripe.android.CustomerSession;
import com.stripe.android.PaymentSession;
import com.stripe.android.PaymentSessionConfig;
import com.stripe.android.PaymentSessionData;

import com.stripe.android.model.SetupIntent;
import com.stripe.android.SetupIntentResult;
import com.stripe.android.model.ConfirmSetupIntentParams;
import com.stripe.android.model.PaymentMethod;
import com.stripe.android.model.PaymentMethod.BillingDetails;
import com.stripe.android.view.AddPaymentMethodActivityStarter;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import android.util.Log;

public class StripePaymentsModule extends ReactContextBaseJavaModule {
    private static final String TAG = "StripePayments";

    private static ReactApplicationContext reactContext;
    private BridgeEphemeralKeyProvider ephemeralKeyProvider;

    private Stripe stripe;
    private Promise paymentPromise, setupPromise, addCardPromise;
    private PaymentSession paymentSession;
    
    private final ActivityEventListener activityListener = new BaseActivityEventListener() {

        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
            //
            //Rewritten according to the official sample
            //https://github.com/stripe-samples/sample-store-android/blob/5ab40e92dc9a2fb1881396dc5050e760d8e27c77/app/src/main/java/com/stripe/android/samplestore/PaymentActivity.kt#L151
            //
            super.onActivityResult(activity, requestCode, resultCode, data);

            boolean isPaymentIntentResult = stripe != null && stripe.onPaymentResult(requestCode, data, new PaymentResultCallback(paymentPromise));
            Log.d(TAG, "onActivityResult: isPaymentIntent=" + isPaymentIntentResult + " data:" + data.toString());
            if(!isPaymentIntentResult) {
                boolean isSetupIntentResult = stripe != null && stripe.onSetupResult(requestCode, data, new SetupResultCallback(setupPromise));
                Log.d(TAG, "onActivityResult: isSetupIntentResult=" + isPaymentIntentResult + " data:" + data.toString());
                if (!isSetupIntentResult && data != null && paymentSession != null) {
                    paymentSession.handlePaymentData(requestCode, resultCode, data);
                }
            }

            /**
             * handle the add payment results (if needed)
             * see: https://github.com/stripe/stripe-android/blob/02f0a75b11143fb9618b482b6b0e2f9b28a9953f/stripe/src/main/java/com/stripe/android/view/PaymentMethodsActivity.kt#L174
             */
            if(requestCode == AddPaymentMethodActivityStarter.REQUEST_CODE && addCardPromise != null) {

                AddPaymentMethodActivityStarter.Result result = AddPaymentMethodActivityStarter.Result.fromIntent(data);

                if(result instanceof AddPaymentMethodActivityStarter.Result.Success) {

                    AddPaymentMethodActivityStarter.Result.Success successResult = (AddPaymentMethodActivityStarter.Result.Success) result;

                    WritableMap map = convertPaymentMethod(successResult.getPaymentMethod());

                    addCardPromise.resolve(map);
                } else if (result instanceof AddPaymentMethodActivityStarter.Result.Canceled) {
                    addCardPromise.reject("StripeModule.cancelled", "");
                } else if (result instanceof AddPaymentMethodActivityStarter.Result.Failure) {

                    AddPaymentMethodActivityStarter.Result.Failure failureResult = (AddPaymentMethodActivityStarter.Result.Failure) result;

                    addCardPromise.reject("StripeModule.failed", failureResult.getException().getMessage());
                }
                else {
                    // no-op
                }

                addCardPromise = null; //release it
            }
        }
    };

    StripePaymentsModule(ReactApplicationContext context) {
        super(context);

        context.addActivityEventListener(activityListener);

        reactContext = context;

        this.ephemeralKeyProvider = new BridgeEphemeralKeyProvider(reactContext);
    }

    @Override
    public String getName() {
        return TAG;
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
        PaymentMethodCreateParams.Card card = new PaymentMethodCreateParams.Card(
                cardParams.getString("number"),
                cardParams.getInt("expMonth"),
                cardParams.getInt("expYear"),
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
                map.putBoolean("liveMode", setupIntent.isLiveMode());
                map.putDouble("created", setupIntent.getCreated());
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

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("PaymentMethod", Collections.unmodifiableMap(new HashMap<String, Object>() {
            {
                for (PaymentMethod.Type type : PaymentMethod.Type.values()) {
                    put(type.code, type.name());
                }
            }
        }));
        return constants;
    }

    @ReactMethod
    public void onEphemeralKeyUpdate(String rawKey) {
        this.ephemeralKeyProvider.onKeyUpdate(rawKey);
    }

    @ReactMethod
    public void onEphemeralKeyUpdateFailure(Integer responseCode, String message) {
        this.ephemeralKeyProvider.onKeyUpdateFailure(responseCode, message);
    }


    @ReactMethod
    public void initCustomerSession() {
        CustomerSession.initCustomerSession(reactContext, this.ephemeralKeyProvider);
    }

    @ReactMethod
    public void createPaymentSession(final ReadableArray paymentMethodTypes) {

        //
        // Stripe Payment Session Listeners work only on the main thread
        //
        UiThreadUtil.runOnUiThread(new Runnable() {
            @Override
            public void run() {

                PaymentSessionConfig.Builder config = new PaymentSessionConfig.Builder()
                
                    // collect shipping information
                    .setShippingInfoRequired(false)

                    // collect shipping method
                    .setShippingMethodsRequired(false);


                //convert the JS enum to Stripe SDK enums
                if (paymentMethodTypes != null) {
                    List<PaymentMethod.Type> result = new ArrayList<PaymentMethod.Type>(paymentMethodTypes.size());
                    for (int i = 0; i < paymentMethodTypes.size(); i++) {
                        result.add(PaymentMethod.Type.valueOf(paymentMethodTypes.getString(i)));
                    }

                    config.setPaymentMethodTypes(result);
                }

                paymentSession = new PaymentSession(
                    (ComponentActivity) getCurrentActivity(),
                    config.build()
                );

                paymentSession.init(
                    new PaymentSession.PaymentSessionListener() {
                        @Override
                        public void onCommunicatingStateChanged(
                            boolean isCommunicating
                        ) {
                            // update UI, such as hiding or showing a progress bar
                        }

                        @Override
                        public void onError(
                            int errorCode,
                            String errorMessage
                        ) {
                            // handle error
                        }

                        @Override
                        public void onPaymentSessionDataChanged(
                            PaymentSessionData data
                        ) { 
                            if (data.isPaymentReadyToCharge()) {
                                final PaymentMethod paymentMethod = data.getPaymentMethod();

                                WritableMap map = convertPaymentMethod(paymentMethod);

                                 //async call the JS land
                                reactContext
                                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                    .emit("stripePaymentMethodSelected", map);
                            }
                        }
                    }
                );
            }
        });
    }

    @ReactMethod
    public void presentPaymentMethodSelection(final String paymentMethodId, final Promise promise) {

        //
        // Stripe Payment Session Listeners work only on the main thread
        //
        UiThreadUtil.runOnUiThread(new Runnable() {
            @Override
            public void run() {

                paymentSession.presentPaymentMethodSelection(paymentMethodId);
            }
        });
    }

    @ReactMethod
    public void addPaymentMethod(String paymentMethodType, final Promise promise) {

        addCardPromise = promise;
        new AddPaymentMethodActivityStarter(getCurrentActivity())
            .startForResult(new AddPaymentMethodActivityStarter.Args.Builder()
                .setPaymentMethodType(PaymentMethod.Type.valueOf(paymentMethodType))
                .setShouldAttachToCustomer(true)
                .setAddPaymentMethodFooter(R.layout.stripe_add_payment_method_footer) //just in case somebody wants to add a footer

                //TODO: make the footer an enum: "other_payment_methods" | "none"
                .build()
            );

        //after the start, capture the other button and listen to it
        //https://developer.android.com/guide/topics/ui/controls/button

//        promise.reject('cancel')
    }

    @ReactMethod
    public void endCustomerSession() {
        CustomerSession.endCustomerSession();
    }

    /**
     * 
     * Convert a payment method to a JS object so it can be sent across the bridge
     * 
     */
    protected WritableMap convertPaymentMethod(PaymentMethod paymentMethod) {

        //finish the promise;
        WritableMap map = Arguments.createMap();
        map.putString("id", paymentMethod.id);
        map.putDouble("created", paymentMethod.created);
        map.putBoolean("liveMode", paymentMethod.liveMode);

        if(paymentMethod.card != null) {

            WritableMap cardMap = Arguments.createMap();
            cardMap.putString("brand", paymentMethod.card.brand.getDisplayName()); //mimic the stripe.js model https://stripe.com/docs/api/cards/object#card_object-brand
            cardMap.putInt("expiryMonth",  paymentMethod.card.expiryMonth);
            cardMap.putInt("expiryYear", paymentMethod.card.expiryYear);
            cardMap.putString("funding", paymentMethod.card.funding);
            cardMap.putString("last4", paymentMethod.card.last4);

            map.putMap("card", cardMap);
        }

        return map;
    }
}
