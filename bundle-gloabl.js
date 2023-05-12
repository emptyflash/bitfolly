(function () {
  'use strict';

  class Bitfolly {
    constructor(getAudioData, canvas) {
      if (!canvas) {
        canvas = document.getElementById("canvas");
        canvas.width = Math.floor(window.innerWidth);
        canvas.height = Math.floor(window.innerHeight);
      }
      this.gpu = new GPU({canvas});
      this.canvas = canvas;
      this.getAudioData = getAudioData || (() => []);
      this.started = false;
      this.audioTime = 0;
    }

    callKernel(kernel) {
      let width = this.canvas.width;
      let height = this.canvas.height;
      let audioData = this.getAudioData();
      this.audioTime += audioData.reduce((a,b) => a+b, 0)/1000;
      kernel(this.previousTime, this.canvas, width, height, audioData, this.audioTime);
    }

    update(code) {
      const codeFn = Function("t", "p", "w", "h", "a", "at", `
      let x = this.thread.x;
      let y = this.thread.y;
      let c = [-1,-1,-1,-1];
      let o = -1;
      ${/\w\s=\s/.test(code) ? code : "o = " + code}
      if (c[0] !== -1 || c[1] !== -1 || c[2] !== -1 || c[3] !== -1) {
        this.color(
          c[0]==-1?0:c[0]/255,
          c[1]==-1?0:c[1]/255,
          c[2]==-1?0:c[2]/255,
          c[3]==-1?0:c[3]/255,
        );
      } else {
        o = o==-1?0:o/255;
        this.color(o, o, o, 1);
      }
    `);
      let width = this.canvas.width;
      let height = this.canvas.height;
      let kernel = this.gpu.createKernel(codeFn)
        .setOutput([width, height])
        .setGraphical(true);
      // Call it to catch errors early
      this.callKernel(kernel);
      this.kernel = kernel;
    }

    render(time) {
      this.previousTime = time;
      if (this.kernel) {
        try {
          this.callKernel(this.kernel);
        } catch (err) {
          console.error(err);
        }
      }
      requestAnimationFrame(this.render.bind(this));
    }

    start() {
      if (!this.started) {
        this.started = true;
        requestAnimationFrame(this.render.bind(this));
      }
    }
  }

  window.Bitfolly = Bitfolly;

})();
