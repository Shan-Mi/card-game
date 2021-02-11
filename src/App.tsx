import React, { useEffect, useState } from "react";
import axios from "axios";
// import cx from 'classnames';

const NewRoundURL = "https://deckofcardsapi.com/api/deck/new/shuffle/";
const drawOneCardFrom = (deckId: string) =>
  `http://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`;
const getDeckStatus = (deckId: string) =>
  `http://deckofcardsapi.com/api/deck/${deckId}/`;

interface Deck {
  success: boolean;
  deck_id: string;
  shuffled: boolean;
  remaining: number;
}

interface Card {
  code: string;
  image: string;
  images: {
    svg: string;
    png: string;
  };
  value: string;
  suit: string;
}

enum CourtCards {
  ACE = 1,
  JACK = 11,
  QUEEN,
  KING,
}

interface Guess {
  val: string;
  score: number;
  myGuess: string;
}

function App() {
  const [deck, setDeck] = useState<Deck>();
  const [cardsOnBoard, setCardsOnBoard] = useState<Card[]>([]);
  const [currCard, setCurrCard] = useState<Card | null>();
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [isDrawCardDisabled, setIsDrawCardDisabled] = useState<boolean>(true);
  const [guess, setGuess] = useState<Guess>({
    val: "",
    score: 0,
    myGuess: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (deck?.deck_id) {
          const { data } = await axios.get(getDeckStatus(deck?.deck_id));
          setDeck(data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
    calcScore();
    if (currCard === undefined) {
      setGuess({ score: 0, val: "", myGuess: "" });
      setIsDisabled(false);
      setIsDrawCardDisabled(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currCard]);

  useEffect(() => {
    if (deck?.remaining === 0) {
      setIsDisabled(false);
    }
  }, [deck]);

  const handleNewGame = async () => {
    try {
      const { data } = await axios.get(NewRoundURL);
      setDeck(data);
      setGuess({ score: 0, val: "", myGuess: "" });
      setCardsOnBoard([]);
      setCurrCard(null);
      setIsDrawCardDisabled(false);
      setIsDisabled(true);
    } catch (e) {
      console.error(e);
    }
  };

  const drawOneCard = async () => {
    try {
      if (deck) {
        const {
          data: { cards },
        } = await axios.get(drawOneCardFrom(deck?.deck_id));
        setCurrCard(cards[0]);
        // when there is no card, cards[0] === undefined
        // we don't want to push this value into cards
        cards[0] !== undefined && setCardsOnBoard([...cardsOnBoard, cards[0]]);
        setIsDrawCardDisabled(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGuess = (val: string) => {
    if (val === "higher") {
      if (currCard) {
        setGuess({ ...guess, val: currCard?.value, myGuess: "higher" });
      }
      setIsDrawCardDisabled(false);
      return;
    }
    if (val === "lower") {
      if (currCard) {
        setGuess({ ...guess, val: currCard?.value, myGuess: "lower" });
      }
      setIsDrawCardDisabled(false);
      return;
    }
  };

  const calcScore = () => {
    if (currCard) {
      if (guess.myGuess === "higher") {
        const res = formatValue(currCard?.value) - formatValue(guess.val);
        const newScore = res >= 0 ? 1 : 0;
        setGuess({ ...guess, score: guess.score + newScore });
        return;
      }
      if (guess.myGuess === "lower") {
        const res = formatValue(currCard?.value) - formatValue(guess.val);
        const newScore = res < 0 ? 1 : 0;
        setGuess({ ...guess, score: guess.score + newScore });
        return;
      }
    }
  };

  const formatValue = (val: string) => {
    if (val === "ACE") {
      return CourtCards.ACE;
    }
    if (val === "JACK") {
      return CourtCards.JACK;
    }
    if (val === "QUEEN") {
      return CourtCards.QUEEN;
    }
    if (val === "KING") {
      return CourtCards.KING;
    }
    return Number(val);
  };

  const NewGameBtn = isDisabled ? "p-3 bg-red-100 mr-5" : "p-3 bg-red-200 mr-5";
  const DrawCardBtn = isDrawCardDisabled
    ? "p-3 bg-yellow-100"
    : "p-3 bg-yellow-500";

  return (
    <div className="flex flex-col justify-center items-center">
      <h1 className="text-2xl">Begin a card game</h1>
      <p>Cards left: {deck && deck?.remaining}</p>
      <div className="flex justify-center">
        <button
          className={NewGameBtn}
          onClick={handleNewGame}
          disabled={isDisabled}>
          Begin a new game
        </button>
        <button
          onClick={drawOneCard}
          disabled={isDrawCardDisabled}
          className={DrawCardBtn}>
          Draw one card
        </button>
      </div>
      <div className="mt-10">
        {currCard && <img src={currCard?.image} alt="card" />}
        <div className="flex justify-center mt-5">
          <button
            className="p-2 bg-blue-200 mr-5"
            onClick={() => handleGuess("higher")}>
            Higher
          </button>
          <button
            className="p-2 bg-green-200"
            onClick={() => handleGuess("lower")}>
            Lower
          </button>
        </div>
      </div>
      {guess.myGuess && !isDrawCardDisabled && (
        <p>
          Your guess: {guess.myGuess} than {guess.val}
        </p>
      )}

      <p> Your Score: {guess.score}</p>
      <p className="italic">Higher == 'higher and equal'</p>
    </div>
  );
}

export default App;
