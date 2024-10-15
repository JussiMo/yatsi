import { View, Text, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import styles from '../style/style';
import { NBR_OF_DICES, NBR_OF_THROWS, MIN_SPOT, MAX_SPOT, BONUS_POINTS, BONUS_POINTS_LIMIT } from '../constants/Game';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Container, Row, Col } from 'react-native-flex-grid';

const SCOREBOARD_KEY = 'scoreboard';
let board = [];

export default Gameboard = ({navigation, route}) => {

  const [nbrOfThrowsLeft, setNbrOfThrowsLeft] = useState(NBR_OF_THROWS);
  const [status, setStatus] = useState('Roll dice');
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

  const getScoreboardData = async() => {
    try{
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

  const savePlayerPoints = async() => {
    const newKey = scores.length + 1;
    const playerPoints = {
      key: newKey,
      name: playerName,
      date: 'date', //hae tämä pvm
      time: 'time', //hae tänne kellonaika
      points: 0 //sijoita tänne pelaajan pistemäärä
    };
    try {
      const newScore = [...scores, playerPoints];
      const jsonValue = JSON.stringify(newScore);
      await AsyncStorage.setItem(SCOREBOARD_KEY, jsonValue);
      console.log('Gameboard: save successfull' + jsonValue);
    }
    catch (error) {
      console.log('Gameboard: Save error' + error);
    }
  }

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
      if (!selectedDicePoints[i]) {
        selectedPoints[i] = true;
        let nbrOfDices =
         diceSpots.reduce((total, x) => (x ===(i+1) ? total + 1: total), 0);
        points[i] = nbrOfDices * (i+1);
      }
      else {
        setStatus('You already selected points for this spot ' + (i+1));
        return points[i];
      }
      setDicePointsTotal(points);
      setSelectedDicePoints(selectedPoints);
      return points[i];
    }
    else {
      setStatus("Roll " + NBR_OF_THROWS + " time(s) before setting points");
    }
  }

  function getDiceColor(i) {
      return selectedDices[i] ? "black" : "steelblue";
  }

  function getDicePointsColor(i) {
    return (selectedDicePoints[i] && !gameEndStatus) ? "black" : "steelblue";
  }

  function getSpotTotal(spot) {
    return dicePointsTotal[spot];
  }

  const throwDices = () => {
    let spots = [...diceSpots];
    for (let i = 0; i < NBR_OF_DICES; i++) {
      if (!selectedDices[i]) {
        let randomNumber = Math.floor(Math.random() * 6 + 1);
        board[i] = 'dice-' + randomNumber;
        spots[i] = randomNumber;
      }
    }
    setNbrOfThrowsLeft(nbrOfThrowsLeft-1);
    setDiceSpots(spots);
    setStatus('Select dices or roll again');
  }

  return (
      <>
          <Header />
          <View>
            <Container>
              <Row>{dicesRow}</Row>
            </Container>
            <Text>Rolls left: {nbrOfThrowsLeft}</Text>
            <Text>{status}</Text>
            <Pressable
              onPress={() => throwDices()}>
                <Text>ROLL DICE</Text>
              </Pressable>
              <Container>
                <Row>{pointsRow}</Row>
              </Container>
              <Container>
                <Row>{pointsToSelectRow}</Row>
              </Container>
            <Text>Player: {playerName}</Text>
            <Pressable
              onPress={() => savePlayerPoints()}>
                <Text>SAVE POINTS</Text>
              </Pressable>
          </View>
          <Footer />
      </>
  );
}