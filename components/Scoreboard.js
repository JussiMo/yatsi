import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Pressable, FlatList } from 'react-native';
import Header from './Header';
import Footer from './Footer';
import { SCOREBOARD_KEY, MAX_NBR_OF_SCOREBOARD_ROWS } from '../constants/Game';
import styles from '../style/style';

export default Scoreboard = ({ navigation }) => {

  const [scores, setScores] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getScoreboardData();
    });
    return unsubscribe;
  }, [navigation]);

  const getScoreboardData = async () => {
    console.log('Scoreboard: Reading data...');
    try {
      const jsonValue = await AsyncStorage.getItem(SCOREBOARD_KEY);
      if (jsonValue !== null) {
        const tempScores = JSON.parse(jsonValue);
        tempScores.sort((a, b) => b.points - a.points);

        const limitedScores = tempScores.slice(0, MAX_NBR_OF_SCOREBOARD_ROWS);

        setScores(limitedScores);
        console.log('Scoreboard: Read success', tempScores);
      } else {
        console.log('Scoreboard: No data found');
      }
    } catch (error) {
      console.log('Scoreboard: Read error' + error);
    }
  };


  const clearScoreboard = async () => {
    try {
      await AsyncStorage.removeItem(SCOREBOARD_KEY);
      setScores([]);
    }
    catch (error) {
      console.log('Scoreboard: Clear error' + error);
    }
  }

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text>Name: {item.name}</Text>
      <Text>Date: {item.date}</Text>
      <Text>Points: {item.points}</Text>
    </View>
  );

  return (
    <>
      <Header />
      <View style={styles.content}>
        <Text style={styles.textTitle}>Scoreboard</Text>
        <Pressable onPress={clearScoreboard}>
          <Text style={[styles.buttonText, { fontWeight: 'bold', textAlign: 'center' }]}>Clear Scores</Text>
        </Pressable>
        <View style={styles.list}>
          <FlatList
            style={[styles.list, { fontSize: 16 }]}
            data={scores}
            renderItem={renderItem}
            ListEmptyComponent={<Text style={styles.text}>No scores saved yet.</Text>}
          />
        </View>
      </View>
      <Footer />
    </>
  );
}

