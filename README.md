# bitfolly

Because these bits are acting unwise.

Bitfolly is a livecoding tool for creating visuals using bitwise operations,
inspired by [bytebeats](http://countercomplex.blogspot.com/2011/10/algorithmic-symphonies-from-one-line-of.html) and [bitfield patterns](https://twitter.com/aemkei/status/1378106731386040322).

## Usage

Bitfolly programs are essentially a javascript shader that is compiled to run on the GPU by [gpu.js](https://github.com/gpujs/gpu.js)

Each program is run for every pixel on the screen. The coordinates for the current pixel can
be accessed via the `x` and `y` variables.

Additionally, there is a `t` variable that is constantly increasing, which can be used to
animated your creations.

Here's an example of a bitfolly program:
```javascript
(x&y^t/20)%100
```
To run a program in the editor, press "Ctrl-Enter" or click the ▶️ icon in the top right corner.

Most javascript expression can be used, for example, the javascript ternary operator:
```javascript
(t%1000>500?x|y:x^y)%255
```

Or javascript `Math` functions:
```javascript
(x^y&Math.sin(t/300)*255)%255
```