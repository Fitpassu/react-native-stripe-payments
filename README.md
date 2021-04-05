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

### Setup

First of all you have to obtain Stripe account [publishabe key](https://stripe.com/docs/keys). And then you need to set it for module.

```javascript
import stripe from 'react-native-stripe-payments';

stripe.setOptions({ publishingKey: 'STRIPE_PUBLISHING_KEY' });
```

### Validate the given card details

```javascript
import stripe from 'react-native-stripe-payments';

const isCardValid = stripe.isCardValid({
  number: '4242424242424242',
  expMonth: 10,
  expYear: 21,
  cvc: '888',
});
```

### One-time payments

```javascript
import stripe from 'react-native-stripe-payments';

const cardDetails = {
  number: '4242424242424242',
  expMonth: 10,
  expYear: 21,
  cvc: '888',
}
stripe.confirmPayment('client_secret_from_backend', cardDetails)
  .then(result => {
    // result of type PaymentResult
  })
  .catch(err =>
    // error performing payment
  )
```

### Reusing cards

Not supported yet, though as we're highly invested in development of our product which depends on this library we'll do it as soon as possible!

## Development and contribution

### Demo app

* To make it convenient to develop this library there is a React Native app `demo`.
* Developed `react-native-stripe-payments` module is imported via `metro` JS bundler as extra node module.
* If native code is changed demo app is required to be recompiled.
* If `react-native-stripe-payments` typescript code is changed JS module need to be recompiled (just run `tsc` in root directory). Recompiled JS files are seen by metro and module is hot reloaded.

### Demo server

To start local web server which mocks server side behaviour execute `yarn server` from `demo` directory. 
