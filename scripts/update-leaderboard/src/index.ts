import fs from "node:fs/promises";
import path from "node:path";
import yargs from "yargs";
import { parse as parseCSV } from "csv-parse/sync";
import { stringify as stringifyCSV } from "csv-stringify/sync";

import { logger } from "./logger";

import type { CSVRow } from "./types";

const findRoot = async () => {
  let currentPath = process.cwd();
  while (true) {
    const packageJsonPath = path.join(currentPath, "package.json");
    try {
      const packageJson = await fs.readFile(packageJsonPath, "utf-8");
      const { name } = JSON.parse(packageJson);
      if (name === "web-speed-hackathon") {
        return currentPath;
      }
    } catch (error) {
      // continue searching in parent directory
    }

    const parentPath = path.dirname(currentPath);
    if (parentPath === currentPath) {
      throw new Error("Root directory not found");
    }
    currentPath = parentPath;
  }
};

async function main() {
  const argv = await yargs
    .option("score-csv", {
      type: "string",
      demandOption: true,
    })
    .option("markdown", {
      type: "string",
      demandOption: true,
    })
    .option("id", {
      type: "string",
      demandOption: true,
    })
    .option("url", {
      type: "string",
      demandOption: true,
    })
    .option("score", {
      type: "number",
      demandOption: true,
    })
    .help().argv;

  const LOG_CSV_PATH = path.join(await findRoot(), "log.csv");
  await fs.appendFile(
    LOG_CSV_PATH,
    `${new Date().toISOString()},${argv.id},${argv.score},${argv.url}\n`
  );

  const result: CSVRow = {
    rank: 0,
    score: argv.score,
    competitorId: argv.id,
    url: argv.url,
  };

  const scoreList = parseCSV(await fs.readFile(argv["score-csv"], "utf-8"), {
    columns: true,
    cast: (value, context) => {
      if (context.header) {
        return value;
      }
      if (["rank", "score"].includes(context.column as string)) {
        return Number(value);
      }
      return String(value);
    },
  }) as CSVRow[];

  const scoreMap = new Map(scoreList.map((s) => [s.competitorId, s]));
  scoreMap.set(result.competitorId, result);

  const sortedScoreList = Array.from(scoreMap.values()).sort(
    (a, b) => b.score - a.score
  );

  for (let idx = 0; idx < sortedScoreList.length; idx++) {
    const item = sortedScoreList[idx];
    const prevItem = sortedScoreList[idx - 1];

    if (prevItem && item.score === prevItem.score) {
      item.rank = prevItem.rank;
    } else {
      item.rank = idx + 1;
    }
  }

  console.log(`::set-output name=export::${JSON.stringify(result)}`);

  const leaderBoardMarkdown = [
    "<!-- leaderboard:start -->",
    "",
    "|Rank|Score||CompetitorId|URL|",
    "|:--:|:--:|:--:|:--|:--:|",
    ...sortedScoreList
      .map((item) => {
        const inner = [
          `${item.rank}`,
          `**${Number(item.score).toFixed(2)}**`,
          `<img alt="" width="50" height="50" src="https://github.com/${item.competitorId}.png?size=100"/>`,
          `[@${item.competitorId}](https://github.com/${item.competitorId})`,
          `[:link:](${item.url})`,
        ].join("|");
        return `|${inner}|`;
      }),
    "",
    "<!-- leaderboard:end -->",
  ].join("\n");

  const markdown = await fs.readFile(argv.markdown, "utf-8");
  await fs.writeFile(
    argv.markdown,
    markdown.replace(
      /<!-- leaderboard:start -->.*<!-- leaderboard:end -->/ms,
      leaderBoardMarkdown
    ),
    "utf-8"
  );

  const csv = stringifyCSV(sortedScoreList, {
    columns: ["rank", "score", "competitorId", "url"],
    header: true,
  });
  await fs.writeFile(argv["score-csv"], csv, "utf-8");

  if (process.env.DISCORD_WEBHOOK_URL) {
    logger.info("Notify leaderboard to Discord");
    // discord cannot render markdown table, so use list instead
    const discordMessage = `
**Leaderboard updated!**
${sortedScoreList.map(
  (item) =>
    `${item.rank}. \`${item.competitorId}\` ${Number(item.score).toFixed(2)}`
).join("\n")}
    `.trim();
    await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: discordMessage,
      }),
    });
  } else {
    logger.info("DISCORD_WEBHOOK_URL is not set, skip notifying to Discord");
  }
}

main().catch((e) => {
  logger.error(e);
  process.exit(1);
});
