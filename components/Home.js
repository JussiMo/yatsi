import { useState } from 'react';
import { View, Text, TextInput, Pressable, Keyboard } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Header from './Header';
import Footer from './Footer';
import { NBR_OF_DICES, NBR_OF_THROWS, MIN_SPOT, MAX_SPOT, BONUS_POINTS, BONUS_POINTS_LIMIT } from '../constants/Game';
import styles from '../style/style';

export default Home = ({navigation}) => {

    const [playerName, setPlayerName] = useState('');
    const [hasPlayerName, setHasPlayerName] = useState(false);

    const handlePlayerName = (value) => {
        if (value.trim().length > 0) {
            setHasPlayerName(true);
            Keyboard.dismiss();
        }
    }

    return (
        <>
            <Header />
            <View style={styles.content}>
                <MaterialCommunityIcons name='home' size={90} color='green' />
                {!hasPlayerName ?
                    <>
                        <Text style={[styles.text, { fontWeight: 'bold' }]}>For scoreboard enter your name...</Text>
                        <TextInput onChangeText={setPlayerName} autoFocus={true} />
                        <Pressable
                            onPress={() => handlePlayerName(playerName)}
                        >
                            <Text style={[styles.text, { fontWeight: 'bold' }]}>OK</Text>
                        </Pressable>
                    </>
                    :
                    <>
                        <Text style={[styles.text, { fontWeight: 'bold' }]}>Rules of the game</Text>
                        <Text multiline="true"
                        style={styles.text}>
                            THE GAME: Upper section of the classic Yahtzee
                            dice game. You have {NBR_OF_DICES} dices and
                            for the every dice you have {NBR_OF_THROWS}
                            throws. After each throw you can keep dices in
                            order to get same dice spot counts as many as
                            possible. In the end of the turn you must select
                            your points from {MIN_SPOT} to {MAX_SPOT}.
                            Game ends when all points have been selected.
                            The order for selecting those is free
                        </Text>
                        <Text style={[styles.text, { fontWeight: 'bold' }]}>Good luck, {playerName}</Text>
                        <Pressable
                            onPress={() => navigation.navigate('Gameboard', {player: playerName})}>
                            <Text style={[styles.text, { fontWeight: 'bold' }]}>PLAY</Text>
                        </Pressable>
                    </>
                }
            </View>
            <Footer />
        </>
    );
}