// basicSetup imports
import {keymap, highlightSpecialChars, drawSelection, highlightActiveLine, dropCursor,
        rectangularSelection, crosshairCursor,
        lineNumbers, highlightActiveLineGutter} from "@codemirror/view"
import {EditorState} from "@codemirror/state"
import {defaultHighlightStyle, syntaxHighlighting, indentOnInput, bracketMatching,
        foldGutter, foldKeymap} from "@codemirror/language"
import {defaultKeymap, history, historyKeymap} from "@codemirror/commands"
import {searchKeymap, highlightSelectionMatches} from "@codemirror/search"
import {autocompletion, completionKeymap} from "@codemirror/autocomplete"
import {lintKeymap} from "@codemirror/lint"

// Actual imports
import {EditorView} from "@codemirror/view"
import {indentWithTab} from "@codemirror/commands"
import {javascript} from "@codemirror/lang-javascript"
import { nord } from 'cm6-theme-nord'
import { vim, Vim, getCM } from "@replit/codemirror-vim"
import { linter } from "@codemirror/lint";

import Bitfolly from "./bitfolly";

const audioCtx = new AudioContext();
if (audioCtx.state === 'suspended') {
    const unlock = () => {
        audioCtx.resume().then(() => {
                document.body.removeEventListener('touchstart', unlock);
                document.body.removeEventListener('touchend', unlock);
                document.body.removeEventListener('click', unlock);
            });
    };

    document.body.addEventListener('touchstart', unlock, false);
    document.body.addEventListener('touchend', unlock, false);
    document.body.addEventListener('click', unlock, false);
}
const analyser = audioCtx.createAnalyser();
analyser.fftSize = 32;
navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);
})
const samples = analyser.frequencyBinCount;
const audioData = new Uint8Array(samples);

const canvas = document.getElementById("canvas");
canvas.width = Math.floor(window.innerWidth);
canvas.height = Math.floor(window.innerHeight);
const bitfolly = new Bitfolly(() => {
  analyser.getByteFrequencyData(audioData);
  return audioData;
}, canvas);

let errors = [];
function errorLint(view) {
  return errors.map(error => {
    return {
      from: 0,
      to: view.state.doc.length,
      severity: "error",
      message: error.toString(),
    }
  });
}

function evalCode(code, view) {
  try {
    bitfolly.update(code);
  } catch (err) {
    errors = [err];
    console.error(err);
    // trigger review of the error
    view?.setState(view?.state);
    return true;
  }
  params.set("c", code);
  window.history.pushState({}, '', `${location.pathname}?${params.toString()}`);
  errors = [];
  // trigger review to clear errors
  view?.setState(view?.state);
  return true;
}

const params = new URLSearchParams(location.search);
let defaultCode = "(x&y^t/20)%100"
if (params.get("c")) {
  defaultCode = params.get("c");
}
let vimExtension = [];
if (params.get("v") !== null) {
  vimExtension = [vim()];
}

export const basicSetup = [
  lineNumbers(),
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
  foldGutter(),
  drawSelection(),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  syntaxHighlighting(defaultHighlightStyle, {fallback: true}),
  bracketMatching(),
  autocompletion(),
  rectangularSelection(),
  crosshairCursor(),
  highlightActiveLine(),
  highlightSelectionMatches(),
  keymap.of([
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...completionKeymap,
    ...lintKeymap
  ])
]

const editorDiv = document.getElementById("editor")
const runCode = (view) => evalCode(view.state.doc.toString(), view)
const editor = new EditorView({
  doc: defaultCode,
  extensions: [
    keymap.of([{
      key: "Ctrl-Enter",
      run: runCode,
    },{
      key: "Cmd-Enter",
      run: runCode
    },{
      key: "Ctrl-e",
      run: (view) => {
        let cm = getCM(view);
        Vim.exitInsertMode(cm);
        return true;
      }
    }]),
    keymap.of(defaultKeymap),
    keymap.of([indentWithTab]),
    javascript(),
    basicSetup,
    EditorView.lineWrapping,
    nord,
    linter(errorLint),
  ].concat(vimExtension),
  parent: editorDiv,
});

setTimeout(()=> evalCode(defaultCode, editor), 10);

function runButtonFn() {
  evalCode(editor.state.doc.toString(), editor);
}
const runButton = document.getElementById("runButton");
runButton.onclick = runButtonFn

Vim.defineEx('write', 'w', function() {
  evalCode(editor.state.doc.toString(), editor);
});
