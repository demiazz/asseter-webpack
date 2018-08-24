import { compilation as compilationNS, Compiler, Plugin } from "webpack";

// Types

type Compilation = compilationNS.Compilation;

interface IStats {
  entrypoints: {
    [key: string]: {
      assets: string[];
    };
  };
}

// Parse

const getStats = (compilation: Compilation): IStats => {
  return compilation.getStats().toJson({
    entrypoints: true
  });
};

const getEntrypoints = (stats: IStats) => {
  const entries = Object.keys(stats.entrypoints);

  return entries.reduce<{ [key: string]: string[] }>((entrypoints, name) => {
    entrypoints[name] = stats.entrypoints[name].assets;

    return entrypoints;
  }, {});
};

const getManifest = (compilation: Compilation): string => {
  const stats = getStats(compilation);
  const entrypoints = getEntrypoints(stats);

  return JSON.stringify({
    entrypoints
  });
};

// Plugin

export class ManifestPlugin implements Plugin {
  constructor(private output: string) {}

  public apply(compiler: Compiler) {
    compiler.plugin("emit", (compilation: Compilation, done) => {
      let result: string;

      compilation.assets[this.output] = {
        size() {
          return result ? result.length : 0;
        },

        source() {
          result = getManifest(compilation);

          return result;
        }
      };

      done();
    });
  }
}
