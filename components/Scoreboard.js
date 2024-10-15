import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text } from 'react-native';
import Header from './Header';
import Footer from './Footer';
import { SCOREBOARD_KEY } from '../constants/Game';
import styles from '../style/style';

export default Scoreboard = ({navigation}) => {

  const [scores, setScores] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getScoreboardData();
    })
    return unsubscribe;
  }, [navigation]);

  const getScoreboardData = async() => {
    try{
      const jsonValue = await AsyncStorage.getItem(SCOREBOARD_KEY);
      if (jsonValue !== null) {
        const tempScores = JSON.parse(jsonValue);
        // ope versiossa tässä välissä tehdään lajittelu pistemäärän perusteella laskevassa järjestyksessä
        // (vinkki harkkatyön tehtävänannossa "for sorting scoreboard")
        setScores(tempScores);
        console.log('Scoreboard: read successfull');
        console.log('Scoreboard: number of scores: ' + tempScores.length);
      }
    }
    catch (error) {
      console.log('Scoreboard: Read error' + error);
    }
  }

  const clearScoreboard = async() => {
    try {
      await AsyncStorage.removeItem(SCOREBOARD_KEY);
      setScores([]);
    }
    catch (error) {
      console.log('Scoreboard: Clear error' + error);
    }
  }

  return (
      <>
          <Header />
          <View>
            <Text>Scoreboard will be here...</Text>
          </View>
          <Footer />
      </>
  );
}