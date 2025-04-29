// src/components/LightBulb.tsx

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';

const LightBulb = () => {
  const [isOn, setIsOn] = useState(false);

  const toggleLight = () => {
    setIsOn(!isOn);
  };

  const bulbImage = isOn ? require('@assets/bulb_on.png') : require('@assets/bulb_off.png');

  return (
    <TouchableOpacity style={styles.container} onPress={toggleLight}>
      <Image source={bulbImage} style={styles.bulb} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bulb: {
    width: 100,
    height: 150,
    resizeMode: 'contain',
  },
});

export default LightBulb;
