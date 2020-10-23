package com.fitpassu.stripepayments;

import com.stripe.android.EphemeralKeyProvider;
import com.stripe.android.EphemeralKeyUpdateListener;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.UiThreadUtil;


/** 
 *
 * Ephemeral Key Provider that works with the JS thread through the bridge
 *
 */
public class BridgeEphemeralKeyProvider implements EphemeralKeyProvider, EphemeralKeyUpdateListener {
    private ReactApplicationContext reactContext;
    private EphemeralKeyUpdateListener pendingKeyUpdateListener; //will hold the key update listener between the time when the event is raised and the JS responds back with the key

    //save the context for future use
    BridgeEphemeralKeyProvider(ReactApplicationContext context) {
        this.reactContext = context;
    }

    @Override
    public void createEphemeralKey(
            String apiVersion,
            final EphemeralKeyUpdateListener keyUpdateListener) {

        //build params to send to the JS thread
        WritableMap params = Arguments.createMap();
        params.putString("apiVersion", apiVersion);

        this.pendingKeyUpdateListener = keyUpdateListener;

        //async call the JS land
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit("stripeCreateEphemeralKey", params);
    }

    /**
     *
     * Called from the JS land once we have the key
     *
     */
    @Override
    public void onKeyUpdate(final String stripeResponseJson){
        if(this.pendingKeyUpdateListener != null) {
            final EphemeralKeyUpdateListener keyUpdateListener = pendingKeyUpdateListener;

            //
            // we need to make sure the listener is updated on the UI thread
            //
            UiThreadUtil.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    keyUpdateListener.onKeyUpdate(stripeResponseJson);
                }});

            this.pendingKeyUpdateListener = null; //avoid memory leaks. the listener is not used anymore
        }
    }


    /**
     *
     * Called from the JS land once we have the key
     *
     */
    @Override
    public void onKeyUpdateFailure(final int responseCode, final String message) {
        if(this.pendingKeyUpdateListener != null) {
            final EphemeralKeyUpdateListener keyUpdateListener = pendingKeyUpdateListener;

            //
            // we need to make sure the listener is updated on the UI thread
            //
            UiThreadUtil.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    keyUpdateListener.onKeyUpdateFailure(responseCode, message);
                }});

            this.pendingKeyUpdateListener = null; //avoid memory leaks. the listener is not used anymore
        }
    }
}