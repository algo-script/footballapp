import React, { useContext } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Dimensions } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { ThemeContext } from '../context/ThemeContext';
import { ConfigContext } from '../context/ConfigContext';

const { width } = Dimensions.get('window');

const AdCard = ({ ad, pushScreen }) => {
  const { theme: COLORS } = useContext(ThemeContext);
  const { configData } = useContext(ConfigContext);

  if (configData?.show_ads?.enable === false) return null; // MASTER SWITCH
  if (!ad || (!ad.image && !ad.title)) return null;

  const handlePress = async () => {
    try {
      const urlToOpen = ad.url || 'https://6222.fflivegame.com/';
      if (ad.open_in === 'webview' && pushScreen) {
        pushScreen('webview', { url: urlToOpen });
      } else {
        await WebBrowser.openBrowserAsync(urlToOpen);
      }
    } catch (e) {
      console.warn("Failed to open ad", e);
    }
  };

  const renderAdTag = () => {
    if (configData?.headeradstag) {
      return (
        <Image 
          source={{ uri: configData.headeradstag }} 
          style={styles.adTagIcon}
          resizeMode="contain"
        />
      );
    }
    return null;
  };

  // If it's just an image banner (no title/button)
  if (!ad.title && ad.image) {
    return (
      <Pressable onPress={handlePress} style={[styles.container, { padding: 0 }]}>
        <Image 
          source={{ uri: ad.image }} 
          style={styles.bannerImage}
          resizeMode="cover"
        />
        {renderAdTag()}
      </Pressable>
    );
  }

  // Native Card Style
  return (
    <Pressable onPress={handlePress} style={[styles.container, { backgroundColor: ad.CardBgColor || '#FFFFFF' }]}>
      {ad.image && (
        <Image 
          source={{ uri: ad.image }} 
          style={styles.cardImage}
          resizeMode="cover"
        />
      )}
      {renderAdTag()}
      <View style={styles.textContainer}>
        {ad.title && (
          <Text style={styles.title} numberOfLines={1}>{ad.title}</Text>
        )}
        {ad.subtitle && (
          <Text style={styles.subtitle} numberOfLines={2}>{ad.subtitle}</Text>
        )}
        {ad.buttonText && (
          <View style={[styles.button, { backgroundColor: ad.buttonColor || '#fa8405' }]}>
            <Text style={[styles.buttonText, { color: ad.buttonTextColor || '#FFFFFF' }]}>
              {ad.buttonText}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff'
  },
  bannerImage: {
    width: '100%',
    height: 120,
  },
  cardImage: {
    width: '100%',
    height: 150,
  },
  textContainer: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start'
  },
  buttonText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  adTagIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 16,
    borderRadius: 2,
  }
});

export default AdCard;
