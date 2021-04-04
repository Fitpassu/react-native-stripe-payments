import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function App() {

  initStripe = async () => {
    const { default: stripe } = await import('react-native-stripe-payments');
    stripe.setOptions({ publishingKey: 'STRIPE_PUBLISHING_KEY' });
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <TouchableOpacity onPress={() => this.initStripe()}>
        <Text>Init Stripe</Text>
      </TouchableOpacity>
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
