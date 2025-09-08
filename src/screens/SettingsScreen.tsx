import React from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { List, Switch, Divider, Card, Title, useTheme } from 'react-native-paper';

const SettingsScreen = () => {
  const [isVoiceResponseOn, setIsVoiceResponseOn] = React.useState(true);
  const theme = useTheme();
  
  const createAlert = (title: string, message: string) => {
    Alert.alert(title, message, [{ text: "OK" }]);
  }

  return (
    <ScrollView style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <Card style={styles.card}>
        <Card.Content>
            <Title>AI Settings</Title>
            <List.Section>
                <List.Item
                title="Personality"
                description="Friendly"
                left={() => <List.Icon icon="account-heart-outline" />}
                onPress={() => createAlert('AI Personality', 'This will open settings to change the AI persona (e.g., Formal, Guide, Driver\'s Buddy).')}
                />
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