import React, { useContext, useMemo, useRef, useCallback } from 'react';
import { View, Text, Animated, Easing, ScrollView, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AppContext } from '../../App';
import { TOOLS } from '../calculators';
import TopBar from '../components/TopBar';

export default function HomeScreen({ navigation }) {
  const { theme, recentTools, pinnedTools, addRecent } = useContext(AppContext);
  const s = styles(theme);

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useFocusEffect(useCallback(() => {
    opacity.setValue(0);
    translateY.setValue(10);
    Animated.parallel([
      Animated.timing(opacity,     { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(translateY,  { toValue: 0, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []));

  const featuredIds = useMemo(() => {
    if (pinnedTools?.length) return pinnedTools.slice(0, 3);
    if (recentTools?.length) return recentTools.slice(0, 3);
    return ['dose', 'drip', 'titration'];
  }, [pinnedTools, recentTools]);

  const featuredLabel = pinnedTools?.length ? 'Pinned' : recentTools?.length ? 'Recent' : 'Quick access';
  const featured = featuredIds.map(id => TOOLS.find(t => t.id === id)).filter(Boolean);
  const gridTools = TOOLS.filter(t => !featuredIds.includes(t.id));

  const openTool = (tool) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addRecent(tool.id);
    navigation.push('Tool', { tool });
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'GOOD MORNING' : hour < 17 ? 'GOOD AFTERNOON' : 'GOOD EVENING';

  return (
    <SafeAreaView style={s.safe}>
      <TopBar />
      <Animated.View style={{ flex: 1, opacity, transform: [{ translateY }] }}>
        <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

          {/* GREETING */}
          <View style={s.greeting}>
            <Text style={s.greetSub}>{greeting}</Text>
            <Text style={s.greetTitle}>Ready when{'\n'}you are.</Text>
            <View style={[s.greetBar, { backgroundColor: theme.accent }]} />
          </View>

          {/* FEATURED LABEL */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionLabel}>{featuredLabel}</Text>
          </View>

          {/* FEATURED CARDS */}
          <View style={s.featuredList}>
            {featured.map((tool) => (
              <Pressable key={tool.id}
                style={({ pressed }) => [s.featCard, { backgroundColor: theme.s2, borderColor: `rgba(${tool.rgb},0.3)` }, pressed && s.pressed]}
                onPress={() => openTool(tool)}>
                <View style={[s.featIcon, { backgroundColor: `rgba(${tool.rgb},0.18)` }]}>
                  <MaterialCommunityIcons name={tool.icon} size={22} color={tool.color} />
                </View>
                <View style={s.featText}>
                  <Text style={[s.featName, { color: theme.text }]}>{tool.name}</Text>
                  <Text style={[s.featDesc, { color: theme.muted }]}>{tool.desc}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={22} color={theme.muted} />
              </Pressable>
            ))}
          </View>

          {/* DIVIDER */}
          <View style={s.divider}>
            <View style={[s.dividerLine, { backgroundColor: theme.border }]} />
            <Text style={[s.dividerText, { color: theme.muted }]}>MORE</Text>
            <View style={[s.dividerLine, { backgroundColor: theme.border }]} />
          </View>

          {/* GRID */}
          <View style={s.grid}>
            {gridTools.map((tool) => (
              <Pressable key={tool.id}
                style={({ pressed }) => [s.gridCard, { backgroundColor: theme.s2, borderColor: `rgba(${tool.rgb},0.2)` }, pressed && s.pressedGrid]}
                onPress={() => openTool(tool)}>
                <View style={[s.gridIconWrap, { backgroundColor: `rgba(${tool.rgb},0.15)` }]}>
                  <MaterialCommunityIcons name={tool.icon} size={20} color={tool.color} />
                </View>
                <Text style={[s.gridName, { color: theme.text }]}>{tool.name}</Text>
                <Text style={[s.gridDesc, { color: theme.muted }]}>{tool.desc}</Text>
              </Pressable>
            ))}
          </View>

          {/* SAFETY NOTE */}
          <View style={[s.safetyNote, { backgroundColor: 'rgba(76,141,255,0.06)', borderColor: 'rgba(76,141,255,0.12)' }]}>
            <MaterialCommunityIcons name="shield-check-outline" size={20} color="rgba(76,141,255,0.8)" style={{ marginTop: 1, marginRight: 12, flexShrink: 0 }} />
            <Text style={[s.safetyText, { color: theme.muted }]}>Every result shows its working so you can verify it. Does not replace the order or local protocol. <Text style={{ color: theme.text, fontWeight: '700' }}>The nurse is the final safety check.</Text></Text>
          </View>

        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = (theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  pressed: { transform: [{ scale: 0.974 }], opacity: 0.92 },
  pressedGrid: { transform: [{ scale: 0.972 }], opacity: 0.92 },
  greeting: { marginTop: 4, marginBottom: 28 },
  greetSub: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: theme.muted, textTransform: 'uppercase' },
  greetTitle: { fontSize: 34, fontWeight: '700', color: theme.text, letterSpacing: -0.5, marginTop: 8, lineHeight: 40 },
  greetBar: { width: 36, height: 3, borderRadius: 2, marginTop: 14, opacity: 0.8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, color: theme.muted, textTransform: 'uppercase', opacity: 0.7 },
  featuredList: { gap: 9 },
  featCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderRadius: 18, borderWidth: 1 },
  featIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  featText: { flex: 1 },
  featName: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  featDesc: { fontSize: 12, marginTop: 3 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 22 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 10, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase', opacity: 0.45 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridCard: { width: '47.5%', padding: 15, borderRadius: 16, borderWidth: 1 },
  gridIconWrap: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  gridName: { fontSize: 14, fontWeight: '700', marginTop: 11, letterSpacing: -0.1 },
  gridDesc: { fontSize: 11, marginTop: 3, lineHeight: 15 },
  safetyNote: { marginTop: 20, padding: 16, borderRadius: 18, borderWidth: 1, flexDirection: 'row', alignItems: 'flex-start' },
  safetyText: { flex: 1, fontSize: 12, lineHeight: 18 },
});
