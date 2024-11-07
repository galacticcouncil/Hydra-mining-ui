import fs from "node:fs/promises"
import path from "node:path"

import { permutateThemes, register } from "@tokens-studio/sd-transforms"
import StyleDictionary from "style-dictionary"

register(StyleDictionary)

const fetchTokens = async () => {
  const res = await fetch(
    "https://raw.githubusercontent.com/galacticcouncil/hydration-styles/refs/heads/tertiary/tokens.json",
  )

  return res.json()
}

const saveFile = async (path, content) => {
  const directory = path.substring(0, path.lastIndexOf("/"))
  await fs.mkdir(directory, { recursive: true })
  await fs.writeFile(path, JSON.stringify(content, null, 2))
}

async function run() {
  const tokens = await fetchTokens()

  const tokenFiles = Object.entries(tokens).map(async ([name, value]) => {
    await saveFile(`./style-dictionary/tokens/${name}.json`, value)
  })

  await Promise.all(tokenFiles)

  const $themes = JSON.parse(
    await fs.readFile(path.resolve(import.meta.dirname, "tokens/$themes.json")),
  )

  const themes = permutateThemes($themes)

  const configs = Object.entries(themes).map(([theme, sets]) => ({
    source: sets.map((tokenset) =>
      path.resolve(import.meta.dirname, `tokens/${tokenset}.json`),
    ),
    preprocessors: ["tokens-studio"],
    platforms: {
      js: {
        transformGroup: "tokens-studio",
        buildPath: "./src/",
        files: [
          {
            format: "json/nested",
            destination: `theme/tokens/${theme}.json`,
          },
        ],
      },
    },
  }))

  async function build(cfg) {
    const sd = new StyleDictionary(cfg)
    await sd.buildAllPlatforms()
  }
  await Promise.all(configs.map(build))
}

run()
