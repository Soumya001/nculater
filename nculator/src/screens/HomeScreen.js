import React, { useContext, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { AppContext } from '../../App';
import { TOOLS } from '../calculators';

export default function HomeScreen({ navigation }) {
  const { theme, recentTools, pinnedTools, addRecent } = useContext(AppContext);
  const s = styles(theme);

  const featuredIds = useMemo(() => {
    if (pinnedTools?.length) return pinnedTools.slice(0, 3);
    if (recentTools?.length) return recentTools.slice(0, 3);
    return ['dose', 'drip', 'titration'];
  }, [pinnedTools, recentTools]);

  const featuredLabel = pinnedTools?.length ? 'Pinned' : recentTools?.length ? 'Recent' : 'Quick access';
  const featured = featuredIds.map(id => TOOLS.find(t => t.id === id)).filter(Boolean);
  const gridTools = TOOLS.filter(t => !featuredIds.includes(t.id));

  const openTool = (tool) => {
    addRecent(tool.id);
    navigation.push('Tool', { tool });
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'GOOD MORNING' : hour < 17 ? 'GOOD AFTERNOON' : 'GOOD EVENING';

  return (
    <SafeAreaView style={s.safe}>
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
            <TouchableOpacity key={tool.id} style={[s.featCard, { backgroundColor: theme.s2, borderColor: `rgba(${tool.rgb},0.3)` }]}
              onPress={() => openTool(tool)} activeOpacity={0.8}>
              <View style={[s.featIcon, { backgroundColor: `rgba(${tool.rgb},0.18)` }]}>
                <Text style={s.featIconText}>{tool.icon}</Text>
              </View>
              <View style={s.featText}>
                <Text style={[s.featName, { color: theme.text }]}>{tool.name}</Text>
                <Text style={[s.featDesc, { color: theme.muted }]}>{tool.desc}</Text>
              </View>
              <Text style={[s.featArrow, { color: theme.muted }]}>›</Text>
            </TouchableOpacity>
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
            <TouchableOpacity key={tool.id} style={[s.gridCard, { backgroundColor: theme.s2, borderColor: `rgba(${tool.rgb},0.2)` }]}
              onPress={() => openTool(tool)} activeOpacity={0.8}>
              <Text style={s.gridIcon}>{tool.icon}</Text>
              <Text style={[s.gridName, { color: theme.text }]}>{tool.name}</Text>
              <Text style={[s.gridDesc, { color: theme.muted }]}>{tool.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SAFETY NOTE */}
        <View style={[s.safetyNote, { backgroundColor: 'rgba(76,141,255,0.06)', borderColor: 'rgba(76,141,255,0.12)' }]}>
          <Text style={[s.safetyText, { color: theme.muted }]}>Every result shows its working so you can verify it. Does not replace the order or local protocol. <Text style={{ color: theme.text, fontWeight: '700' }}>The nurse is the final safety check.</Text></Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  greeting: { marginTop: 12, marginBottom: 28 },
  greetSub: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: theme.muted, textTransform: 'uppercase' },
  greetTitle: { fontSize: 34, fontWeight: '700', color: theme.text, letterSpacing: -0.5, marginTop: 8, lineHeight: 40 },
  greetBar: { width: 36, height: 3, borderRadius: 2, marginTop: 14, opacity: 0.8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, color: theme.muted, textTransform: 'uppercase', opacity: 0.7 },
  featuredList: { gap: 9 },
  featCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderRadius: 18, borderWidth: 1 },
  featIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  featIconText: { fontSize: 22 },
  featText: { flex: 1 },
  featName: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  featDesc: { fontSize: 12, marginTop: 3 },
  featArrow: { fontSize: 24 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 22 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 10, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase', opacity: 0.45 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridCard: { width: '47.5%', padding: 15, borderRadius: 16, borderWidth: 1 },
  gridIcon: { fontSize: 24 },
  gridName: { fontSize: 14, fontWeight: '700', marginTop: 10, letterSpacing: -0.1 },
  gridDesc: { fontSize: 11, marginTop: 3, lineHeight: 15 },
  safetyNote: { marginTop: 20, padding: 16, borderRadius: 18, borderWidth: 1 },
  safetyText: { fontSize: 12, lineHeight: 18 },
});
