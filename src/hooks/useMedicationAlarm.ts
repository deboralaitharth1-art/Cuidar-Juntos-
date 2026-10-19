import { useState, useEffect, useRef, useCallback } from 'react';
import { MedicationItem } from '../types';
import { playMedicationChime, sendLocalNotification, requestNotificationPermission } from '../utils/soundAlert';

export interface ActiveAlarmState {
  medication: MedicationItem;
  time: string;
}

export function useMedicationAlarm(
  medications: MedicationItem[],
  onMarkTaken: (medId: string, time: string) => void,
  onShowToast: (msg: string) => void
) {
  const [activeAlarm, setActiveAlarm] = useState<ActiveAlarmState | null>(null);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(() => {
    return localStorage.getItem('cuidabem_alarm_muted') === 'true';
  });

  // Track triggered alarms for today to prevent repeated alerts within the same minute
  // key: "YYYY-MM-DD_medId_HH:mm"
  const triggeredAlarmsRef = useRef<Set<string>>(new Set());
  // Snooze registry: key -> timestamp until when snoozed
  const snoozeRegistryRef = useRef<Map<string, number>>(new Map());

  // Request browser notification permission once on initial interaction
  useEffect(() => {
    requestNotificationPermission().catch(() => {});
  }, []);

  // Check medication times
  const checkSchedules = useCallback(() => {
    const now = new Date();
    const currentHour = String(now.getHours()).padStart(2, '0');
    const currentMinute = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHour}:${currentMinute}`;
    const todayStr = now.toISOString().split('T')[0];

    for (const med of medications) {
      if (!med.horarios || med.horarios.length === 0) continue;

      for (const time of med.horarios) {
        const triggerKey = `${todayStr}_${med.id}_${time}`;
        const snoozeKey = `${med.id}_${time}`;

        // Check if currently snoozed
        const snoozedUntil = snoozeRegistryRef.current.get(snoozeKey);
        if (snoozedUntil && Date.now() < snoozedUntil) {
          continue;
        }

        // Check if time matches current clock and has not been taken today
        const isTimeMatch = time === currentTimeStr;
        const isTaken = !!med.tomadoHoje?.[time];
        const alreadyTriggered = triggeredAlarmsRef.current.has(triggerKey);

        if (isTimeMatch && !isTaken && !alreadyTriggered) {
          triggeredAlarmsRef.current.add(triggerKey);
          setActiveAlarm({ medication: med, time });

          if (!isSoundMuted) {
            playMedicationChime();
          }

          sendLocalNotification(
            `⏰ Hora do Remédio: ${med.nome}`,
            `Dose: ${med.dosagem} (${time}). Toque para registrar no Cuidar Juntos.`
          );

          break; // Show one active alert at a time
        }
      }
    }
  }, [medications, isSoundMuted]);

  useEffect(() => {
    // Initial check
    checkSchedules();

    // Check every 25 seconds
    const interval = setInterval(checkSchedules, 25000);
    return () => clearInterval(interval);
  }, [checkSchedules]);

  const handleSnooze = useCallback((medId: string, time: string, minutes: number = 10) => {
    const snoozeKey = `${medId}_${time}`;
    const until = Date.now() + minutes * 60 * 1000;
    snoozeRegistryRef.current.set(snoozeKey, until);
    setActiveAlarm(null);
    onShowToast(`⏰ Lembrete de ${time} adiado por ${minutes} minutos.`);
  }, [onShowToast]);

  const toggleSoundMuted = useCallback(() => {
    setIsSoundMuted(prev => {
      const next = !prev;
      localStorage.setItem('cuidabem_alarm_muted', String(next));
      onShowToast(next ? '🔇 Alarme sonoro desativado' : '🔊 Alarme sonoro ativado');
      if (!next) {
        playMedicationChime();
      }
      return next;
    });
  }, [onShowToast]);

  const testAlarm = useCallback(() => {
    playMedicationChime();
    onShowToast('🔔 Teste de som do alarme executado!');
  }, [onShowToast]);

  return {
    activeAlarm,
    closeAlarm: () => setActiveAlarm(null),
    snoozeAlarm: handleSnooze,
    isSoundMuted,
    toggleSoundMuted,
    testAlarm
  };
}
