import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { withAccountTransitionLock } from '../utils/accountTransition';
import { readPendingAccountCleanup } from '../utils/accountCleanup';

type UnitSystem = 'metric' | 'imperial';

interface UnitsContextType {
  unitSystem: UnitSystem;
  weightUnit: string;
  lengthUnit: string;
  updateUnitSystem: (system: UnitSystem) => Promise<void>;
  unitsError: string;
  unitsBusy: boolean;
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
  const writeRef = useRef<{ ownerUserId: string; version: number } | null>(null);
  const [writeStatus, setWriteStatus] = useState({ ownerUserId: '', busy: false, error: '' });
  const unitsError = writeStatus.ownerUserId === user?.id ? writeStatus.error : '';
  const unitsBusy = writeStatus.ownerUserId === user?.id && writeStatus.busy;
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
    const ownerUserId = user.id;
    if (writeRef.current?.ownerUserId === ownerUserId) return;
    const version = ++requestVersionRef.current;
    const request = { ownerUserId, version };
    writeRef.current = request;
    const current = () => currentUserIdRef.current === ownerUserId && requestVersionRef.current === version;
    setWriteStatus({ ownerUserId, busy: true, error: '' });
    try {
      await withAccountTransitionLock(async () => {
        const marker = await readPendingAccountCleanup();
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (!current() || marker || sessionError || session?.user.id !== ownerUserId) throw new Error('Account changed.');
        const { error } = await supabase.from('profiles').upsert({ id: ownerUserId, unit_system: system });
        if (error) throw error;
        if (current()) setUnits({ ownerUserId, system });
      });
      if (current()) setWriteStatus({ ownerUserId, busy: false, error: '' });
    } catch {
      if (current()) setWriteStatus({ ownerUserId, busy: false, error: 'Couldn’t save units. Your previous units are unchanged. Tap the unit option to retry.' });
    } finally {
      if (writeRef.current === request) writeRef.current = null;
    }
  };

  const weightUnit = unitSystem === 'metric' ? 'kg' : 'lbs';
  const lengthUnit = unitSystem === 'metric' ? 'cm' : 'in';

  return (
    <UnitsContext.Provider value={{ unitSystem, weightUnit, lengthUnit, updateUnitSystem, unitsError, unitsBusy }}>
      {children}
    </UnitsContext.Provider>
  );
}

export function useUnits() {
  const context = useContext(UnitsContext);
  if (!context) throw new Error('useUnits must be used within UnitsProvider');
  return context;
}
