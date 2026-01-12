import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface UserSettings {
  has_shown_first_success?: boolean;
  language?: string;
  [key: string]: any;
}

export function useUserSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !supabase) {
      setSettings({});
      setLoading(false);
      return;
    }

    const client = supabase;
    const loadSettings = async () => {
      try {
        const { data, error } = await client
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setSettings(data.settings || {});
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    if (!user || !supabase) return;

    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          settings: updatedSettings,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }, [user, settings]);

  const getSetting = useCallback((key: string, defaultValue: any = null) => {
    return settings[key] !== undefined ? settings[key] : defaultValue;
  }, [settings]);

  return { settings, updateSettings, getSetting, loading };
}
