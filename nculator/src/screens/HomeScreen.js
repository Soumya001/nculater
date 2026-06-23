import React, { useContext, useMemo, useRef, useCallback, useState } from 'react';
import { View, Text, Animated, Easing, ScrollView, Pressable, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AppContext } from '../../App';
import { TOOLS } from '../calculators';
import TopBar from '../components/TopBar';

const ICON_DURATIONS = {
  dose: 850, drip: 550, pump: 650, weight: 600,
  infusion: 700, convert: 750, oxygen: 650, titration: 800, cannula: 650,
  creatinine: 500, reconstitution: 500, bsa: 500,
};

function getIconStyle(id, anim) {
  if (!anim) return {};
  switch (id) {
    case 'dose':
      return {
        transform: [{ rotate: anim.interpolate({ inputRange: [0, 0.15, 0.35, 0.55, 0.72, 0.85, 1], outputRange: ['0deg', '-18deg', '14deg', '-8deg', '5deg', '-2deg', '0deg'] }) }],
      };
    case 'drip':
      return {
        opacity: anim.interpolate({ inputRange: [0, 0.15, 0.55], outputRange: [0, 0, 1], extrapolate: 'clamp' }),
        transform: [
          { translateY: anim.interpolate({ inputRange: [0, 0.55, 0.78, 1], outputRange: [-14, 5, -3, 0] }) },
          { scale:      anim.interpolate({ inputRange: [0, 0.55, 0.78, 1], outputRange: [0.6, 1.1, 0.97, 1] }) },
        ],
      };
    case 'pump':
      return {
        opacity: anim.interpolate({ inputRange: [0, 0.1, 0.7], outputRange: [0, 0, 1], extrapolate: 'clamp' }),
        transform: [
          { rotate: anim.interpolate({ inputRange: [0, 0.7, 1], outputRange: ['-30deg', '8deg', '0deg'] }) },
          { scale:  anim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.5, 1.08, 1] }) },
        ],
      };
    case 'weight':
      return {
        opacity: anim.interpolate({ inputRange: [0, 0.1, 0.6], outputRange: [0, 0, 1], extrapolate: 'clamp' }),
        transform: [
          { translateY: anim.interpolate({ inputRange: [0, 0.6, 0.8, 1], outputRange: [-22, 7, -4, 0] }) },
          { scale:      anim.interpolate({ inputRange: [0, 0.6, 0.8, 1], outputRange: [0.6, 1.1, 0.96, 1] }) },
        ],
      };
    case 'infusion':
      return {
        opacity: anim.interpolate({ inputRange: [0, 0.1, 0.75], outputRange: [0, 0, 1], extrapolate: 'clamp' }),
        transform: [
          { rotate: anim.interpolate({ inputRange: [0, 0.75, 1], outputRange: ['-200deg', '8deg', '0deg'] }) },
          { scale:  anim.interpolate({ inputRange: [0, 0.75, 1], outputRange: [0.5, 1.06, 1] }) },
        ],
      };
    case 'convert':
      return {
        opacity: anim.interpolate({ inputRange: [0, 0.1, 0.65], outputRange: [0, 0, 1], extrapolate: 'clamp' }),
        transform: [
          { rotate: anim.interpolate({ inputRange: [0, 0.65, 1], outputRange: ['0deg', '390deg', '360deg'] }) },
          { scale:  anim.interpolate({ inputRange: [0, 0.65, 1], outputRange: [0.5, 1.1, 1] }) },
        ],
      };
    case 'oxygen':
      return {
        opacity: anim.interpolate({ inputRange: [0, 0.1, 0.55], outputRange: [0, 0, 1], extrapolate: 'clamp' }),
        transform: [{ scale: anim.interpolate({ inputRange: [0, 0.55, 0.78, 1], outputRange: [0.4, 1.18, 0.94, 1] }) }],
      };
    case 'titration':
      return {
        opacity: anim.interpolate({ inputRange: [0, 0.1, 0.2], outputRange: [0, 0, 1], extrapolate: 'clamp' }),
        transform: [{ scale: anim.interpolate({ inputRange: [0, 0.2, 0.35, 0.5, 0.65, 1], outputRange: [0.7, 1.25, 0.95, 1.15, 1, 1] }) }],
      };
    case 'cannula':
      return {
        opacity: anim.interpolate({ inputRange: [0, 0.1, 0.65], outputRange: [0, 0, 1], extrapolate: 'clamp' }),
        transform: [
          { translateX: anim.interpolate({ inputRange: [0, 0.65, 1], outputRange: [-28, 4, 0] }) },
          { scale:      anim.interpolate({ inputRange: [0, 0.65, 1], outputRange: [0.7, 1.06, 1] }) },
        ],
      };
    default:
      return {
        opacity: anim.interpolate({ inputRange: [0, 0.2, 0.6], outputRange: [0, 0, 1], extrapolate: 'clamp' }),
        transform: [{ scale: anim.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.6, 1.1, 1] }) }],
      };
  }
}

export default function HomeScreen({ navigation }) {
  const { theme, recentTools, pinnedTools, addRecent, setPins } = useContext(AppContext);
  const [pinModal, setPinModal] = useState(false);

  const togglePin = useCallback((id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = pinnedTools || [];
    const next = current.includes(id) ? current.filter(p => p !== id) : [...current, id];
    setPins(next);
  }, [pinnedTools, setPins]);
  const s = styles(theme);

  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;
  const iconProgress = useRef(
    Object.fromEntries(TOOLS.map(t => [t.id, new Animated.Value(0)]))
  ).current;

  useFocusEffect(useCallback(() => {
    opacity.setValue(0);
    translateY.setValue(10);
    TOOLS.forEach(t => iconProgress[t.id].setValue(0));

    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(80),
        Animated.stagger(35, TOOLS.map(t =>
          Animated.timing(iconProgress[t.id], {
            toValue: 1,
            duration: ICON_DURATIONS[t.id] ?? 500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          })
        )),
      ]),
    ]).start();
  }, []));

  const featuredIds = useMemo(() => {
    if (pinnedTools?.length) return pinnedTools.slice(0, 3);
    if (recentTools?.length) return recentTools.slice(0, 3);
    return ['dose', 'drip', 'titration'];
  }, [pinnedTools, recentTools]);

  const featuredLabel = pinnedTools?.length ? 'Pinned' : recentTools?.length ? 'Recent' : 'Quick access';
  const featured  = featuredIds.map(id => TOOLS.find(t => t.id === id)).filter(Boolean);
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
            <TouchableOpacity onPress={() => setPinModal(true)} style={s.manageBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialCommunityIcons name="pin-outline" size={16} color={theme.muted} />
              <Text style={[s.manageText, { color: theme.muted }]}>Manage</Text>
            </TouchableOpacity>
          </View>

          {/* FEATURED CARDS */}
          <View style={s.featuredList}>
            {featured.map((tool) => (
              <Pressable key={tool.id}
                style={({ pressed }) => [s.featCard, { backgroundColor: theme.s2, borderColor: `rgba(${tool.rgb},0.3)` }, pressed && s.pressed]}
                onPress={() => openTool(tool)}>
                <View style={[s.featIcon, { backgroundColor: `rgba(${tool.rgb},0.18)` }]}>
                  <Animated.View style={getIconStyle(tool.id, iconProgress[tool.id])}>
                    <MaterialCommunityIcons name={tool.icon} size={22} color={tool.color} />
                  </Animated.View>
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
                  <Animated.View style={getIconStyle(tool.id, iconProgress[tool.id])}>
                    <MaterialCommunityIcons name={tool.icon} size={20} color={tool.color} />
                  </Animated.View>
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

      {/* PIN MANAGEMENT MODAL */}
      <Modal visible={pinModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setPinModal(false)}>
        <SafeAreaView style={[s.modalSafe, { backgroundColor: theme.bg }]}>
          <View style={[s.modalHeader, { borderBottomColor: theme.border }]}>
            <Text style={[s.modalTitle, { color: theme.text }]}>Manage Pins</Text>
            <TouchableOpacity onPress={() => setPinModal(false)} style={[s.modalClose, { backgroundColor: theme.s2 }]}>
              <MaterialCommunityIcons name="close" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
          <Text style={[s.modalSub, { color: theme.muted }]}>Pinned tools appear in Quick access on the home screen.</Text>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
            <View style={{ gap: 8 }}>
              {TOOLS.map(tool => {
                const isPinned = (pinnedTools || []).includes(tool.id);
                return (
                  <Pressable key={tool.id}
                    style={({ pressed }) => [s.pinRow, { backgroundColor: theme.s2, borderColor: isPinned ? `rgba(${tool.rgb},0.4)` : theme.border }, pressed && { opacity: 0.8 }]}
                    onPress={() => togglePin(tool.id)}>
                    <View style={[s.pinIcon, { backgroundColor: `rgba(${tool.rgb},0.18)` }]}>
                      <MaterialCommunityIcons name={tool.icon} size={20} color={tool.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.pinName, { color: theme.text }]}>{tool.name}</Text>
                      <Text style={[s.pinDesc, { color: theme.muted }]}>{tool.desc}</Text>
                    </View>
                    <View style={[s.pinToggle, { backgroundColor: isPinned ? `rgba(${tool.rgb},0.2)` : theme.s3, borderColor: isPinned ? `rgba(${tool.rgb},0.5)` : theme.border }]}>
                      <MaterialCommunityIcons name={isPinned ? 'pin' : 'pin-outline'} size={18} color={isPinned ? tool.color : theme.muted} />
                    </View>
                  </Pressable>
                );
              })}
            </View>
            {(pinnedTools?.length > 0) && (
              <TouchableOpacity onPress={() => { setPins([]); }} style={[s.clearBtn, { borderColor: theme.border }]}>
                <MaterialCommunityIcons name="pin-off-outline" size={16} color={theme.muted} />
                <Text style={[s.clearText, { color: theme.muted }]}>Clear all pins</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

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
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, color: theme.muted, textTransform: 'uppercase', opacity: 0.7 },
  manageBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  manageText: { fontSize: 11, fontWeight: '600' },
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
  modalSafe: { flex: 1 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  modalClose: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  modalSub: { fontSize: 13, lineHeight: 18, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  pinRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1 },
  pinIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  pinName: { fontSize: 14, fontWeight: '700' },
  pinDesc: { fontSize: 11, marginTop: 2 },
  pinToggle: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  clearBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20, paddingVertical: 13, borderRadius: 14, borderWidth: 1 },
  clearText: { fontSize: 13, fontWeight: '600' },
});
