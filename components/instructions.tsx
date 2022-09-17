import React from 'react';
import GitHubButton from 'react-github-btn';
import styles from '../styles/instructions.module.scss';
import Button from './button';
import Score from './score';

interface Props {
  highscore: number;
  start: () => void;
}

export default function Instructions(props: Props) {
  const { highscore, start } = props;

  return (
    <div className={styles.instructions}>
      <div className={styles.wrapper}>
        <h2>Dota 2 Patch Trivia</h2>
        <h3>Place the cards on the timeline in the correct order</h3>
        {highscore !== 0 && (
          <div className={styles.highscoreWrapper}>
            <Score score={highscore} title="Best streak" />
          </div>
        )}
        <Button onClick={start} text="Start game" />
        <div className={styles.about}>
          <div>
            All data sourced from{' '}
            <a
              href="https://liquipedia.net/dota2/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Liquipedia
            </a>{' '}
          </div>
          <div>
            Inspired by{' '}
            <a
              href="https://wikitrivia.tomjwatson.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              wikitrivia.tomjwatson.com
            </a>{' '}
          </div>
          <div>
            Have feedback? Please report it on{' '}
            <a
              href="https://github.com/dogballs/dota-patch-trivia/issues"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
          <GitHubButton
            href="https://github.com/dogballs/dota-patch-trivia"
            data-size="large"
            data-show-count="true"
            aria-label="Star dogballs/dota-patch-trivia on GitHub"
          >
            Star
          </GitHubButton>
        </div>
      </div>
    </div>
  );
}
