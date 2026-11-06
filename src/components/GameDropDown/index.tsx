import React from "react";
import { SoftwareInfo } from '@site/src/constants/software';
import './style.css';

type DropDownProps = {
    games: Record<string, SoftwareInfo>;
    gameSelection: (game: string) => void;
};

const GameDropDown: React.FC<DropDownProps> = ({ games, gameSelection }: DropDownProps): React.JSX.Element => {
    const gameUrlNames = Object.keys(games);

    return (
        <div className="game-dropdown">
            {gameUrlNames.map(
                (game: string): React.JSX.Element => {
                    const iconPath = games[game].IconPath;

                    return (
                        <button
                            key={game}
                            type="button"
                            onClick={(): void => gameSelection(game)}
                        >
                            <span className="game-dropdown-icon">
                                {iconPath && <img src={iconPath} alt="" />}
                            </span>
                            {games[game].PrettyName}
                        </button>
                    );
                }
            )}
        </div>
    );
}

export default GameDropDown;