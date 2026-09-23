import React from 'react';
import Link from '@docusaurus/Link';
import { Games } from '@site/src/constants/software';
import { convarUrl } from './url';

interface ConvarProps {
  name: string;
  game?: string; // defaults to cs2
}

// links a console variable/command to its row in the console variable list, usage:
// <Convar name="mp_team_intro_type"/> or <Convar name="dota_camera_distance" game="dota2"/>
export default function Convar({ name, game = 'cs2' }: ConvarProps): React.JSX.Element
{
  if (!name)
  {
    throw new Error('name parameter missing from Convar element');
  }

  if (!Games[game] || game === 'any')
  {
    throw new Error(`Convar game "${game}" is invalid, use one of the games in src/constants/software`);
  }

  return (
    <Link to={convarUrl(name, game)}>
      <code>{name}</code>
    </Link>
  );
}
