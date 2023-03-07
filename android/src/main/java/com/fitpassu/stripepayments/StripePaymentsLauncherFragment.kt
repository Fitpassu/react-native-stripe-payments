package com.fitpassu.stripepayments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.stripe.android.ApiResultCallback
import com.stripe.android.Stripe
import com.stripe.android.model.ConfirmPaymentIntentParams
import com.stripe.android.model.PaymentIntent
import com.stripe.android.model.StripeIntent
import com.stripe.android.payments.paymentlauncher.PaymentLauncher
import com.stripe.android.payments.paymentlauncher.PaymentResult

class StripePaymentsLauncherFragment(
    private val stripe: Stripe,
    private val publishableKey: String,
    private val promise: Promise,
    private val confirmParams: ConfirmPaymentIntentParams
) : Fragment() {

    private lateinit var paymentLauncher: PaymentLauncher

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        paymentLauncher = PaymentLauncher.create(this, publishableKey, null) { result ->
            when (result) {
                is PaymentResult.Completed -> {
                    stripe.retrievePaymentIntent(
                        confirmParams.clientSecret,
                        null,
                        listOf("payment_method"),
                        PaymentResultCallback(promise)
                    )
                }
                is PaymentResult.Canceled, is PaymentResult.Failed -> {
                    promise.reject(StripeModuleResult.FAILED.code, result.toString())
                }
            }
        }
        paymentLauncher.confirm(confirmParams)
        return FrameLayout(requireActivity()).apply {
            isVisible = false
        }
    }

    private class PaymentResultCallback(val promise: Promise) : ApiResultCallback<PaymentIntent> {

        override fun onSuccess(result: PaymentIntent) {
            when (val status = result.status) {
                StripeIntent.Status.Succeeded, StripeIntent.Status.Processing -> {
                    promise.resolve(
                        Arguments.createMap().apply {
                            putString("id", result.id)
                            putString("paymentMethodId", result.paymentMethodId)
                        }
                    )
                }
                StripeIntent.Status.Canceled -> {
                    promise.reject(StripeModuleResult.CANCELLED.code, "")
                }
                else -> {
                    promise.reject(StripeModuleResult.FAILED.code, status.toString())
                }
            }
        }

        override fun onError(e: Exception) {
            promise.reject(StripeModuleResult.FAILED.code, e.toString())
        }
    }
}
