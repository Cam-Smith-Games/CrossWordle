
type LetterStatus = "correct" | "present" | "absent";

export class CrossWordle {

    grid = document.getElementById("grid") as HTMLElement;
    keyboard = document.getElementById("keyboard") as HTMLElement;

    word:string;

    row = 0;
    col = 0;

    constructor() {

    }



    // #region keyboard
    simulateKeyPress(input:HTMLInputElement, key:string, keyCode: number) {
        input.dispatchEvent( new KeyboardEvent("keydown", { key, code: key, keyCode, which: keyCode, bubbles: true }));
    }

    getKeyButton(key:string) {
        return this.keyboard.querySelector(`button.key[data-key='${key}']`) as HTMLButtonElement;
    }

    createKeyboard() {
        this.keyboard.innerHTML = ""; 

        for (let row of ["QWERTYUIOP", "ASDFGHJKL", ">ZXCVBNM<"]) {
            const rowDiv = document.createElement("div");
            rowDiv.style.display = "flex";
            rowDiv.style.justifyContent = "center";
    
            for (let letter of row.split("")) {
                const button = document.createElement("button");
                button.classList.add("key");
                button.dataset.key = letter;

                // goofy letter encoding for special buttons: > = enter, < = backspace
                if (letter == ">") {
                    const inner = document.createElement("span");
                    inner.textContent = "Enter";
                    button.appendChild(inner);
                    button.classList.add("btn-special");
                    button.addEventListener("click", () => {
                        const cell = this.getActiveCell();
                        if (cell) this.simulateKeyPress(cell, "Enter", 13);
                    });
                }
                else if (letter == "<") {
                    button.textContent = "backspace";
                    button.classList.add("btn-special");
                    button.classList.add("material-icons");
                    button.addEventListener("click", () => {           
                        // if no focused input, default to last one that has a value
                        let cell = this.grid.querySelector(`.cell:focus`) as HTMLInputElement;
                        if (!cell) {
                            // NOTE: last-of-type doesn't seem to work here, need to put into array and pick the last one
                            const cellsWithValue = this.getCellsWithValue();
                            if (cellsWithValue.length) cell = cellsWithValue[cellsWithValue.length - 1] as HTMLInputElement;             
                        }
                        if (cell) {
                            cell.value = "";
                            this.simulateKeyPress(cell, "Backspace", 8);
                        }
                    });
                }
                else {
                    button.textContent = letter;
                    button.addEventListener("mousedown", e => e.preventDefault());
                    button.addEventListener("click", () => {
                        const cell = this.getActiveCell();
                        if (cell) {
                            cell.value = letter;
                            const nextCell = this.getCell(Number(cell.dataset.row), Number(cell.dataset.col) + 1);
                            if (nextCell) nextCell.focus();
                        }
                    });
                }

                rowDiv.appendChild(button);
            }
    
            this.keyboard.appendChild(rowDiv);
        }
    }
    // #endregion

    getActiveCell() {
        // look for focused cell. if none found, default to first available
        //return (this.grid.querySelector(`.cell:focus`) ?? this.grid.querySelector(".cell:not([disabled])")) as HTMLInputElement;
        let cell = this.grid.querySelector(`.cell:focus`) as HTMLInputElement;
        if (!cell) {
            cell =  this.grid.querySelector(".cell:not([disabled])") as HTMLInputElement;
            if (cell) cell.focus();   
        }
        return cell;
    }
    getCell(row:number, col:number) {
        return this.grid.querySelector(`.cell[data-row='${row}'][data-col='${col}']`) as HTMLInputElement;
    }
    getEnabledCells() {
        return Array.from(this.grid.querySelectorAll('.cell:not(:disabled)')) as HTMLInputElement[];
    }
    getCellsWithValue() {
        return this.getEnabledCells().filter(c => c.value);
    }





    validateWord (cells: HTMLInputElement[]) {
        if (cells.length !== this.word.length) {
            throw new Error("Input and target word must have the same length.");
        }

        let successCount = 0;
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            const value = cell.value.toUpperCase();

            let status = "gray";
            if (value === this.word[i]) {
                status = "green";
                successCount++;
            } 
            else if (this.word.includes(value)) {
                status = "yellow";
            } 

            cell.classList.add(status);
            const key = this.getKeyButton(value);
            if (key) key.className = "key " + status;
        }

        // all green -> DONE
        return successCount == cells.length;
    }



    async submit() {
        const cellsWithValue = this.getCellsWithValue();

        if (cellsWithValue.length == this.word.length) {
            // SUBMIT
            console.log("SUBMIT");

            const value = cellsWithValue.map(c => c.value).join("");
            console.log("awaiting response...");
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${value}`);
            console.log("response received!");
            if (response.ok) {
                const data = await response.json();
                // If the response contains an array, the word exists
                const exists = Array.isArray(data) && data.length > 0;

                if (exists) {
                    console.log("WORD EXISTS");

                    for (let cell of cellsWithValue) cell.disabled = true;

                    const win = this.validateWord(cellsWithValue);

                    // TODO: really need to separate game data from UI. with this logic, you could cheat and have infinite turns by manipulating the UI...

                    if (win) {
                        alert("YOU WIN");
                        // TODO: validate FULL game state (entire minimap) to determine if it's a full win or just done with this word
                    }
                    else {
                        const row = Number(cellsWithValue[0].dataset.row);
                        const cells = Array.from(this.grid.querySelectorAll(`.cell[data-row='${row + 1}']`)) as HTMLInputElement[];

                        if (cells.length ) {
                            for (let cell of cells) cell.disabled = false;
                            cells[0].focus();
                        }
                        // no next row available, you're out of turns
                        else {
                            alert("YOU LOSE");
                        }
                    }

                    return;
                }
            }

          
            // invalid word: clear and reset
            for (let cell of this.getCellsWithValue()) cell.value = "";

            setTimeout(() => {
                this.getCell(this.row, 0)?.focus();
            }, 0)
 


       
        }
        else {
            // TODO: error animation to show that it's not a real word
            console.error("NO");
        }
    }


    createGrid(numTurns = 6) {

        for (let row = 0; row < numTurns; row++) {
            for (let col = 0; col < this.word.length; col++) {
                const cell = document.createElement("input");
                cell.classList.add("cell");
                cell.type = "input";
                cell.maxLength = 1;
                cell.pattern = "[A-Za-z]";
                cell.dataset.row = row.toString();
                cell.dataset.col = col.toString();

                cell.disabled = row > 0;

                // when focusing input, select it (highlight text) so that typing will overwrite current value
                // NOTE: requestAnimationFrame delays it a bit to prevent deselecting when spam clicking
                cell.addEventListener("focus", () => {
                    this.row = row;
                    this.col = col;
                    requestAnimationFrame(() => cell.select());
                });
                
                cell.addEventListener("keydown", (event: KeyboardEvent) => {
                    console.log("KEYDOWN: ", event.key );

                    // backspace goes back a column if pressed while already empty
                    if (event.key === "Backspace") {
                        if (col > 0 && !cell.value) {
                            const prevInput = this.getCell(row, col - 1);
                            if (prevInput) requestAnimationFrame(() => prevInput.focus());
                        }
                    }   
                    else if (event.key === "Enter") {
                        this.submit();
                    }
                });

                cell.addEventListener("input", () => {
                    // any other character gets capitalized and moves forward a column
                    cell.value = cell.value.replace(/[^A-Za-z]/g, '').toUpperCase();
                    if (cell.value && col < this.word.length - 1) {
                        // Move to the next input on the same row
                        const nextInput = this.getCell(row, col + 1);
                        if (nextInput) nextInput.focus();
                    }

                })

                this.grid.appendChild(cell);
            }
        }
    }




    async setRandomWord(length = 5) {
        // this api works but it returns really goofy uncommon words. there's some wordnik api but it requires api key. i'm not sure about any others
        // for now, just pull from a giant chatgpt list and pick a random one...
        //const response = await fetch(`https://random-word-api.herokuapp.com/word?number=1&length=${length}`)
        const response = await fetch("./data/5_letter_words.json");
        const words = await response.json();
        if (Array.isArray(words) && words.length) {
            const word = words[Math.floor(Math.random() * words.length)];// words[0];
            this.setWord(word);
        }
        else alert("Failed to fetch random word with length = " + length);
    }

    setWord(word:string) {
        this.word = word.toUpperCase();
        console.log("WORD = " + word);
        this.createGrid();
        this.createKeyboard();
    }
}

