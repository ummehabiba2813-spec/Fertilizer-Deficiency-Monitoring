import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    language: "English",
    themeDark: false,
    unit: "Hectare",
    notifications: true,
    offlineMode: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const s = await AsyncStorage.getItem("@app_settings");
      if (s) setSettings(JSON.parse(s));
    } catch (e) {}
  };

  const saveSettings = async (newValues) => {
    const s = { ...settings, ...newValues };
    setSettings(s);
    await AsyncStorage.setItem("@app_settings", JSON.stringify(s));
  };

  return (
    <SettingsContext.Provider value={{ settings, saveSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}
