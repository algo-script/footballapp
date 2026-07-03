import React, { useState } from 'react';
import { View, Text, Image } from 'react-native';

const COLORS = {
  cardLight: '#1E2536',
  border: '#222B3D',
  textMuted: '#8F9CAE',
};

export default function FotmobImage({ id, type = 'team', style, ...props }) {
  const [hasError, setHasError] = useState(false);
  const size = (style && style.width) || 18;

  if (!id || hasError) {
    return (
      <View style={[
        {
          width: size,
          height: size,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: COLORS.cardLight,
          borderRadius: 4,
          borderWidth: 1,
          borderColor: COLORS.border,
        },
        style
      ]}>
        <Text style={{ fontSize: size * 0.6, color: COLORS.textMuted }}>
          {type === 'team' ? '🛡️' : (type === 'player' || type === 'coach') ? '👤' : '🏆'}
        </Text>
      </View>
    );
  }

  const uri = type === 'team'
    ? `https://images.fotmob.com/image_resources/logo/teamlogo/${id}.png`
    : (type === 'player' || type === 'coach')
      ? `https://images.fotmob.com/image_resources/playerimages/${id}.png`
      : `https://images.fotmob.com/image_resources/logo/leaguelogo/${id}.png`;

  return (
    <Image
      source={{ uri }}
      style={[style, { resizeMode: 'contain' }]}
      onError={() => setHasError(true)}
      {...props}
    />
  );
}
