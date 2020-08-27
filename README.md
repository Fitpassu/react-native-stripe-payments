![React Native Stripe payments](https://raw.githubusercontent.com/Fitpassu/react-native-stripe-payments/master/react-native-stripe-payments.png)

A well typed React Native library providing support for Stripe payments on both iOS and Android.

# React Native Stripe payments

## Getting started

> Starting September 14, 2019 new payments regulation is being rolled out in Europe, which mandates Strong Customer Authentication (SCA) for many online payments in the European Economic Area (EEA). SCA is part of the second Payment Services Directive (PSD2).

This library provides simple way to integrate SCA compliant Stripe payments into your react native app with a first class Typescript support.

### Installation

`$ yarn add react-native-stripe-payments`

`$ npx react-native link react-native-stripe-payments`

The library ships with platform native code that needs to be compiled together with React Native. This requires you to configure your build tools which can be done with [autolinking](https://github.com/react-native-community/cli/blob/master/docs/autolinking.md).

## Usage

To use the module, import it first.

```javascript
import stripe from 'react-native-stripe-payments';
```

### Setup

First of all you have to obtain a Stripe account [publishable key](https://stripe.com/docs/keys), which you need to set it for the module.

```javascript
stripe.setOptions({ publishingKey: 'STRIPE_PUBLISHING_KEY' });
```

### Validate the given card details

```javascript
const isCardValid = stripe.isCardValid({
  number: '4242424242424242',
  expMonth: 10,
  expYear: 21,
  cvc: '888',
});
```
The argument for `isCardValid` is of type `CardParams`, which is used across the other APIs.

### Set up a payment method for future payments (Setup Intent)

```javascript
stripe.confirmSetup('client_secret_from_backend', cardParams)
  .then(result => {
    // result of type SetupIntentResult
    // {
    //    paymentMethodId,
    //    liveMode,
    //    last4,
    //    created,
    //    brand
    // }
  })
  .catch(err =>
    // error performing payment
  )
```
The `brand` is the provider of the card, and we use the [module](https://www.npmjs.com/package/credit-card-type) `credit-card-type` to achieve that. 

### One-time payment using the `id` of a `PaymentMethod`

```javascript
stripe.confirmPaymentWithPaymentMethodId('client_secret_from_backend', paymentMethodId)
  .then(result => {
    // result of type PaymentResult
    // {
    //    id,
    //    paymentMethodId
    // }
  })
  .catch(err =>
    // error performing payment
  )
```

### One-time payment using `cardParams`

```javascript
const cardDetails = {
  number: '4242424242424242',
  expMonth: 10,
  expYear: 21,
  cvc: '888',
}
stripe.confirmPaymentWithCardParams('client_secret_from_backend', cardParams)
  .then(result => {
    // result of type PaymentResult
    // {
    //    id,
    //    paymentMethodId
    // }
  })
  .catch(err =>
    // error performing payment
  )
```

### Reusing cards

Not supported yet, though as we're highly invested in development of our product which depends on this library we'll do it as soon as possible!
