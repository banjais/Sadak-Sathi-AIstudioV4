import React from 'react';
import { StyleSheet } from 'react-native';
import { Chip, useTheme } from 'react-native-paper';

interface ModeSelectorProps {
  currentMode: 'drive' | 'explore';
  onModeChange: (mode: 'drive' | 'explore') => void;
}

const ModeSelector = ({ currentMode, onModeChange }: ModeSelectorProps) => {
  const theme = useTheme();

  const handlePress = () => {
    const newMode = currentMode === 'drive' ? 'explore' : 'drive';
    onModeChange(newMode);
  };

  return (
    <Chip
      icon={currentMode === 'drive' ? 'car' : 'compass'}
      onPress={handlePress}
      style={[
        styles.chip,
        { backgroundColor: theme.colors.primaryContainer },
      ]}
      textStyle={{ color: theme.colors.onPrimaryContainer, fontWeight: 'bold' }}
    >
      {currentMode === 'drive' ? 'Drive Mode' : 'Explore Mode'}
    </Chip>
  );
};

const styles = StyleSheet.create({
  chip: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    elevation: 4, // for Android shadow
    shadowColor: '#000', // for iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});

export default ModeSelector;
