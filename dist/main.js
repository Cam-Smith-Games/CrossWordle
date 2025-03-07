(()=>{"use strict";var e=function(e,t,s,l){return new(s||(s=Promise))((function(o,n){function r(e){try{a(l.next(e))}catch(e){n(e)}}function i(e){try{a(l.throw(e))}catch(e){n(e)}}function a(e){var t;e.done?o(e.value):(t=e.value,t instanceof s?t:new s((function(e){e(t)}))).then(r,i)}a((l=l.apply(e,t||[])).next())}))};console.log("HELLO FROM MAIN.TS"),(new class{constructor(){this.grid=document.getElementById("grid"),this.keyboard=document.getElementById("keyboard"),this.row=0,this.col=0}simulateKeyPress(e,t,s){e.dispatchEvent(new KeyboardEvent("keydown",{key:t,code:t,keyCode:s,which:s,bubbles:!0}))}getKeyButton(e){return this.keyboard.querySelector(`button.key[data-key='${e}']`)}createKeyboard(){this.keyboard.innerHTML="";for(let e of["QWERTYUIOP","ASDFGHJKL",">ZXCVBNM<"]){const t=document.createElement("div");t.style.display="flex",t.style.justifyContent="center";for(let s of e.split("")){const e=document.createElement("button");if(e.classList.add("key"),e.dataset.key=s,">"==s){const t=document.createElement("span");t.textContent="Enter",e.appendChild(t),e.classList.add("btn-special"),e.addEventListener("click",(()=>{const e=this.getActiveCell();e&&this.simulateKeyPress(e,"Enter",13)}))}else"<"==s?(e.textContent="backspace",e.classList.add("btn-special"),e.classList.add("material-icons"),e.addEventListener("click",(()=>{let e=this.grid.querySelector(".cell:focus");if(!e){const t=this.getCellsWithValue();t.length&&(e=t[t.length-1])}e&&(e.value="",this.simulateKeyPress(e,"Backspace",8))}))):(e.textContent=s,e.addEventListener("mousedown",(e=>e.preventDefault())),e.addEventListener("click",(()=>{const e=this.getActiveCell();if(e){e.value=s;const t=this.getCell(Number(e.dataset.row),Number(e.dataset.col)+1);t&&t.focus()}})));t.appendChild(e)}this.keyboard.appendChild(t)}}getActiveCell(){let e=this.grid.querySelector(".cell:focus");return e||(e=this.grid.querySelector(".cell:not([disabled])"),e&&e.focus()),e}getCell(e,t){return this.grid.querySelector(`.cell[data-row='${e}'][data-col='${t}']`)}getEnabledCells(){return Array.from(this.grid.querySelectorAll(".cell:not(:disabled)"))}getCellsWithValue(){return this.getEnabledCells().filter((e=>e.value))}validateWord(e){if(e.length!==this.word.length)throw new Error("Input and target word must have the same length.");let t=0;for(let s=0;s<e.length;s++){const l=e[s],o=l.value.toUpperCase();let n="gray";o===this.word[s]?(n="green",t++):this.word.includes(o)&&(n="yellow"),l.classList.add(n);const r=this.getKeyButton(o);r&&(r.className="key "+n)}return t==e.length}submit(){return e(this,void 0,void 0,(function*(){const e=this.getCellsWithValue();if(e.length==this.word.length){console.log("SUBMIT");const t=e.map((e=>e.value)).join("");console.log("awaiting response...");const s=yield fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${t}`);if(console.log("response received!"),s.ok){const t=yield s.json();if(Array.isArray(t)&&t.length>0){console.log("WORD EXISTS");for(let t of e)t.disabled=!0;if(this.validateWord(e))alert("YOU WIN");else{const t=Number(e[0].dataset.row),s=Array.from(this.grid.querySelectorAll(`.cell[data-row='${t+1}']`));if(s.length){for(let e of s)e.disabled=!1;s[0].focus()}else alert("YOU LOSE")}return}}for(let e of this.getCellsWithValue())e.value="";setTimeout((()=>{var e;null===(e=this.getCell(this.row,0))||void 0===e||e.focus()}),0)}else console.error("NO")}))}createGrid(e=6){for(let t=0;t<e;t++)for(let e=0;e<this.word.length;e++){const s=document.createElement("input");s.classList.add("cell"),s.type="input",s.maxLength=1,s.pattern="[A-Za-z]",s.dataset.row=t.toString(),s.dataset.col=e.toString(),s.disabled=t>0,s.addEventListener("focus",(()=>{this.row=t,this.col=e,requestAnimationFrame((()=>s.select()))})),s.addEventListener("keydown",(l=>{if(console.log("KEYDOWN: ",l.key),"Backspace"===l.key){if(e>0&&!s.value){const s=this.getCell(t,e-1);s&&requestAnimationFrame((()=>s.focus()))}}else"Enter"===l.key&&this.submit()})),s.addEventListener("input",(()=>{if(s.value=s.value.replace(/[^A-Za-z]/g,"").toUpperCase(),s.value&&e<this.word.length-1){const s=this.getCell(t,e+1);s&&s.focus()}})),this.grid.appendChild(s)}}setRandomWord(t=5){return e(this,void 0,void 0,(function*(){const e=yield fetch("./data/5_letter_words.json"),s=yield e.json();if(Array.isArray(s)&&s.length){const e=s[Math.floor(Math.random()*s.length)];this.setWord(e)}else alert("Failed to fetch random word with length = "+t)}))}setWord(e){this.word=e.toUpperCase(),console.log("WORD = "+e),this.createGrid(),this.createKeyboard()}}).setRandomWord()})();
//# sourceMappingURL=main.js.map