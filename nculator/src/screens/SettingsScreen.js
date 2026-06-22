import React, { useContext, useRef, useCallback } from 'react';
import { View, Text, Animated, Easing, ScrollView, TouchableOpacity, Switch, StyleSheet, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppContext } from '../../App';
import TopBar from '../components/TopBar';

const ACCENTS = ['Slate', 'Orange', 'Cyan', 'Violet', 'Green'];
const ACCENT_COLORS = {
  Slate:  { dark: '#94a3b8', light: '#475569' },
  Orange: { dark: '#fb923c', light: '#ea580c' },
  Cyan:   { dark: '#2fd4d4', light: '#0a8c8c' },
  Violet: { dark: '#a98bff', light: '#6a47d0' },
  Green:  { dark: '#4cd47e', light: '#1f8a4c' },
};

export default function SettingsScreen() {
  const { theme, isDark, setTheme, accent, setAccent } = useContext(AppContext);

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useFocusEffect(useCallback(() => {
    opacity.setValue(0);
    translateY.setValue(10);
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <TopBar />
      <Animated.View style={{ flex: 1, opacity, transform: [{ translateY }] }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

          <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

          {/* APPEARANCE */}
          <Text style={[styles.sectionLabel, { color: theme.muted }]}>APPEARANCE</Text>
          <View style={[styles.card, { backgroundColor: theme.s1, borderColor: theme.border }]}>
            <View style={styles.row}>
              <MaterialCommunityIcons name={isDark ? 'weather-night' : 'white-balance-sunny'} size={22} color={theme.muted} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: theme.text }]}>Dark theme</Text>
                <Text style={[styles.rowSub, { color: theme.muted }]}>{isDark ? 'On · night shifts' : 'Off · light mode'}</Text>
              </View>
              <Switch value={isDark} onValueChange={setTheme} trackColor={{ false: '#3e3e3e', true: theme.accent }} thumbColor="#fff" />
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.row}>
              <MaterialCommunityIcons name="palette-outline" size={22} color={theme.muted} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: theme.text }]}>Accent colour</Text>
                <View style={styles.swatches}>
                  {ACCENTS.map(name => {
                    const color = ACCENT_COLORS[name][isDark ? 'dark' : 'light'];
                    const active = accent === name;
                    return (
                      <TouchableOpacity key={name} onPress={() => setAccent(name)}
                        style={[styles.swatch, { backgroundColor: color, borderWidth: active ? 2.5 : 1, borderColor: active ? theme.text : 'rgba(128,128,128,0.3)' }]}>
                        {active && <MaterialCommunityIcons name="check" size={20} color="#fff" />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          </View>

          {/* ABOUT */}
          <Text style={[styles.sectionLabel, { color: theme.muted, marginTop: 24 }]}>ABOUT</Text>
          <View style={[styles.card, { backgroundColor: theme.s1, borderColor: theme.border }]}>
            <View style={styles.row}>
              <MaterialCommunityIcons name="pill" size={22} color={theme.muted} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: theme.text }]}>Nculator</Text>
                <Text style={[styles.rowSub, { color: theme.muted }]}>Version 1.1.0 · 12 calculators</Text>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.row}>
              <MaterialCommunityIcons name="shield-check-outline" size={22} color={theme.muted} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: theme.text }]}>Safety design</Text>
                <Text style={[styles.rowSub, { color: theme.muted }]}>Shows working · refuses wrong answers · plausibility warnings</Text>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.row}>
              <MaterialCommunityIcons name="scale-balance" size={22} color={theme.muted} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: theme.text }]}>Not a medical device</Text>
                <Text style={[styles.rowSub, { color: theme.muted }]}>Mathematical aid only. The nurse is the final safety check.</Text>
              </View>
            </View>
          </View>

          {/* DISCLAIMER */}
          <View style={[styles.disclaimer, { backgroundColor: theme.s2, borderColor: theme.border }]}>
            <Text style={[styles.disclaimerText, { color: theme.muted }]}>This app is not a certified medical device and has not been validated under CE, FDA, TGA, or any other regulatory framework. Results are mathematical aids only. Professional accountability stays with the clinician.</Text>
          </View>

        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5, marginBottom: 24 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 },
  card: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', gap: 13, padding: 16, alignItems: 'center' },
  rowTitle: { fontSize: 15, fontWeight: '600' },
  rowSub: { fontSize: 12, marginTop: 2 },
  divider: { height: 1, marginHorizontal: 16 },
  swatches: { flexDirection: 'row', gap: 10, marginTop: 12 },
  swatch: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  disclaimer: { marginTop: 24, padding: 16, borderRadius: 16, borderWidth: 1 },
  disclaimerText: { fontSize: 12, lineHeight: 18 },
});
