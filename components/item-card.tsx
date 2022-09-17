import React from 'react';
import classNames from 'classnames';
import { useSpring, animated } from 'react-spring';
import { Draggable } from 'react-beautiful-dnd';
import { Item, PlayedItem } from '../types/item';
import { createImageUrl } from '../lib/items';
import styles from '../styles/item-card.module.scss';

type Props = {
  draggable?: boolean;
  flippedId?: null | string;
  index: number;
  item: Item | PlayedItem;
  setFlippedId?: (flippedId: string | null) => void;
};

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function ItemCard(props: Props) {
  const { draggable, flippedId, index, item, setFlippedId } = props;

  const flipped = item.id === flippedId;

  const cardSpring = useSpring({
    opacity: flipped ? 1 : 0,
    transform: `perspective(600px) rotateY(${flipped ? 180 : 0}deg)`,
    config: { mass: 5, tension: 750, friction: 100 },
  });

  let bottomStr = 'changed in patch';
  if (item.category === 'new-hero' || item.category === 'new-item') {
    bottomStr = 'added in patch';
  }
  if ('played' in item) {
    bottomStr = item.version;
  }

  const cleanDescription = item.descriptionHtml
    .replaceAll('<a>', '')
    .replaceAll('</a>', ' ');

  return (
    <Draggable draggableId={item.id} index={index} isDragDisabled={!draggable}>
      {(provided, snapshot) => {
        return (
          <div
            className={classNames(styles.itemCard, {
              [styles.played]: 'played' in item,
              [styles.flipped]: flipped,
              [styles.dragging]: snapshot.isDragging,
            })}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            // onClick={() => {
            //   if ('played' in item && setFlippedId) {
            //     if (flipped) {
            //       setFlippedId(null);
            //     } else {
            //       setFlippedId(item.id);
            //     }
            //   }
            // }}
          >
            <animated.div
              className={styles.front}
              style={{
                opacity: cardSpring.opacity.to((o) => 1 - o),
                transform: cardSpring.transform,
              }}
            >
              <div className={styles.top}>
                {
                  <div
                    className={styles.image}
                    style={{
                      backgroundImage: item.imageSrc
                        ? `url("${createImageUrl(item.imageSrc)}")`
                        : undefined,
                    }}
                  ></div>
                }
                <div className={styles.label}>{capitalize(item.label)}</div>
              </div>
              <div
                className={styles.type}
                dangerouslySetInnerHTML={{ __html: cleanDescription }}
              />
              <animated.div
                className={classNames(styles.bottom, {
                  [styles.correct]: 'played' in item && item.played.correct,
                  [styles.incorrect]: 'played' in item && !item.played.correct,
                })}
              >
                {<span>{bottomStr}</span>}
              </animated.div>
            </animated.div>
            {/*<animated.div
              className={styles.back}
              style={{
                opacity: cardSpring.opacity,
                transform: cardSpring.transform.to(
                  (t) => `${t} rotateX(180deg) rotateZ(180deg)`
                ),
              }}
            >
              <span className={styles.label}>{capitalize(item.label)}</span>
              <span className={styles.date}>
                {capitalize(datePropIdMap[item.date_prop_id])}: {item.year}
              </span>
              <span className={styles.description}>{item.description}.</span>
              <a
                href={`https://www.wikipedia.org/wiki/${encodeURIComponent(
                  item.wikipedia_title
                )}`}
                className={styles.wikipedia}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                Wikipedia
              </a>
            </animated.div>*/}
          </div>
        );
      }}
    </Draggable>
  );
}
