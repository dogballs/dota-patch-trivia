import React from 'react';
import axios from 'axios';

import { PlainItemCard } from './item-card';
import { Item } from '../types/item';
import whitelistJSON from '../lib/whitelist.json';
import blacklistJSON from '../lib/blacklist.json';

export default function Editor() {
  const [allItems, setAllItems] = React.useState<Item[]>([]);
  const [allVersions, setAllVersions] = React.useState<string[]>([]);
  const [selectedVersion, setSelectedVersion] = React.useState<
    string | undefined
  >(undefined);
  const [whitelist, setWhitelist] = React.useState<string[]>(whitelistJSON);
  const [blacklist, setBlacklist] = React.useState<string[]>(blacklistJSON);

  React.useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get<Item[]>('combined.json');
      const responseItems = res.data;

      const items = res.data;

      const versions: string[] = [];

      for (const item of items) {
        if (!versions.includes(item.version)) {
          versions.push(item.version);
        }
      }
      versions.sort();

      setAllVersions(versions);
      setAllItems(items);
    };

    fetchData();
  }, []);

  const toggleWhitelist = React.useCallback(
    (itemId: string) => {
      const index = whitelist.indexOf(itemId);
      if (index === -1) {
        setWhitelist([...whitelist, itemId]);
      } else {
        setWhitelist(whitelist.filter((id) => id !== itemId));
      }
    },
    [whitelist],
  );

  const toggleBlacklist = React.useCallback(
    (itemId: string) => {
      const index = blacklist.indexOf(itemId);
      if (index === -1) {
        setBlacklist([...blacklist, itemId]);
      } else {
        setBlacklist(blacklist.filter((id) => id !== itemId));
      }
    },
    [blacklist],
  );

  const counts = React.useMemo(() => {
    return allVersions.map((version) => {
      return whitelist.reduce((acc, id) => {
        if (id.startsWith(version)) {
          return acc + 1;
        }
        return acc;
      }, 0);
    });
  }, [allVersions, whitelist]);

  const versionItems = React.useMemo(() => {
    if (!selectedVersion) {
      return [];
    }
    return allItems.filter((item) => item.version === selectedVersion);
  }, [allItems, selectedVersion]);

  return (
    <div>
      <button
        onClick={() => {
          console.log(whitelist.slice().sort());
        }}
      >
        Log whitelist
      </button>
      <button
        onClick={() => {
          console.log(blacklist.slice().sort());
        }}
      >
        Log blacklist
      </button>
      <VersionSelector
        versions={allVersions}
        onSelect={setSelectedVersion}
        selectedVersion={selectedVersion}
        counts={counts}
      />
      <div>
        {versionItems.map((item, index) => (
          <RemoveOverlay
            isWhitelisted={whitelist.includes(item.id)}
            isBlacklisted={blacklist.includes(item.id)}
            onLeftClick={() => {
              toggleWhitelist(item.id);
            }}
            onRightClick={() => {
              toggleBlacklist(item.id);
            }}
            key={item.id}
          >
            <PlainItemCard item={item} />
          </RemoveOverlay>
        ))}
      </div>
    </div>
  );
}

function RemoveOverlay({
  children,
  isWhitelisted,
  isBlacklisted,
  onLeftClick,
  onRightClick,
}: {
  children: React.ReactNode;
  isWhitelisted: boolean;
  isBlacklisted: boolean;
  onLeftClick: () => void;
  onRightClick: () => void;
}) {
  return (
    <span
      style={{
        display: 'inline-block',
        position: 'relative',
      }}
      onClick={() => {
        onLeftClick();
      }}
      onContextMenu={(ev) => {
        ev.preventDefault();
        onRightClick();
      }}
    >
      {children}
      {(isWhitelisted || isBlacklisted) && (
        <div
          style={{
            position: 'absolute',
            background: isWhitelisted ? 'green' : 'red',
            opacity: 0.5,
            top: 20,
            bottom: 20,
            left: 0,
            right: 20,
            fontSize: 90,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isWhitelisted ? '✓' : '❌'}
        </div>
      )}
    </span>
  );
}

function VersionSelector({
  versions,
  counts,
  onSelect,
  selectedVersion,
}: {
  versions: string[];
  counts: number[];
  onSelect: (version: string) => void;
  selectedVersion: string | undefined;
}) {
  return (
    <div style={{ padding: '20px' }}>
      <select
        value={selectedVersion}
        onChange={(ev) => onSelect(ev.target.value)}
      >
        <option>Select version...</option>
        {versions.map((version, index) => (
          <option value={version} key={version}>
            {version} ({counts[index]})
          </option>
        ))}
      </select>
    </div>
  );
}
