![React Native Stripe payments](https://raw.githubusercontent.com/Fitpassu/react-native-stripe-payments/master/react-native-stripe-payments.png)
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-3-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

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

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="http://www.lukebrandonfarrell.com"><img src="https://avatars3.githubusercontent.com/u/18139277?v=4" width="100px;" alt=""/><br /><sub><b>Luke Brandon Farrell</b></sub></a><br /><a href="https://github.com/aspect-apps/react-native-stripe-payments/commits?author=lukebrandonfarrell" title="Code">💻</a> <a href="#infra-lukebrandonfarrell" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#projectManagement-lukebrandonfarrell" title="Project Management">📆</a></td>
    <td align="center"><a href="https://github.com/ChesterSim"><img src="https://avatars2.githubusercontent.com/u/12388321?v=4" width="100px;" alt=""/><br /><sub><b>Chester Sim</b></sub></a><br /><a href="https://github.com/aspect-apps/react-native-stripe-payments/commits?author=ChesterSim" title="Documentation">📖</a> <a href="https://github.com/aspect-apps/react-native-stripe-payments/commits?author=ChesterSim" title="Code">💻</a></td>
    <td align="center"><a href="https://jramogh.co"><img src="https://avatars3.githubusercontent.com/u/31567169?v=4" width="100px;" alt=""/><br /><sub><b>Amogh Jahagirdar</b></sub></a><br /><a href="https://github.com/aspect-apps/react-native-stripe-payments/commits?author=amogh-jrules" title="Documentation">📖</a> <a href="https://github.com/aspect-apps/react-native-stripe-payments/commits?author=amogh-jrules" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!