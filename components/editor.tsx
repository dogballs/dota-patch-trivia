import React from 'react';
import axios from 'axios';

import { PlainItemCard } from './item-card';
import { Item } from '../types/item';
import badCards from '../lib/bad-cards';

export default function Editor() {
  const [allItems, setAllItems] = React.useState<Item[]>([]);
  const [allVersions, setAllVersions] = React.useState<string[]>([]);
  const [selectedVersion, setSelectedVersion] = React.useState<
    string | undefined
  >(undefined);
  const [blacklist, setBlacklist] = React.useState<string[]>(badCards);

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
          console.log(blacklist.slice().sort());
        }}
      >
        Log blacklist
      </button>
      <VersionSelector
        versions={allVersions}
        onSelect={setSelectedVersion}
        selectedVersion={selectedVersion}
      />
      <div>
        {versionItems.map((item, index) => (
          <RemoveOverlay
            active={blacklist.includes(item.id)}
            onClick={() => {
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
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <span
      style={{
        display: 'inline-block',
        position: 'relative',
      }}
      onClick={() => {
        onClick();
      }}
    >
      {children}
      {active && (
        <div
          style={{
            position: 'absolute',
            background: 'red',
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
          ❌
        </div>
      )}
    </span>
  );
}

function VersionSelector({
  versions,
  onSelect,
  selectedVersion,
}: {
  versions: string[];
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
        {versions.map((version) => (
          <option value={version} key={version}>
            {version}
          </option>
        ))}
      </select>
    </div>
  );
}
