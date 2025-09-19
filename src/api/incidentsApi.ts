// In a real production app, you would have a secure backend handle this.
// For this setup, we'll call a Google Apps Script Web App URL directly.
// IMPORTANT: The user must deploy their own Apps Script to a URL and add it
// to their environment variables as GOOGLE_SHEET_WEB_APP_URL.

interface IncidentReportPayload {
    timestamp: string;
    latitude: number;
    longitude: number;
    incidentType: string;
    description: string;
    hasPhoto: boolean;
}

/**
 * Submits an incident report to a configured Google Apps Script endpoint.
 * @param report The report data from the modal.
 * @returns A promise that resolves to an object indicating success.
 */
export const submitIncidentReport = async (report: any): Promise<{ success: boolean; message?: string }> => {
    const url = (typeof process !== 'undefined' && process.env && process.env.GOOGLE_SHEET_WEB_APP_URL)
        ? process.env.GOOGLE_SHEET_WEB_APP_URL
        : undefined;
        
    // This guard ensures the app does not crash in environments where process.env is not defined.
    if (!url) {
        console.warn('GOOGLE_SHEET_WEB_APP_URL is not configured. Incident reports will be simulated.');
        // In a development environment, we can return success to not block the UI.
        return { success: true, message: 'Submission skipped (dev mode).' };
    }

    const payload: IncidentReportPayload = {
        timestamp: new Date().toISOString(),
        latitude: report.location.lat,
        longitude: report.location.lng,
        incidentType: report.incidentType,
        description: report.description,
        hasPhoto: !!report.photo,
    };

    try {
        // NOTE: We use 'no-cors' mode because Apps Script web apps often don't
        // handle CORS preflight requests correctly. This means we can't read
        // the response body, so we optimistically assume success.
        await fetch(url, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8', // Apps Script can be picky, text/plain is safer
            },
            body: JSON.stringify(payload),
        });

        return { success: true };
    } catch (error) {
        console.error('Failed to submit incident report:', error);
        return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
};