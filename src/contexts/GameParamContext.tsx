import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { useLocation } from "@docusaurus/router";
import { Games, SoftwareInfo } from "@site/src/constants/software";

interface GameParamContextType {
    gameParam: string;
    selectedGame?: SoftwareInfo;
    setGameParam: (value: string) => void;
}

const GameParamContext = createContext<GameParamContextType>({
    gameParam: "any",
    setGameParam: () => { },
});

function applyThemeColor(game: string): void {
    const themeColor = Games[game]?.Color;
    const rootStyle = document.documentElement.style;

    if (themeColor) {
        rootStyle.setProperty('--wiki-theme', themeColor);
    } else {
        rootStyle.removeProperty('--wiki-theme');
    }
}

export function GameParamProvider({ children }: { children: ReactNode }) {
    const location = useLocation();
    const [gameParam, setGameParamState] = useState<string>("any");

    const setGameParam = useCallback((game: string) => {
        setGameParamState(game);
        applyThemeColor(game);
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        let game = params.get('game');
        if (game) setGameParam(game);
    }, [location.search, setGameParam]);

    const selectedGame = gameParam !== "any" ? Games[gameParam] : undefined;

    return (
        <GameParamContext.Provider value={{ gameParam, selectedGame, setGameParam }}>
            {children}
        </GameParamContext.Provider>
    );
}

export function useGameParam(): GameParamContextType {
    return useContext(GameParamContext);
}