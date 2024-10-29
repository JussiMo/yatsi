import { View, Text, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import styles from '../style/style';
import { NBR_OF_DICES, NBR_OF_THROWS, MIN_SPOT, MAX_SPOT, BONUS_POINTS, BONUS_POINTS_LIMIT, SCOREBOARD_KEY } from '../constants/Game';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Container, Row, Col } from 'react-native-flex-grid';

/* const SCOREBOARD_KEY = 'scoreboard'; */
let board = [];

export default Gameboard = ({ navigation, route }) => {

  const [nbrOfThrowsLeft, setNbrOfThrowsLeft] = useState(NBR_OF_THROWS);
  const [status, setStatus] = useState('Begin rolling the dice');
  const [gameEndStatus, setGameEndStatus] = useState(false);
  //noppien valinta
  const [selectedDices, setSelectedDices] = useState(new Array(NBR_OF_DICES).fill(false));
  //noppin silmäluvut
  const [diceSpots, setDiceSpots] = useState(new Array(NBR_OF_DICES).fill(0));
  //mitkä noppien silmäluvuista on valittu pisteisiin
  const [selectedDicePoints, setSelectedDicePoints] = useState(new Array(MAX_SPOT).fill(0));
  //valittujen noppien silmälukujen summa
  const [dicePointsTotal, setDicePointsTotal] = useState(new Array(MAX_SPOT).fill(0));
  const [playerName, setPlayerName] = useState('');
  const [scores, setScores] = useState([]);


  // Calculate total and check for bonus
  useEffect(() => {
    const total = dicePointsTotal.reduce((sum, points) => sum + points, 0);
    
    // Calculate total score with bonus only if total meets the bonus threshold
    if (total >= BONUS_POINTS_LIMIT) {
      setTotalScore(total + BONUS_POINTS);  // Apply bonus once
    } else {
      setTotalScore(total);  // Set total score without bonus
    }
  }, [dicePointsTotal]);
  

  const [totalScore, setTotalScore] = useState(0); // track the total score

  // Update state whenever dicePointsTotal changes
  useEffect(() => {
    setTotalScore(dicePointsTotal.reduce((a, b) => a + b, 0));
  }, [dicePointsTotal]);


  useEffect(() => {
    if (playerName === '' && route.params?.player) {
      setPlayerName(route.params.player);
    }
  }, [route.params?.player]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getScoreboardData();
    })
    return unsubscribe;
  }, [navigation]);

  const getScoreboardData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(SCOREBOARD_KEY);
      if (jsonValue !== null) {
        const tempScores = JSON.parse(jsonValue);
        setScores(tempScores);
        console.log('Gameboard: read successfull');
        console.log('Gameboard: number of scores: ' + tempScores.length);

      }
    }
    catch (error) {
      console.log('Gameboard: Read error' + error);
    }
  }

  const savePlayerPoints = async () => {
    const newKey = scores.length + 1;
  
    // Calculate the final total points including the bonus if applicable
    const totalPoints = dicePointsTotal.reduce((acc, val) => acc + val, 0);
    const finalScore = totalPoints >= BONUS_POINTS_LIMIT ? totalPoints + BONUS_POINTS : totalPoints;
  
    const playerPoints = {
      key: newKey,
      name: playerName,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      points: finalScore,
    };
  
    try {
      const newScore = [...scores, playerPoints];
      const jsonValue = JSON.stringify(newScore);
      await AsyncStorage.setItem(SCOREBOARD_KEY, jsonValue);
      setScores(newScore);  // Update local state
      console.log('Gameboard: save successful' + jsonValue);
    } catch (error) {
      console.log('Gameboard: Save error' + error);
    }
  };
  
/*   //testausta varten
    const clearPlayerPoints = () => {
    setScores([]);
    AsyncStorage.removeItem(SCOREBOARD_KEY);
    console.log('Gameboard: clear successful');
  }; */

  const dicesRow = [];
  for (let dice = 0; dice < NBR_OF_DICES; dice++) {
    dicesRow.push(
      <Col key={"dice" + dice}>
        <Pressable
          key={"row" + dice}
          onPress={() => chooseDice(dice)}>
          <MaterialCommunityIcons
            name={board[dice]}
            key={"dice" + dice}
            size={50}
            color={getDiceColor(dice)}>
          </MaterialCommunityIcons>
        </Pressable>
      </Col>
    );
  }

  //tässä luodaan pisterivi sarakkeittain
  const pointsRow = [];
  for (let spot = 0; spot < MAX_SPOT; spot++) {
    pointsRow.push(
      <Col key={"pointsRow" + spot}>
        <Text key={"pointsRow" + spot}>
          {getSpotTotal(spot)}
        </Text>
      </Col>
    );
  }

  //tässä luodaan rivi, joka kertoo onko pisteet jo valittu silmäluvulle
  const pointsToSelectRow = [];
  for (let diceButton = 0; diceButton < MAX_SPOT; diceButton++) {
    pointsToSelectRow.push(
      <Col key={"buttonsRow" + diceButton}>
        <Pressable
          key={"buttonsRow" + diceButton}
          onPress={() => chooseDicePoints(diceButton)}
        >
          <MaterialCommunityIcons
            name={"numeric-" + (diceButton + 1) + "-circle"}
            key={"buttonsRow" + diceButton}
            size={35}
            color={getDicePointsColor(diceButton)}>
          </MaterialCommunityIcons>
        </Pressable>
      </Col>
    );
  }

  const chooseDice = (i) => {
    if (nbrOfThrowsLeft < NBR_OF_THROWS && !gameEndStatus) {
      let dices = [...selectedDices];
      dices[i] = selectedDices[i] ? false : true;
      setSelectedDices(dices);
    }
    else {
      setStatus('Roll dice first');
    }
  }

  const chooseDicePoints = (i) => {
    if (nbrOfThrowsLeft === 0) {
      let selectedPoints = [...selectedDicePoints];
      let points = [...dicePointsTotal];

      if (!selectedPoints[i]) {
        selectedPoints[i] = true;

        // Calculate points for the selected dice spot
        let nbrOfDices = diceSpots.reduce((total, x) => (x === (i + 1) ? total + 1 : total), 0);
        points[i] = nbrOfDices * (i + 1);

        setDicePointsTotal(points);
        setSelectedDicePoints(selectedPoints);
        setNbrOfThrowsLeft(NBR_OF_THROWS);  // Reset rolls left counter for new turn

        // Unlock all dice for the next roll
        setSelectedDices(new Array(NBR_OF_DICES).fill(false));

        // Check if all points have been selected to end the game
        if (selectedPoints.every((val) => val)) {
          setGameEndStatus(true);
          setStatus("Game over! All points selected.");
        } else {
          setStatus(`You selected points for spot ${i + 1}. Roll again.`);
        }
      } else {
        setStatus(`You already selected points for this spot ${i + 1}`);
      }
    } else {
      setStatus(`Roll ${NBR_OF_THROWS} time(s) before setting points`);
    }
  };




  function getDiceColor(i) {
    return selectedDices[i] ? "black" : "#a5438c";
  }

  function getDicePointsColor(i) {
    return (selectedDicePoints[i] && !gameEndStatus) ? "black" : "#a5438c";
  }

  function getSpotTotal(spot) {
    return dicePointsTotal[spot];
  }

  const throwDices = () => {
    if (nbrOfThrowsLeft > 0 && !gameEndStatus) {

      // Generate new dice values for unlocked dice
      let spots = [...diceSpots];
      for (let i = 0; i < NBR_OF_DICES; i++) {
        if (!selectedDices[i]) {
          let randomNumber = Math.floor(Math.random() * 6 + 1);
          board[i] = 'dice-' + randomNumber;
          spots[i] = randomNumber;
        }
      }

      setNbrOfThrowsLeft(nbrOfThrowsLeft - 1);
      setDiceSpots(spots);
      setStatus('Select dices or roll again');
    } else if (nbrOfThrowsLeft === 0) {
      setStatus('Select a score before rolling again');
    } else {
      setStatus('Game over or no rolls left, select points or restart.');
    }
  };

  const restartGame = () => {
    setNbrOfThrowsLeft(NBR_OF_THROWS);
    setStatus('New game, keep it rolling!');

    setGameEndStatus(false);
    setSelectedDices(new Array(NBR_OF_DICES).fill(false));
    setDiceSpots(new Array(NBR_OF_DICES).fill(0));
    setSelectedDicePoints(new Array(MAX_SPOT).fill(0));
    setDicePointsTotal(new Array(MAX_SPOT).fill(0));
    setTotalScore(0);
  };


  return (
    <>
      <Header />
      <View>
        <Container style={styles.row}>
          <Row>{dicesRow}</Row>
        </Container>
        <Text style={styles.text}>Rolls left: {nbrOfThrowsLeft}</Text>
        <Text style={styles.text}>{status}</Text>
        <Pressable
          onPress={() => throwDices()}>
          <Text style={[styles.text, { fontWeight: 'bold' }]}>ROLL DICE</Text>
        </Pressable>
        <Container styl>
          <Row>{pointsRow}</Row>
        </Container>
        <Container>
          <Row>{pointsToSelectRow}</Row>
        </Container>
        <Text style={styles.text}>Player: {playerName}</Text>
        <Pressable
          onPress={() => savePlayerPoints()}>
          <Text style={[styles.text, { fontWeight: 'bold' }]}>SAVE POINTS</Text>
        </Pressable>
        <View>
          <Text style={styles.text}>Total Score: {totalScore}</Text>
          {totalScore >= BONUS_POINTS_LIMIT && <Text style={[styles.text, { fontWeight: 'bold' }]}>Bonus: +{BONUS_POINTS}</Text>}
        </View>
        <Pressable
          onPress={() => restartGame()}>
          <Text style={[styles.text, { fontWeight: 'bold' }]}>RESTART GAME</Text>
        </Pressable>
{/*         <Pressable
          onPress={() => clearPlayerPoints()}>
          <Text style={styles.text}>clear points</Text>
        </Pressable> */}
      </View>
      <Footer />
    </>
  );
}