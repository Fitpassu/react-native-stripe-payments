package com.fitpassu.stripepayments

enum class StripeModuleResult(val code: String) {
    CANCELLED("StripeModule.cancelled"),
    FAILED("StripeModule.failed")
}
