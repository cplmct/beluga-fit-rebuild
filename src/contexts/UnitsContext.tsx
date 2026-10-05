import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  const [units, setUnits] = useState<{ ownerUserId: string | null; system: UnitSystem }>({
    ownerUserId: null, system: 'imperial',
  });
  const currentUserIdRef = useRef(user?.id ?? null);
  currentUserIdRef.current = user?.id ?? null;
  const requestVersionRef = useRef(0);
  const unitSystem = units.ownerUserId === (user?.id ?? null) ? units.system : 'imperial';

  useEffect(() => {
    const version = ++requestVersionRef.current;
    const ownerUserId = user?.id ?? null;
    setUnits({ ownerUserId, system: 'imperial' });
    if (!ownerUserId) return;
    Promise.resolve(supabase
      .from('profiles')
      .select('unit_system')
      .eq('id', ownerUserId)
      .maybeSingle())
      .then(({ data }) => {
        if (requestVersionRef.current !== version || currentUserIdRef.current !== ownerUserId) return;
        if (data?.unit_system === 'metric') {
          setUnits({ ownerUserId, system: 'metric' });
        } else if (data?.unit_system === 'imperial') {
          setUnits({ ownerUserId, system: 'imperial' });
        }
        // if null/unset, keep the default ('imperial')
      }).catch(() => { /* Keep this account's default; never apply stale units. */ });
    return () => { ++requestVersionRef.current; };
  }, [user?.id]);

  const updateUnitSystem = async (system: UnitSystem) => {
    if (!user) return;
    setUnits({ ownerUserId: user.id, system });
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
