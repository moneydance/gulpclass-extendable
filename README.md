Make beautiful extendable and configurable gulpfiles with typescript

Forked from [gulpclass](https://www.npmjs.com/package/gulpclass "gulpclass npm")

## Installation

1. Install module:
    `npm install gulpclass --save-dev`

## Usage

1. Create a `gulpfile.ts` and describe your tasks

    ```typescript
    import {Gulpclass, Task, SequenceTask} from 'gulpclass-extendable/Decorators';
    import {ProdConfig} from '../config/prod/prod.config'
    import * as gulp from 'gulp';
    import * as rimraf from 'gulp-rimraf';
    import * as typedoc from 'gulp-typedoc';
    import * as webpack from 'webpack-stream';
    import * as named from 'vinyl-named';
    import * as typedoc from 'gulp-typedoc';

    @Gulpclass
    export class BaseGulpFile {
      constructor(private config:any) {}
      /**
       * Task to clean the dist folder by running force rm -rf on it.
       */
      @Task('clean')
      clean() {
        return gulp.src(this.config.paths.dist.path)
          .pipe(rimraf(this.config.rimraf));
      }

      /**
       * Task to compile typescript code in src
       */
      @Task('webpack')
      tsc() {
        return gulp.src(this.config.paths.entry.path)
          .pipe(named())
          .pipe(webpack(this.config.webpack))
          .pipe(gulp.dest(this.config.paths.dist.path));
      }

      /**
       * Task to compile code base
       */
      @SequenceTask('compile')
      compile() {
        return ['clean', 'webpack'];
      }

      /**
       * Default Task
       */
      @Task('default', ['compile'])
      default() {}
    }

    @Gulpclass
    export class ProdGulpFile extends BaseGulpFile {
      constructor(config:any) {
        super(config);
      }

      @Task('doc')
      doc() {
        return gulp.src(this.config.path.ts.path)
          .pipe(typedoc(this.config.typedoc));
      }

      @SequenceTask('default')
      default() {
        return ['compile', 'doc'];
      }
    }

    new ProdGulpFile(new ProdConfig());
    ```

## First option. Use ts-node

Install [ts-node](https://github.com/TypeStrong/ts-node), it supports
running gulp tasks directly using gulp command


## Second option. If you don't want to use ts-node

There is a caveat of using gulp and typescript together. The problem is
that when you run your `gulp` commands in console, gulp cannot read your
tasks from your typescript code - it can read only from `gulpfile.js`.

But there is a simple workaround - you can create a gulpfile.js, compile
and execute typescript on-the-fly. Create a **gulpfile.js** and put
there this piece of code:
```javascript
eval(require("typescript").transpile(require("fs").readFileSync("./gulpfile.ts").toString()));
```
This piece of code reads your gulpfile.ts contents, and asks typescript
to transpile it on-the-fly and executes transpiled result as javascript.

(you need to run `npm install typescript --save-dev` if you dont have
typescript package installed)

Please note that if you are NOT using `outDir` in typescript compile
options, you may have problems if your gulpclass file is named
`gulpfile.ts` typescript compiler will try to compile it to
`gulpfile.js`, and will override code you added to gulpfile.js. Solution
is simple - rename your `gulpfile.ts`. You can call it as you wish,  for
example you can call it `gulpclass.ts`.
