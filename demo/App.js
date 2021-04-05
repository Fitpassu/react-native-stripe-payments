import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View, Button } from 'react-native';

export default function App() {

  initStripe = async () => {
    const { STRIPE_PAYMENTS_APP_KEY } = require('./secrets');
    const { default: stripe } = await import('react-native-stripe-payments');
    stripe.setOptions({ publishingKey: STRIPE_PAYMENTS_APP_KEY });
  }

  makePayment = async (isCardNeedConfirm) => {
    const { default: stripe } = await import('react-native-stripe-payments');

    const response = await fetch("http://localhost:8000/pay", { method: 'get' })
    let res = await response.json();
    console.log(res);

    const cardDetails = {
      number: isCardNeedConfirm ? '4000002500003155' : '4242424242424242',
      expMonth: 12,
      expYear: 25,
      cvc: '888',
    };
    let result = await stripe.confirmPayment(res.client_secret, cardDetails);
    console.log(result);
  }

  this.initStripe();
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Button
        onPress={() => this.makePayment(false)}
        title="Make payment"
        color="#42409E"
      />
      <Button
        onPress={() => this.makePayment(true)}
        title="Make payment with card confirmation"
        color="#42409E"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
