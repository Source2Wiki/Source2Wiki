import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl, { useBaseUrlUtils } from '@docusaurus/useBaseUrl';
import { Games } from '@site/src/constants/software';
import styles from './styles.module.css';

const gameHeaders: Record<string, string> = {
  cs2: require('@site/static/img/games/cs2_header.jpg').default,
  hla: require('@site/static/img/games/hla_header.jpg').default,
  dota2: require('@site/static/img/games/dota2_header.jpg').default,
  steamvr: require('@site/static/img/games/steamvr_header.jpg').default,
};

const startHere = [
  { title: 'Editor Tools', to: '/EngineTools', text: 'Hammer, ModelDoc, Material Editor and other engine tools.' },
  { title: 'Community Guides', to: '/CommunityGuides', text: 'Various guides on different topics.' },
  { title: 'Entity List', to: '/EntityList', text: 'Searchable list of every entity in every Source 2 game.' },
  { title: 'Convars', to: '/Convars', text: 'A list of all console variables and commands in all Source 2 games.' },
  { title: 'File Formats', to: '/FileFormats', text: 'Technical details on various Source 2 file formats.' },
  { title: 'How to Edit', to: '/category/how-to-edit', text: 'Guide for new people on how to add or edit a page, annotate an entity, etc...' },
];

export function Hero(): React.JSX.Element {
  return (
    <header className={styles.hero}>
      <img className={`${styles.logo} no-zoom`} src={useBaseUrl('/img/logo.svg')} alt="" width={96} height={96} />
      <div>
        <h1 className={styles.title}>Source2 Wiki</h1>
        <p className={styles.subtitle}>Community driven documentation for everything Source 2.</p>
      </div>
    </header>
  );
}

export function GameCards(): React.JSX.Element {
  const { withBaseUrl } = useBaseUrlUtils();

  return (
    <div className={styles.games}>
      {Object.entries(gameHeaders).map(([game, header]) => (
        <Link key={game} className={styles.game} to={`/Basics/installS2Sdk?game=${game}`}>
          <img className="no-zoom" src={header} alt="" width={460} height={215} loading="lazy" />
          <span className={styles.gameLabel}>
            <img className="no-zoom" src={withBaseUrl(Games[game].IconPath!)} alt="" width={20} height={20} />
            {Games[game].PrettyName}
          </span>
        </Link>
      ))}
    </div>
  );
}

export function StartHere(): React.JSX.Element {
  return (
    <div className={styles.tiles}>
      {startHere.map((tile) => (
        <Link key={tile.to} className={styles.tile} to={tile.to}>
          <strong>{tile.title}</strong>
          <span>{tile.text}</span>
        </Link>
      ))}
    </div>
  );
}
