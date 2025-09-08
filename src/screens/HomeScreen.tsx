import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import MapView from '../components/map/MapView';
import FABMenu from '../components/ui/FABMenu';
import ModeSelector from '../components/ui/ModeSelector';
import { RootTabParamList } from '../navigation/AppNavigator';
import ReportIncidentModal from '../components/modals/ReportIncidentModal';

type Mode = 'drive' | 'explore';

const HomeScreen = () => {
  const [mode, setMode] = useState<Mode>('drive');
  const [isReportModalVisible, setReportModalVisible] = useState(false);
  const navigation = useNavigation<NavigationProp<RootTabParamList>>();

  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: { display: mode === 'drive' ? 'none' : 'flex' },
    });
  }, [mode, navigation]);

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
  };

  const openReportModal = () => setReportModalVisible(true);
  const closeReportModal = () => setReportModalVisible(false);

  return (
    <View style={styles.container}>
      <MapView />
      {mode === 'drive' && <FABMenu onReportIncident={openReportModal} />}
      <ModeSelector currentMode={mode} onModeChange={handleModeChange} />
      <ReportIncidentModal
        visible={isReportModalVisible}
        onDismiss={closeReportModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default HomeScreen;
