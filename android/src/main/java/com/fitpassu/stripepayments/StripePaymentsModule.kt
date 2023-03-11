package com.fitpassu.stripepayments

import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.*
import com.stripe.android.PaymentConfiguration
import com.stripe.android.Stripe
import com.stripe.android.model.ConfirmPaymentIntentParams
import com.stripe.android.model.PaymentMethodCreateParams

class StripePaymentsModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    private lateinit var stripe: Stripe

    override fun getName() = "StripePayments"

    @ReactMethod(isBlockingSynchronousMethod = true)
    fun init(publishableKey: String) {
        PaymentConfiguration.init(reactContext, publishableKey)
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    fun isCardValid(cardParams: ReadableMap): Boolean {
        CardMultilineWidget(currentActivity!!).run {
            setCardNumber(cardParams.getString("number"))
            setCvcCode(cardParams.getString("cvc"))
            setExpiryDate(
                year = cardParams.getInt("expYear"),
                month = cardParams.getInt("expMonth")
            )
            return validateAllFields()
        }
    }

    @ReactMethod
    fun confirmPayment(secret: String, cardParams: ReadableMap, promise: Promise) {
        val paymentConfig = PaymentConfiguration.getInstance(reactContext)
        stripe = Stripe(
            reactContext,
            paymentConfig.publishableKey,
            paymentConfig.stripeAccountId
        )
        val card = PaymentMethodCreateParams.Card(
            cardParams.getString("number"),
            cardParams.getInt("expMonth"),
            cardParams.getInt("expYear"),
            cardParams.getString("cvc"),
            null,
            null
        )
        val confirmParams = ConfirmPaymentIntentParams.createWithPaymentMethodCreateParams(
            PaymentMethodCreateParams.create(card),
            secret
        )
        val fragment = StripePaymentsLauncherFragment(
            stripe,
            paymentConfig.publishableKey,
            promise,
            confirmParams
        )
        presentPaymentsLauncherFragment(fragment, promise)
    }

    private fun presentPaymentsLauncherFragment(
        fragment: StripePaymentsLauncherFragment,
        promise: Promise
    ) {
        try {
            val manager = (currentActivity as? FragmentActivity)?.supportFragmentManager
                ?: throw IllegalStateException("Could not retrieve activity's fragment manager")
            manager
                .beginTransaction()
                .add(fragment, "fitpassu.stripepayments:payment_launcher_fragment")
                .commit()
        } catch (t: Throwable) {
            promise.reject(StripeModuleResult.FAILED.code, t.toString())
        }
    }
}
