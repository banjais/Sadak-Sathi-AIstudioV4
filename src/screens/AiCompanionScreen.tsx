import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Paragraph, Title, List, useTheme } from 'react-native-paper';

const AiCompanionScreen = () => {
  const theme = useTheme();
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>AI Companion (Coming Soon)</Title>
          <Paragraph style={styles.paragraph}>
            This screen will house the interactive AI chat, proactive health reminders, and your personalized driver's buddy features.
          </Paragraph>
          <List.Section>
            <List.Subheader>Features to be Implemented:</List.Subheader>
            <List.Item
              title="Voice Interaction (STT/TTS)"
              left={() => <List.Icon icon="microphone-outline" />}
            />
            <List.Item
              title="Driver Health & Safety Checks"
              left={() => <List.Icon icon="heart-pulse" />}
            />
            <List.Item
              title="Trip & Belongings Reminders"
              left={() => <List.Icon icon="briefcase-check-outline" />}
            />
            <List.Item
              title="Personalized AI Behavior"
              left={() => <List.Icon icon="brain" />}
            />
          </List.Section>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginTop: 8,
  },
  paragraph: {
      marginBottom: 10,
  }
});

export default AiCompanionScreen;