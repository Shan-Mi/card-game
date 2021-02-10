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
  cards: Card[];
  remaining: string;
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
  const [cards, setCards] = useState<Card[]>([]);
  const [currCard, setCurrCard] = useState<Card>();
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [isDrawCardDisabled, setIsDrawCardDisabled] = useState<boolean>(false);
  const [guess, setGuess] = useState<Guess>({
    val: "",
    score: 0,
    myGuess: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (deck?.deck_id) {
        const { data } = await axios.get(getDeckStatus(deck?.deck_id));
        setDeck(data);
      }
    };
    fetchData();
    calcScore();
  }, [cards]);

  const handleNewGame = async () => {
    const { data } = await axios.get(NewRoundURL);
    setDeck(data);
    drawOneCard();
    // setCards)
    // console.log(data);
    setIsDisabled(true);
  };

  const drawOneCard = async () => {
    if (deck) {
      const {
        data: { cards },
      } = await axios.get(drawOneCardFrom(deck?.deck_id));
      // console.log(cards[0]);
      setCurrCard(cards[0]);
      setCards([...cards, cards[0]]);
      // console.log(cards);
      setGuess({ ...guess, val: "", myGuess: "" });
    }
    setIsDrawCardDisabled(true);
  };
  // const;

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
    console.log("your guess", guess.myGuess, "than", guess.val);
    if (currCard) {
      console.log("current card", formatValue(currCard?.value));
      if (guess.myGuess === "higher") {
        const res = formatValue(currCard?.value) - formatValue(guess.val);
        const newScore = res >= 0 ? 1 : 0;
        setGuess({ ...guess, score: guess.score + newScore });
        return;
        // console.log(res);
      }
      if (guess.myGuess === "lower") {
        const res = formatValue(currCard?.value) - formatValue(guess.val);
        const newScore = res < 0 ? 1 : 0;
        setGuess({ ...guess, score: guess.score + newScore });
        console.log(res);
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
      {guess.myGuess && (
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
