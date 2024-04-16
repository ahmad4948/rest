import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [otp, setOTP] = useState('');

  const regularLogin = async () => {
    try {
      const response = await fetch('http://192.168.122.53:4000/login', { // Updated server port
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success) {
        setErrorMessage('');
        setAuthenticated(true);
        setOTP(data.otp); // Update state with OTP received from the server
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleFingerprintLogin = async () => {
    try {
      const { success } = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to login',
      });

      if (success) {
     //   Alert.alert('Authenticated');
                  Alert.alert("OTP: "+otp);
        setErrorMessage('');
        setAuthenticated(true);
      } else {
        setErrorMessage('Fingerprint authentication failed');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <View style={styles.container}>
      {!authenticated && (
        <>
          <Text style={styles.title}>Login</Text>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Button title="Login" onPress={regularLogin} />
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        </>
      )}
      {authenticated && (
        <View style={styles.authenticatedContainer}>
          <Text style={styles.successMessage}>Credentials Authenticated</Text>
     
          <View style={styles.buttonContainer}>
            <Button title="Fingerprint Login" onPress={handleFingerprintLogin} />
          </View>
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  errorMessage: {
    color: 'red',
    marginTop: 10,
  },
  successMessage: {
    color: 'green',
    marginTop: 10,
    textAlign: 'center', // Center the "Credentials Authenticated" text
  },
  otpMessage: {
    marginTop: 10,
    fontSize: 16,
  },
  authenticatedContainer: {
    alignItems: 'center',
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default LoginScreen;
