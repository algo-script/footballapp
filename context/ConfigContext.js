import React, { createContext, useState, useEffect } from 'react';
import { getRemoteConfig } from '@react-native-firebase/remote-config';

export const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
  const [configData, setConfigData] = useState(null);

  useEffect(() => {
    const fetchRemoteConfig = async () => {
      try {
        // Automatically uses the default app initialized by google-services.json
        const rc = getRemoteConfig();
        
        await rc.setConfigSettings({
          minimumFetchIntervalMillis: 1000,
        });
        await rc.fetchAndActivate();
        
        const raw = rc.getValue('redirect_url').asString();
        
        if (raw) {
            const data = JSON.parse(raw);
            if (data && typeof data === 'object') {
                setConfigData(data);
                console.log("Firebase Remote Config Loaded successfully!");
            }
        }
      } catch (error) {
        console.warn('Error fetching Remote Config. Details:', error.message);
      }
    };
    
    fetchRemoteConfig();
  }, []);

  return (
    <ConfigContext.Provider value={{ configData }}>
      {children}
    </ConfigContext.Provider>
  );
};

