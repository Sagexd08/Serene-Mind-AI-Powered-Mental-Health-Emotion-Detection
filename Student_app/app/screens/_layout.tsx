import React from 'react';
import { Stack } from 'expo-router';

export default function ScreenLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        animationTypeForReplace: true,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Chatbot',
        }}
      />
      <Stack.Screen
        name="LiveKitVoiceChat"
        options={{
          title: 'Voice Chat',
          animationEnabled: true,
        }}
      />
    </Stack>
  );
}
