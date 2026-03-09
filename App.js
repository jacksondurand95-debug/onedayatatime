import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  StatusBar,
  AppState,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

const QUOTES = [
  "The secret of getting ahead is getting started.",
  "Every day is a new beginning.",
  "You are stronger than you think.",
  "Progress, not perfection.",
  "Fall seven times, stand up eight.",
  "The only impossible journey is the one you never begin.",
  "Courage doesn't always roar. Sometimes it's the quiet voice saying 'I will try again tomorrow.'",
  "You don't have to see the whole staircase, just take the first step.",
  "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
  "One day or day one. You decide.",
  "Strength grows in the moments when you think you can't go on but you keep going anyway.",
  "It does not matter how slowly you go as long as you do not stop.",
  "You are not your past. You are not your mistakes. You are here. And that is enough.",
  "Rock bottom became the solid foundation on which I rebuilt my life.",
  "Hardships often prepare ordinary people for an extraordinary destiny.",
  "The wound is the place where the light enters you.",
  "Today I will do what others won't, so tomorrow I can do what others can't.",
  "Just because today is a terrible day doesn't mean tomorrow won't be the best day of your life.",
  "Recovery is not a race.",
  "Be patient with yourself. Nothing in nature blooms all year.",
];

const MILESTONES = [
  [1, "Day 1 — It starts here"],
  [7, "1 Week — You showed up"],
  [14, "2 Weeks — Building momentum"],
  [30, "1 Month — You're doing this"],
  [60, "2 Months — The grind is paying off"],
  [90, "90 Days — A whole new chapter"],
  [100, "100 Days — Triple digits. Legend."],
  [180, "6 Months — Unstoppable."],
  [365, "1 Year — 365 days of choosing yourself"],
  [500, "500 Days — Beyond what most dream of"],
  [730, "2 Years — This is who you are now"],
  [1000, "1000 Days — Warrior status"],
  [1095, "3 Years — Titanium willpower"],
  [1825, "5 Years — A whole new life"],
  [3650, "10 Years — Decade of dominance"],
];

function getDaysBetween(start, end) {
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.max(0, Math.floor((e - s) / (1000 * 60 * 60 * 24)));
}

function getDailyQuote() {
  const seed = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return QUOTES[seed % QUOTES.length];
}

function getMilestone(days) {
  for (let i = MILESTONES.length - 1; i >= 0; i--) {
    if (days >= MILESTONES[i][0]) return MILESTONES[i][1];
  }
  return null;
}

function getNextMilestone(days) {
  for (let i = 0; i < MILESTONES.length; i++) {
    if (days < MILESTONES[i][0]) {
      return { days: MILESTONES[i][0], label: MILESTONES[i][1], remaining: MILESTONES[i][0] - days };
    }
  }
  return null;
}

export default function App() {
  const [startDate, setStartDate] = useState(null);
  const [showSetup, setShowSetup] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());
  const [days, setDays] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showReset, setShowReset] = useState(false);

  const loadDate = useCallback(async () => {
    const stored = await AsyncStorage.getItem('odaat_start');
    if (stored) {
      const d = new Date(stored);
      setStartDate(d);
      setDays(getDaysBetween(d, new Date()));
    } else {
      setShowSetup(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDate();
  }, [loadDate]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && startDate) {
        setDays(getDaysBetween(startDate, new Date()));
      }
    });
    return () => sub.remove();
  }, [startDate]);

  const saveDate = async (date) => {
    await AsyncStorage.setItem('odaat_start', date.toISOString());
    setStartDate(date);
    setDays(getDaysBetween(date, new Date()));
    setShowSetup(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const resetToToday = async () => {
    const today = new Date();
    await saveDate(today);
    setShowReset(false);
  };

  if (loading) {
    return <View style={styles.container}><StatusBar barStyle="light-content" /></View>;
  }

  const milestone = getMilestone(days);
  const next = getNextMilestone(days);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30.44);
  const years = (days / 365.25).toFixed(1);
  const quote = getDailyQuote();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Setup Modal */}
      <Modal visible={showSetup} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Your Start Date</Text>
            <Text style={styles.modalSub}>The day you began this journey.{'\n'}Everything counts from here.</Text>

            <DateTimePicker
              value={pickerDate}
              mode="date"
              display="spinner"
              maximumDate={new Date()}
              onChange={(e, date) => { if (date) setPickerDate(date); }}
              themeVariant="dark"
              style={{ height: 150, marginBottom: 20 }}
            />

            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={() => saveDate(pickerDate)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#3b82f6', '#8b5cf6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.btnGradient}
              >
                <Text style={styles.btnText}>BEGIN</Text>
              </LinearGradient>
            </TouchableOpacity>

            {startDate && (
              <TouchableOpacity onPress={() => setShowSetup(false)} style={{ marginTop: 20 }}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Reset Confirmation */}
      <Modal visible={showReset} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Start Over?</Text>
            <Text style={styles.modalSub}>This will reset your counter to Day 1.</Text>
            <TouchableOpacity style={styles.btnDanger} onPress={resetToToday} activeOpacity={0.8}>
              <Text style={styles.btnDangerText}>RESET TO TODAY</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowReset(false)} style={{ marginTop: 20 }}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Main Content */}
      <Text style={styles.title}>ONE DAY AT A TIME</Text>

      <Text style={styles.daysNumber}>{days.toLocaleString()}</Text>
      <Text style={styles.daysLabel}>DAYS STRONG</Text>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailValue}>{weeks}</Text>
          <Text style={styles.detailLabel}>WEEKS</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailValue}>{months}</Text>
          <Text style={styles.detailLabel}>MONTHS</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailValue}>{years}</Text>
          <Text style={styles.detailLabel}>YEARS</Text>
        </View>
      </View>

      {milestone && (
        <View style={styles.milestoneBadge}>
          <Text style={styles.milestoneText}>{milestone}</Text>
        </View>
      )}

      {next && (
        <Text style={styles.nextMilestone}>
          {next.remaining} day{next.remaining !== 1 ? 's' : ''} until next milestone
        </Text>
      )}

      <Text style={styles.quote}>"{quote}"</Text>

      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.btnGhost}
          onPress={() => {
            setPickerDate(startDate || new Date());
            setShowSetup(true);
          }}
          activeOpacity={0.6}
        >
          <Text style={styles.btnGhostText}>CHANGE DATE</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btnGhost, { marginTop: 10 }]}
          onPress={() => setShowReset(true)}
          activeOpacity={0.6}
        >
          <Text style={[styles.btnGhostText, { color: 'rgba(239,68,68,0.5)' }]}>RESET</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 4,
    color: 'rgba(255,255,255,0.3)',
    marginBottom: 40,
  },
  daysNumber: {
    fontSize: width > 400 ? 120 : 96,
    fontWeight: '800',
    color: '#8b5cf6',
    lineHeight: width > 400 ? 130 : 105,
  },
  daysLabel: {
    fontSize: 13,
    fontWeight: '300',
    letterSpacing: 3,
    color: 'rgba(255,255,255,0.35)',
    marginTop: 5,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginTop: 35,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailValue: {
    fontSize: 24,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
  },
  detailLabel: {
    fontSize: 9,
    fontWeight: '400',
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.25)',
    marginTop: 3,
  },
  milestoneBadge: {
    marginTop: 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(139,92,246,0.12)',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.2)',
  },
  milestoneText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 1,
  },
  nextMilestone: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.2)',
    marginTop: 12,
  },
  quote: {
    fontSize: 14,
    fontWeight: '300',
    color: 'rgba(255,255,255,0.4)',
    fontStyle: 'italic',
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 30,
    maxWidth: 320,
  },
  bottomButtons: {
    marginTop: 40,
    alignItems: 'center',
  },
  btnGhost: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  btnGhostText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.25)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  modalContent: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '300',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 8,
  },
  modalSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 25,
  },
  btnPrimary: {
    borderRadius: 100,
    overflow: 'hidden',
  },
  btnGradient: {
    paddingHorizontal: 50,
    paddingVertical: 15,
    borderRadius: 100,
  },
  btnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 2,
  },
  btnDanger: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 100,
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
  },
  btnDangerText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(239,68,68,0.8)',
    letterSpacing: 1,
  },
  cancelText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.3)',
  },
});
