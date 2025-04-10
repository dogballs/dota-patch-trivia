import React, { useState } from 'react';
import axios from 'axios';
import { GameState } from '../types/game';
import { Item } from '../types/item';
import createState from '../lib/create-state';
import Board from './board';
import Loading from './loading';
import Instructions from './instructions';
import whitelistJSON from '../lib/whitelist.json';
import blacklistJSON from '../lib/blacklist.json';

export default function Game() {
  const [state, setState] = useState<GameState | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [started, setStarted] = useState(false);
  const [items, setItems] = useState<Item[] | null>(null);
  const [isCurated, setIsCurated] = useState(true);

  React.useEffect(() => {
    const fetchGameData = async () => {
      const res = await axios.get<Item[]>('combined.json');
      const responseItems = res.data;
      const filteredItems = responseItems
        .filter((item) => {
          if (isCurated) {
            return (whitelistJSON as string[]).includes(item.id);
          }
          return item;
        })
        .filter((item) => {
          return !(blacklistJSON as string[]).includes(item.id);
        });
      setItems(filteredItems);
    };

    fetchGameData();
  }, []);

  React.useEffect(() => {
    (async () => {
      if (items !== null) {
        setState(await createState(items));
        setLoaded(true);
      }
    })();
  }, [items]);

  const resetGame = React.useCallback(() => {
    (async () => {
      if (items !== null) {
        setState(await createState(items));
      }
    })();
  }, [items]);

  const [highscore, setHighscore] = React.useState<number>(
    Number(localStorage.getItem('highscore') ?? '0'),
  );

  const updateHighscore = React.useCallback((score: number) => {
    localStorage.setItem('highscore', String(score));
    setHighscore(score);
  }, []);

  if (!loaded || state === null) {
    return <Loading />;
  }

  if (!started) {
    return (
      <Instructions highscore={highscore} start={() => setStarted(true)} />
    );
  }

  return (
    <Board
      highscore={highscore}
      state={state}
      setState={setState}
      resetGame={resetGame}
      updateHighscore={updateHighscore}
    />
  );
}
