import {basicSetup} from "codemirror"
import {EditorView, keymap} from "@codemirror/view"
import {defaultKeymap, indentWithTab} from "@codemirror/commands"
import {javascript} from "@codemirror/lang-javascript"
import { nord } from 'cm6-theme-nord'


const canvas = document.getElementById("canvas");
canvas.width = Math.floor(window.innerWidth);
canvas.height = Math.floor(window.innerHeight);
const width = canvas.width;
const height = canvas.height;
const gpu = new GPU({canvas});
let kernel;
let previousTime;

function evalCode(code) {
  const codeFn = Function("t", "p", `
    let x = this.thread.x;
    let y = this.thread.y;
    let c = [-1,-1,-1,-1];
    let o = -1;
    ${code.indexOf("o =") >= 0 ? code : "o = " + code}
    if (c[0] !== -1 && c[1] !== -1 && c[2] !== -1 && c[3] !== -1) {
      this.color(c[0], c[1], c[2], c[3]);
    } else {
      o /= 255;
      this.color(o, o, o, 1);
    }
  `);
  let newKernel = gpu.createKernel(codeFn)
    .setDebug(true)
    .setOutput([width, height])
    .setGraphical(true);
  try {
    newKernel(previousTime, canvas);
  } catch (err) {
    console.error(err);
    return true;
  }
  kernel = newKernel;
  params.set("c", code);
  window.history.replaceState({}, '', `${location.pathname}?${params.toString()}`);
  return true;
}

const params = new URLSearchParams(location.search);
let defaultCode = "(x&y^t/20)%100"
if (params.get("c")) {
  defaultCode = params.get("c");
}
setTimeout(()=> evalCode(defaultCode, 10));

const editorDiv = document.getElementById("editor")
const editor = new EditorView({
  doc: defaultCode,
  extensions: [
    keymap.of([{
      key: "Ctrl-Enter",
      run: (view) => evalCode(view.state.doc.toString()),
    }]),
    keymap.of(defaultKeymap),
    keymap.of([indentWithTab]),
    javascript(),
    basicSetup,
    EditorView.lineWrapping,
    nord,
  ],
  parent: editorDiv,
});

function runButtonFn() {
  evalCode(editor.state.doc.toString());
}
const runButton = document.getElementById("runButton");
runButton.onclick = runButtonFn

function render(time) {
  previousTime = time;
  if (kernel) {
    try {
      kernel(time, canvas);
    } catch (err) {
      console.error(err);
    }
  }
  requestAnimationFrame(render)
}
requestAnimationFrame(render);
