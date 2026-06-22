import React, { useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppContext } from '../../App';

export default function TopBar() {
  const { theme, isDark, setTheme } = useContext(AppContext);
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingHorizontal: 14, paddingTop: 6, paddingBottom: 12,
    }}>
      <View style={{
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: theme.s2, borderWidth: 1, borderColor: theme.border,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={{ fontSize: 20 }}>💊</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 19, fontWeight: '700', letterSpacing: -0.3, color: theme.text, lineHeight: 23 }}>
          Nculator
        </Text>
        <Text style={{ fontSize: 11.5, color: theme.muted, marginTop: 1 }}>
          Clinical calculators
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => setTheme(!isDark)}
        activeOpacity={0.75}
        style={{
          flexDirection: 'row', alignItems: 'center', gap: 6,
          paddingHorizontal: 13, height: 36,
          borderRadius: 18, borderWidth: 1,
          backgroundColor: theme.s2, borderColor: theme.border,
        }}>
        <MaterialCommunityIcons
          name={isDark ? 'weather-night' : 'white-balance-sunny'}
          size={17} color={theme.muted} />
        <Text style={{ fontSize: 12.5, fontWeight: '600', color: theme.muted }}>
          {isDark ? 'Dark' : 'Light'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
