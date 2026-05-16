import { Telegraf, Markup } from "telegraf";
import fs from "fs-extra";

import {
  BOT_TOKEN,
  ADMIN_ID,
  MAIN_CHANNEL,
  GLOBAL_CHANNEL,
  MAIN_CHANNEL_ID,
  GLOBAL_CHANNEL_ID,
  SUPPORT_LINK
} from "./config.js";

const bot = new Telegraf(BOT_TOKEN);

/* ================= DATABASE ================= */

if (!fs.existsSync("./methods.json")) {

  fs.writeJsonSync("./methods.json", {
    Telegram: {},
    Whatsapp: {},
    Facebook: {},
    Tiktok: {}
  });

}

function loadDB() {
  return fs.readJsonSync("./methods.json");
}

function saveDB(data) {
  fs.writeJsonSync("./methods.json", data, {
    spaces: 2
  });
}

/* ================= TEMP ================= */

const userState = {};
const pendingMethods = {};

/* ================= FLAG ================= */

function getFlagEmoji(countryName) {

  const countryCodes = {
    bangladesh: "BD",
    nepal: "NP",
    pakistan: "PK",
    india: "IN",
    saudiarabia: "SA",
    turkey: "TR",
    russia: "RU",
    srilanka: "LK",
    china: "CN",
    japan: "JP",
    thailand: "TH",
    indonesia: "ID",
    malaysia: "MY",
    singapore: "SG",
    france: "FR",
    germany: "DE",
    uk: "GB",
    usa: "US",
    canada: "CA",
    brazil: "BR",
    italy: "IT",
    iraq: "IQ",
    uae: "AE"
  };

  const key = countryName
    .toLowerCase()
    .replace(/\s+/g, "");

  const code = countryCodes[key];

  if (!code) return "🌍";

  return code
    .toUpperCase()
    .replace(/./g, char =>
      String.fromCodePoint(
        127397 + char.charCodeAt()
      )
    );
}

/* ================= MAIN MENU ================= */

function mainMenu() {

  return Markup.keyboard([
    ["𓆩👑𓆪 Admin Method", "𓆩👤𓆪 User Method"],
    ["𓆩🌍𓆪 Add Country", "𓆩🗑𓆪 Delete"],
    ["𓆩🏠𓆪 Main Menu"]
  ]).resize();

}

/* ================= METHOD BUTTONS ================= */

function methodButtons() {

  return {
    reply_markup: {
      inline_keyboard: [

        [
          {
            text: "𓆩📱𓆪 Telegram Method",
            callback_data: "view_Telegram"
          },
          {
            text: "𓆩💬𓆪 Whatsapp Method",
            callback_data: "view_Whatsapp"
          }
        ],

        [
          {
            text: "𓆩📘𓆪 Facebook Method",
            callback_data: "view_Facebook"
          },
          {
            text: "𓆩🎵𓆪 Tiktok Method",
            callback_data: "view_Tiktok"
          }
        ]

      ]
    }
  };

}

/* ================= FORCE JOIN ================= */

async function checkJoin(userId) {

  try {

    const main = await bot.telegram.getChatMember(
      MAIN_CHANNEL_ID,
      userId
    );

    const global = await bot.telegram.getChatMember(
      GLOBAL_CHANNEL_ID,
      userId
    );

    const ok1 = ["member", "administrator", "creator"]
      .includes(main.status);

    const ok2 = ["member", "administrator", "creator"]
      .includes(global.status);

    return ok1 && ok2;

  } catch {

    return false;

  }

}

/* ================= START ================= */

bot.start(async (ctx) => {

  ctx.reply(
`𓆩💬𓆪 Welcome To Global Method Bot

𓆩📢𓆪 Please Join Required Channels First`,
    {
      reply_markup: {
        inline_keyboard: [

          [
            {
              text: "𓆩📢𓆪 Main Telegram Channel",
              url: MAIN_CHANNEL
            }
          ],

          [
            {
              text: "𓆩🌍𓆪 Global Method Channel",
              url: GLOBAL_CHANNEL
            }
          ],

          [
            {
              text: "𓆩✅𓆪 Joined",
              callback_data: "joined"
            }
          ]

        ]
      }
    }
  );

});

/* ================= JOINED ================= */

bot.action("joined", async (ctx) => {

  const joined = await checkJoin(ctx.from.id);

  if (!joined) {

    return ctx.answerCbQuery(
      "𓆩❌𓆪 Join Channels First",
      { show_alert: true }
    );

  }

  await ctx.editMessageText(
`𓆩✨𓆪 Welcome Smart User\n\n𓆩📘𓆪 Please Select Method`,
    methodButtons()
  );

  await ctx.reply(
`𓆩✨𓆪 Control Panel Open`,
    mainMenu()
  );

});

/* ================= COUNTRY COMMAND ================= */

bot.command("country", async (ctx) => {

  if (ctx.from.id !== ADMIN_ID) {
    return ctx.reply(
      "❌ This Command Is Only For Admin"
    );
  }

  await ctx.reply(
`🌍 Which Method Do You Want To Add Countries To?`,
    Markup.keyboard([

      ["𓆩📱𓆪 Telegram", "𓆩💬𓆪 Whatsapp"],
      ["𓆩📘𓆪 Facebook", "𓆩🎵𓆪 Tiktok"],
      ["𓆩🏠𓆪 Main Menu"]

    ]).resize()
  );

  userState[ctx.from.id] = {
    step: "multi_country_method"
  };

});

/* ================= TEXT ================= */

bot.on("text", async (ctx) => {

  const text = ctx.message.text;

  const state = userState[ctx.from.id];

  if (!state) return;

  const map = {

    "𓆩📱𓆪 Telegram": "Telegram",
    "𓆩💬𓆪 Whatsapp": "Whatsapp",
    "𓆩📘𓆪 Facebook": "Facebook",
    "𓆩🎵𓆪 Tiktok": "Tiktok"

  };

  /* ================= MULTI COUNTRY METHOD ================= */

  if (
    state.step === "multi_country_method" &&
    map[text]
  ) {

    userState[ctx.from.id] = {

      step: "multi_country_add",
      type: map[text]

    };

    return ctx.reply(
`🌍 Send Country Names

Example:
Nepal
Saudi Arabia
Sri Lanka
Turkey
Russia`
    );

  }

  /* ================= MULTI COUNTRY ADD ================= */

  if (state.step === "multi_country_add") {

    const db = loadDB();

    const lines = text
      .split("\n")
      .map(x => x.trim())
      .filter(Boolean);

    let added = [];

    for (const name of lines) {

      const flag = getFlagEmoji(name);

      const finalName = `${flag} ${name}`;

      if (!db[state.type][finalName]) {

        db[state.type][finalName] = [];

        added.push(finalName);

      }

    }

    saveDB(db);

    delete userState[ctx.from.id];

    return ctx.reply(
`✅ Countries Added Successfully

${added.join("\n")}`,
      mainMenu()
    );

  }

});

/* ================= BOT START ================= */

bot.launch();

console.log("🤖 Bot Running...");
