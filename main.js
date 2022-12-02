import {basicSetup} from "codemirror"
import {EditorView, keymap} from "@codemirror/view"
import {defaultKeymap} from "@codemirror/commands"
import {javascript} from "@codemirror/lang-javascript"


const canvas = document.getElementById("canvas");
canvas.width = Math.floor(window.innerWidth);
canvas.height = Math.floor(window.innerHeight);
const width = canvas.width;
const height = canvas.height;
const ctx = canvas.getContext("2d");

const gpu = new GPU();
let kernel;
function evalCode(code) {
  const codeFn = Function("t", `
    let x = this.thread.x;
    let y = this.thread.y;
    return ${code};
  `);
  kernel = gpu.createKernel(codeFn).setOutput([width, height]);
  params.set("c", code);
  window.history.replaceState({}, '', `${location.pathname}?${params.toString()}`);
  return true;
}

function render(time) {
  const outputBufferRaw = kernel(time);
  const outputBuffer = new Uint8ClampedArray(width*height*4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width*4; x++) {
      outputBuffer[x*4+y*width*4] = outputBufferRaw[y][x];
      outputBuffer[x*4+y*width*4+1] = outputBufferRaw[y][x];
      outputBuffer[x*4+y*width*4+2] = outputBufferRaw[y][x];
      outputBuffer[x*4+y*width*4+3] = 255;
    }
  }
  const output = new ImageData(outputBuffer, width, height);
  ctx.putImageData(output, 0, 0);
  requestAnimationFrame(render)
}
requestAnimationFrame(render);

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
  ],
  parent: editorDiv,
});

function runButtonFn() {
  evalCode(editor.state.doc.toString());
}
const runButton = document.getElementById("runButton");
runButton.onclick = runButtonFn
