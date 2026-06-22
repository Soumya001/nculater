import React, { useContext, useState, useRef, useCallback } from 'react';
import { View, Text, Animated, Easing, ScrollView, Pressable, TextInput, StyleSheet, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AppContext } from '../../App';
import { TOOLS } from '../calculators';
import TopBar from '../components/TopBar';

export default function ToolsScreen({ navigation }) {
  const { theme, addRecent } = useContext(AppContext);
  const [query, setQuery] = useState('');
  const s = styles(theme);

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

  const filtered = TOOLS.filter(t =>
    !query || t.name.toLowerCase().includes(query.toLowerCase()) || t.desc.toLowerCase().includes(query.toLowerCase())
  );

  const openTool = (tool) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addRecent(tool.id);
    navigation.push('Tool', { tool });
  };

  return (
    <SafeAreaView style={s.safe}>
      <TopBar />
      <Animated.View style={{ flex: 1, opacity, transform: [{ translateY }] }}>

        {/* SEARCH */}
        <View style={[s.searchWrap, { backgroundColor: theme.s2, borderColor: theme.border }]}>
          <MaterialCommunityIcons name="magnify" size={21} color={theme.muted} />
          <TextInput style={[s.searchInput, { color: theme.text }]} value={query} onChangeText={setQuery}
            placeholder="Search calculators" placeholderTextColor={theme.muted} autoCorrect={false} returnKeyType="search" />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color={theme.muted} />
            </Pressable>
          )}
        </View>

        <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <View style={s.list}>
            {filtered.map((tool) => (
              <Pressable key={tool.id}
                style={({ pressed }) => [s.row, { backgroundColor: theme.s2, borderColor: `rgba(${tool.rgb},0.25)` }, pressed && s.pressed]}
                onPress={() => openTool(tool)}>
                <View style={[s.rowIcon, { backgroundColor: `rgba(${tool.rgb},0.18)` }]}>
                  <MaterialCommunityIcons name={tool.icon} size={20} color={tool.color} />
                </View>
                <View style={s.rowText}>
                  <Text style={[s.rowName, { color: theme.text }]}>{tool.name}</Text>
                  <Text style={[s.rowDesc, { color: theme.muted }]}>{tool.desc}</Text>
                </View>
                {tool.danger && (
                  <View style={[s.dangerBadge, { backgroundColor: theme.dangerSoft }]}>
                    <Text style={[s.dangerText, { color: theme.danger }]}>HIGH-RISK</Text>
                  </View>
                )}
                <MaterialCommunityIcons name="chevron-right" size={22} color={theme.muted} />
              </Pressable>
            ))}
          </View>
        </ScrollView>

      </Animated.View>
    </SafeAreaView>
  );
}

const styles = (theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  pressed: { transform: [{ scale: 0.974 }], opacity: 0.92 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, marginBottom: 10, height: 52, borderRadius: 16, borderWidth: 1, paddingHorizontal: 14 },
  searchInput: { flex: 1, fontSize: 15, height: '100%' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingTop: 4, paddingBottom: 32 },
  list: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 15, borderRadius: 16, borderWidth: 1 },
  rowIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1 },
  rowName: { fontSize: 15, fontWeight: '700', letterSpacing: -0.1 },
  rowDesc: { fontSize: 12, marginTop: 2 },
  dangerBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7 },
  dangerText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
});
