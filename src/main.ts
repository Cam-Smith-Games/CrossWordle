console.log("HELLO FROM MAIN.TS");



import { CrossWordle } from "./cross-wordle";

const game = new CrossWordle();
game.setRandomWord();



/*
    GAME SUMMARY:
        - cross wordle is multiple wordles being played simultaneously, with words intersecting
        - each word is played separately with it's own X turns and Y length
        - user can click cells on the minimap to switch between words, updating UI 
        - the minimap cell colors will update based on most recently played word. the entire row/column will get a border based on selection and game state
            - yellow border = currently selected
            - grayed out = failed and no turns remaining. it will only show corectly placed letters that intersect with other words, assuming they were picked at some point
            - green border = success 
            
            
    MAJOR TODO SUMMARY:
        - base game
            wordle grid
            keyboard
        - minimap


*/