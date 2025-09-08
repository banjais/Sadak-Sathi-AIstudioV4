import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Modal, Portal, TextInput, Button, useTheme, Text } from 'react-native-paper';
import { reportIncident } from '../../api/incidentsApi';

interface ReportIncidentModalProps {
  visible: boolean;
  onDismiss: () => void;
}

const ReportIncidentModal = ({ visible, onDismiss }: ReportIncidentModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const handleSubmit = async () => {
    if (!title || !description) {
      Alert.alert('Validation Error', 'Please fill in both title and description.');
      return;
    }

    setLoading(true);
    try {
      // In a real app, we'd get the current location from props or a global state
      const mockLocation = { latitude: 27.7172, longitude: 85.3240 };
      
      await reportIncident({
        title,
        description,
        latitude: mockLocation.latitude,
        longitude: mockLocation.longitude,
      });

      Alert.alert('Success', 'Thank you for your report. It has been submitted for review.');
      setTitle('');
      setDescription('');
      onDismiss();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit the report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    backgroundColor: theme.colors.surface,
    padding: 20,
    margin: 20,
    borderRadius: 10,
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={containerStyle}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>Report an Incident</Text>
        <TextInput
          label="Title (e.g., Traffic Jam, Accident)"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.input}
        />
        <View style={styles.buttonContainer}>
          <Button onPress={onDismiss} disabled={loading} textColor={theme.colors.onSurfaceVariant}>
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.submitButton}
          >
            Submit Report
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  submitButton: {
    marginLeft: 8,
  }
});

export default ReportIncidentModal;
