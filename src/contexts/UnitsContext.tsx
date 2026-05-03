import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

type UnitSystem = 'metric' | 'imperial';

interface UnitsContextType {
  unitSystem: UnitSystem;
  weightUnit: string;
  lengthUnit: string;
  updateUnitSystem: (system: UnitSystem) => Promise<void>;
}

const UnitsContext = createContext<UnitsContextType | undefined>(undefined);

export function UnitsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('imperial');

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('unit_system')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.unit_system === 'metric') {
          setUnitSystem('metric');
        } else if (data?.unit_system === 'imperial') {
          setUnitSystem('imperial');
        }
        // if null/unset, keep the default ('imperial')
      });
  }, [user?.id]);

  const updateUnitSystem = async (system: UnitSystem) => {
    setUnitSystem(system);
    if (!user) return;
    await supabase
      .from('profiles')
      .upsert({ id: user.id, unit_system: system });
  };

  const weightUnit = unitSystem === 'metric' ? 'kg' : 'lbs';
  const lengthUnit = unitSystem === 'metric' ? 'cm' : 'in';

  return (
    <UnitsContext.Provider value={{ unitSystem, weightUnit, lengthUnit, updateUnitSystem }}>
      {children}
    </UnitsContext.Provider>
  );
}

export function useUnits() {
  const context = useContext(UnitsContext);
  if (!context) throw new Error('useUnits must be used within UnitsProvider');
  return context;
}
