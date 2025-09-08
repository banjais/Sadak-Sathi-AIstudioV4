// This is a placeholder for the incidents API.
// In a real application, this would make network requests to a backend server.

export interface Incident {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description: string;
}

/**
 * Fetches incidents from the API.
 * TODO: Replace this mock implementation with a real fetch call to your backend.
 */
export const getIncidents = async (): Promise<Incident[]> => {
  console.log('Fetching incidents from mock API...');
  // Simulate a network request delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock data representing incidents in Nepal for demonstration
  return [
    {
      id: '1',
      latitude: 27.7172,
      longitude: 85.3240,
      title: 'Traffic Jam',
      description: 'Heavy traffic jam near Ratna Park.'
    },
    {
      id: '2',
      latitude: 27.6896,
      longitude: 85.3157,
      title: 'Road Closure',
      description: 'Road closed at Kalanki Chowk due to construction.'
    },
    {
      id: '3',
      latitude: 27.7385,
      longitude: 85.3355,
      title: 'Accident Reported',
      description: 'Minor accident at Chabahil. Expect delays.'
    },
  ];
};

/**
 * Reports a new incident to the API.
 */
export const reportIncident = async (
  incident: Omit<Incident, 'id'>
): Promise<Incident> => {
  console.log('Reporting incident:', incident);
  // Simulate a network request
  await new Promise(resolve => setTimeout(resolve, 1000));
  const newIncident: Incident = {
    id: String(Math.random()),
    ...incident,
  };
  return newIncident;
};
