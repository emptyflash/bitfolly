import {basicSetup} from "codemirror"
import {EditorView, keymap} from "@codemirror/view"
import {defaultKeymap} from "@codemirror/commands"
import {javascript} from "@codemirror/lang-javascript"
import { nord } from 'cm6-theme-nord'


const canvas = document.getElementById("canvas");
canvas.width = Math.floor(window.innerWidth);
canvas.height = Math.floor(window.innerHeight);
const width = canvas.width;
const height = canvas.height;
const context = canvas.getContext("webgl2", { preserveDrawingBuffer: true });

const gpu = new GPU({canvas, context});
let kernel;

function evalCode(code) {
  const codeFn = Function("t", `
    let x = this.thread.x;
    let y = this.thread.y;
    let result = ${code}
    result /= 255;
    this.color(result, result, result, 1);
  `);
  kernel = gpu.createKernel(codeFn).setOutput([width, height]).setGraphical(true);
  params.set("c", code);
  window.history.replaceState({}, '', `${location.pathname}?${params.toString()}`);
  return true;
}

const params = new URLSearchParams(location.search);
if (params.get("c")) {
  evalCode(params.get("c"));
}

const editorDiv = document.getElementById("editor")
const editor = new EditorView({
  doc: params.get("c"),
  extensions: [
    keymap.of([{
      key: "Ctrl-Enter",
      run: (view) => evalCode(view.state.doc.toString()),
    }]),
    keymap.of(defaultKeymap),
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
  if (kernel) {
    kernel(time);
  }
  requestAnimationFrame(render)
}
requestAnimationFrame(render);
