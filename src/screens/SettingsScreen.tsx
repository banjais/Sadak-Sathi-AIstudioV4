import React from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { List, Switch, Card, Title, useTheme, RadioButton } from 'react-native-paper';

const SettingsScreen = () => {
  const [isVoiceResponseOn, setIsVoiceResponseOn] = React.useState(true);
  const [personalityExpanded, setPersonalityExpanded] = React.useState(false);
  const [selectedPersonality, setSelectedPersonality] = React.useState('Friendly');
  const theme = useTheme();

  const personalities = [
    { key: 'Friendly', title: 'Friendly', description: 'A warm and approachable companion, uses casual language and emojis.' },
    { key: 'Formal', title: 'Formal', description: 'A professional and direct assistant, provides clear and concise information.' },
    { key: 'Guide', title: 'Guide', description: 'An informative tour guide, offers details about landmarks and points of interest.' },
    { key: 'Driver\'s Buddy', title: 'Driver\'s Buddy', description: 'A supportive co-pilot, focused on safety, encouragement, and route assistance.' },
  ];
  
  const createAlert = (title: string, message: string) => {
    Alert.alert(title, message, [{ text: "OK" }]);
  }

  return (
    <ScrollView style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <Card style={styles.card}>
        <Card.Content>
            <Title>AI Settings</Title>
            <List.Section>
                <List.Accordion
                  title="Personality"
                  description={selectedPersonality}
                  left={props => <List.Icon {...props} icon="account-heart-outline" />}
                  expanded={personalityExpanded}
                  onPress={() => setPersonalityExpanded(!personalityExpanded)}
                >
                  <RadioButton.Group onValueChange={newValue => setSelectedPersonality(newValue)} value={selectedPersonality}>
                    {personalities.map(p => (
                       <List.Item
                        key={p.key}
                        title={p.title}
                        description={p.description}
                        descriptionNumberOfLines={3}
                        onPress={() => setSelectedPersonality(p.key)}
                        left={() => <RadioButton value={p.key} />}
                        />
                    ))}
                  </RadioButton.Group>
                </List.Accordion>
                <List.Item
                title="Avatar"
                description="Customize Appearance"
                left={() => <List.Icon icon="face-man-profile" />}
                onPress={() => createAlert('Avatar', 'This will open the avatar customization screen.')}
                />
                 <List.Item
                    title="AI Voice Response"
                    left={() => <List.Icon icon="microphone-outline" />}
                    right={() => <Switch value={isVoiceResponseOn} onValueChange={setIsVoiceResponseOn} />}
                />
            </List.Section>
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
            <Title>Navigation</Title>
            <List.Section>
                <List.Item
                title="Route Preferences"
                description="Highways, tolls, scenic..."
                left={() => <List.Icon icon="routes" />}
                onPress={() => createAlert('Route Preferences', 'This will open a modal to manage your route preferences.')}
                />
                <List.Item
                title="Offline Maps"
                description="Manage maps for offline use"
                left={() => <List.Icon icon="download-outline" />}
                onPress={() => createAlert('Offline Maps', 'This will open the offline map management screen.')}
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
  },
  card: {
      marginHorizontal: 16,
      marginTop: 16,
  }
});

export default SettingsScreen;
