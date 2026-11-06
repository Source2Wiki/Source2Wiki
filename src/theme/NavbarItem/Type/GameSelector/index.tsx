import clsx from 'clsx';
import GameDropDown from '@site/src/components/GameDropDown';
import { Games } from '@site/src/constants/software';
import { useCallback, useState } from 'react';
import { useGameParam } from '@site/src/contexts/GameParamContext';
import { useHistory, useLocation } from '@docusaurus/router';
import './style.css';

interface Props {
    readonly position?: 'left' | 'right';
}

export default function GameSelectorNavbarItem(props: Props): React.JSX.Element {

    const { selectedGame, setGameParam } = useGameParam();
    const history = useHistory();
    const location = useLocation();

    const [showDropDown, setShowDropDown] = useState<boolean>(false);

    const handleBlur = (event: React.FocusEvent<HTMLDivElement>): void => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
            setShowDropDown(false);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
        if (event.key === 'Escape' && showDropDown) {
            setShowDropDown(false);
            event.currentTarget.querySelector('button')?.focus();
        }
    };

    const setGame = useCallback((game: string) => {
        const params = new URLSearchParams(location.search);

        params.set('game', game);
        history.push({
            pathname: location.pathname,
            search: params.toString(),
        });
        setGameParam(game);
        setShowDropDown(false);
    }, [location, history, setGameParam]);

    const currentGame = selectedGame ?? Games.any;

    return (
        <div className="game-selector" onBlur={handleBlur} onKeyDown={handleKeyDown}>
            <button
                type="button"
                className={clsx("game-selector-toggle", { "has-game": selectedGame })}
                aria-label={`Game: ${currentGame.PrettyName}`}
                aria-expanded={showDropDown}
                aria-haspopup="true"
                onClick={(): void => setShowDropDown(state => !state)}
            >
                {selectedGame && <img src={selectedGame.IconPath} alt="" className="game-selector-game-icon" />}
                <span className="current-game-label">{currentGame.PrettyName}</span>
            </button>

            {showDropDown && (
                <GameDropDown games={Games} gameSelection={setGame} />
            )}
        </div>
    );
}
