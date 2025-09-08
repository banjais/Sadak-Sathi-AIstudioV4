import * as React from 'react';
import { FAB, Portal, useTheme } from 'react-native-paper';
import { Linking, Alert } from 'react-native';

interface FABMenuProps {
  onReportIncident: () => void;
}

const FABMenu = ({ onReportIncident }: FABMenuProps) => {
  const [state, setState] = React.useState({ open: false });
  const onStateChange = ({ open }: { open: boolean }) => setState({ open });
  const { open } = state;
  const theme = useTheme();
  
  const handleFindMyCar = () => {
     Alert.alert(
      "Find My Car",
      "This will show the location where you last parked your car.",
      [{ text: "OK" }]
    );
  }

  return (
    <Portal>
      <FAB.Group
        open={open}
        visible
        icon={open ? 'close' : 'plus'}
        actions={[
          {
            icon: 'phone',
            label: 'Call Emergency',
            onPress: () => Linking.openURL('tel:100').catch(err => console.error('Failed to open URL:', err)),
            labelTextColor: theme.colors.onSurface,
            color: theme.colors.error,
            style: { backgroundColor: theme.colors.surface },
          },
          {
            icon: 'alert-decagram',
            label: 'Report Incident',
            onPress: onReportIncident, // Use the passed function
            labelTextColor: theme.colors.onSurface,
            style: { backgroundColor: theme.colors.surface },
          },
          {
            icon: 'car-search',
            label: 'Find My Car',
            onPress: handleFindMyCar,
            labelTextColor: theme.colors.onSurface,
            style: { backgroundColor: theme.colors.surface },
          },
        ]}
        onStateChange={onStateChange}
      />
    </Portal>
  );
};

export default FABMenu;
