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
  fs.writeJsonSync("./methods.json", data, { spaces: 2 });
}

/* ================= TEMP ================= */

const userState = {};
const pendingMethods = {};

/* ================= MAIN MENU ================= */

function mainMenu() {

  return Markup.keyboard([
    ["👑 Admin Method", "👤 User Method"],
    ["🌍 Add Country", "🗑 Delete"],
    ["🏠 Main Menu"]
  ]).resize();

}

/* ================= METHOD BUTTONS ================= */

function methodButtons() {

  return {
    reply_markup: {
      inline_keyboard: [

        [
          {
            text: "💎 Telegram Method",
            callback_data: "view_Telegram"
          },
          {
            text: "🔥 Whatsapp Method",
            callback_data: "view_Whatsapp"
          }
        ],

        [
          {
            text: "📘 Facebook Method",
            callback_data: "view_Facebook"
          },
          {
            text: "🎵 Tiktok Method",
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

    const ok1 = ["member","administrator","creator"]
      .includes(main.status);

    const ok2 = ["member","administrator","creator"]
      .includes(global.status);

    return ok1 && ok2;

  } catch {

    return false;

  }

}

/* ================= START ================= */

bot.start(async (ctx) => {

  ctx.reply(
`✨ Welcome To Global Method Bot

📢 Please Join Required Channels First`,
    {
      reply_markup: {
        inline_keyboard: [

          [
            {
              text: "🌍 Main Channel",
              url: MAIN_CHANNEL
            }
          ],

          [
            {
              text: "🔥 Global Channel",
              url: GLOBAL_CHANNEL
            }
          ],

          [
            {
              text: "✅ Joined",
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
      "❌ Join Global Channel First",
      { show_alert: true }
    );

  }

  await ctx.editMessageText(
`✨ Welcome

🔥 Select Any Method Below`,
    methodButtons()
  );

  await ctx.reply(
`✨ Control Panel`,
    mainMenu()
  );

});

/* ================= MAIN MENU ================= */

bot.hears("🏠 Main Menu", async (ctx) => {

  delete userState[ctx.from.id];

  await ctx.reply(
`✨ Welcome Back

🔥 Select Any Method Below`,
    methodButtons()
  );

  await ctx.reply(
`✨ Control Panel`,
    mainMenu()
  );

});

/* ================= INLINE MAIN MENU ================= */

bot.action("main_menu", async (ctx) => {

  await ctx.editMessageText(
`✨ Welcome Back

🔥 Select Any Method Below`,
    methodButtons()
  );

});

/* ================= VIEW METHOD ================= */

["Telegram","Whatsapp","Facebook","Tiktok"].forEach(type => {

  bot.action(`view_${type}`, async (ctx) => {

    const db = loadDB();

    const countries = Object.keys(db[type]);

    if (countries.length === 0) {

      return ctx.answerCbQuery(
        "❌ No Country Added",
        { show_alert: true }
      );

    }

    const buttons = countries.map(c => [

      {
        text: `🌍 ${c}`,
        callback_data: `country_${type}_${c}`
      }

    ]);

    buttons.push([
      {
        text: "⬅️ Back Menu",
        callback_data: "main_menu"
      }
    ]);

    buttons.push([
      {
        text: "🏠 Main Menu",
        callback_data: "main_menu"
      }
    ]);

    await ctx.editMessageText(
`🌍 Select Country`,
      {
        reply_markup: {
          inline_keyboard: buttons
        }
      }
    );

  });

});

/* ================= COUNTRY ================= */

bot.action(/^country_(.+)_(.+)$/, async (ctx) => {

  const type = ctx.match[1];
  const country = ctx.match[2];

  const db = loadDB();

  const methods = db[type][country] || [];

  await ctx.editMessageText(
`✨ ${type} Method

🌍 Country:
${country}

📦 Total Method:
${methods.length}`,
    {
      reply_markup: {
        inline_keyboard: [

          [
            {
              text: "📂 Show Method",
              callback_data: `show1_${type}_${country}`
            }
          ],

          [
            {
              text: "⚡ Show 5 Method",
              callback_data: `show5_${type}_${country}`
            }
          ],

          [
            {
              text: "⬅️ Back Menu",
              callback_data: `view_${type}`
            }
          ],

          [
            {
              text: "🏠 Main Menu",
              callback_data: "main_menu"
            }
          ]

        ]
      }
    }
  );

});

/* ================= SHOW 1 ================= */

bot.action(/^show1_(.+)_(.+)$/, async (ctx) => {

  const type = ctx.match[1];
  const country = ctx.match[2];

  const db = loadDB();

  const methods = db[type][country] || [];

  if (methods.length === 0) {

    return ctx.answerCbQuery(
      "❌ No Method Available",
      { show_alert: true }
    );

  }

  const random =
    methods[Math.floor(Math.random() * methods.length)];

  await ctx.editMessageText(
`${random}`,
    {
      reply_markup: {
        inline_keyboard: [

          [
            {
              text: "🔄 Change",
              callback_data: `show1_${type}_${country}`
            }
          ],

          [
            {
              text: "⬅️ Back Menu",
              callback_data: `country_${type}_${country}`
            }
          ],

          [
            {
              text: "🏠 Main Menu",
              callback_data: "main_menu"
            }
          ]

        ]
      }
    }
  );

});

/* ================= SHOW 5 ================= */

bot.action(/^show5_(.+)_(.+)$/, async (ctx) => {

  const type = ctx.match[1];
  const country = ctx.match[2];

  const db = loadDB();

  const methods = db[type][country] || [];

  if (methods.length === 0) {

    return ctx.answerCbQuery(
      "❌ No Method Available",
      { show_alert: true }
    );

  }

  const random = methods
    .sort(() => 0.5 - Math.random())
    .slice(0, 5);

  await ctx.editMessageText(
random.map((m,i)=>
`${i + 1}. ${m}`
).join("\n\n"),

    {
      reply_markup: {
        inline_keyboard: [

          [
            {
              text: "🔄 Change",
              callback_data: `show5_${type}_${country}`
            }
          ],

          [
            {
              text: "⬅️ Back Menu",
              callback_data: `country_${type}_${country}`
            }
          ],

          [
            {
              text: "🏠 Main Menu",
              callback_data: "main_menu"
            }
          ]

        ]
      }
    }
  );

});

/* ================= ADMIN METHOD ================= */

bot.hears("👑 Admin Method", async (ctx) => {

  if (ctx.from.id !== ADMIN_ID) {

    return ctx.reply(
`❌ This Button Is Only For Admin`
    );

  }

  ctx.reply(
`👑 Select Method`,
    Markup.keyboard([

      ["💎 Telegram", "🔥 Whatsapp"],
      ["📘 Facebook", "🎵 Tiktok"],
      ["⬅️ Back Menu"],
      ["🏠 Main Menu"]

    ]).resize()
  );

  userState[ctx.from.id] = {
    step: "admin_method"
  };

});

/* ================= USER METHOD ================= */

bot.hears("👤 User Method", async (ctx) => {

  ctx.reply(
`👤 Select Method`,
    Markup.keyboard([

      ["💎 Telegram", "🔥 Whatsapp"],
      ["📘 Facebook", "🎵 Tiktok"],
      ["⬅️ Back Menu"],
      ["🏠 Main Menu"]

    ]).resize()
  );

  userState[ctx.from.id] = {
    step: "user_method"
  };

});

/* ================= ADD COUNTRY ================= */

bot.hears("🌍 Add Country", async (ctx) => {

  if (ctx.from.id !== ADMIN_ID) {

    return ctx.reply(
`❌ This Button Is Only For Admin`
    );

  }
  ctx.reply(
`🌍 Select Method`,
    Markup.keyboard([

      ["💎 Telegram", "🔥 Whatsapp"],
      ["📘 Facebook", "🎵 Tiktok"],
      ["⬅️ Back Menu"],
      ["🏠 Main Menu"]

    ]).resize()
  );

  userState[ctx.from.id] = {
    step: "country_add"
  };

});

/* ================= DELETE ================= */

bot.hears("🗑 Delete", async (ctx) => {

  if (ctx.from.id !== ADMIN_ID) {

    return ctx.reply(
`❌ This Button Is Only For Admin`
    );

  }

  ctx.reply(
`🗑 Select Method`,
    Markup.keyboard([

      ["💎 Telegram", "🔥 Whatsapp"],
      ["📘 Facebook", "🎵 Tiktok"],
      ["⬅️ Back Menu"],
      ["🏠 Main Menu"]

    ]).resize()
  );

  userState[ctx.from.id] = {
    step: "delete_method_select"
  };

});

/* ================= BACK MENU ================= */

bot.hears("⬅️ Back Menu", async (ctx) => {

  delete userState[ctx.from.id];

  ctx.reply(
`✨ Welcome Back`,
    mainMenu()
  );

});

/* ================= TEXT ================= */

bot.on("text", async (ctx) => {

  const text = ctx.message.text;

  const state = userState[ctx.from.id];

  if (!state) return;

  const map = {

    "💎 Telegram": "Telegram",
    "🔥 Whatsapp": "Whatsapp",
    "📘 Facebook": "Facebook",
    "🎵 Tiktok": "Tiktok"

  };

  /* ================= DELETE SELECT ================= */

  if (
    state.step === "delete_method_select" &&
    map[text]
  ) {

    const type = map[text];

    const db = loadDB();

    const countries = Object.keys(db[type]);

    if (countries.length === 0) {

      return ctx.reply("❌ No Country Added");

    }

    const buttons = countries.map(c => [

      {
        text: `🌍 ${c}`,
        callback_data: `deletecountry_${type}_${c}`
      }

    ]);

    buttons.push([
      {
        text: "🏠 Main Menu",
        callback_data: "main_menu"
      }
    ]);

    return ctx.reply(
`🌍 Select Country`,
      {
        reply_markup: {
          inline_keyboard: buttons
        }
      }
    );

  }

  /* ================= COUNTRY ADD ================= */

  if (
    state.step === "country_add" &&
    map[text]
  ) {

    userState[ctx.from.id] = {

      step: "country_name",
      type: map[text]

    };

    return ctx.reply(
`🌍 Send New Country Name`
    );

  }

  if (state.step === "country_name") {

    const db = loadDB();

    if (!db[state.type][text]) {

      db[state.type][text] = [];

    }

    saveDB(db);

    delete userState[ctx.from.id];

    return ctx.reply(
`✅ Country Added Successfully

🌍 Country:
${text}

📂 Method:
${state.type}`,
      mainMenu()
    );

  }

  /* ================= ADMIN ================= */

  if (
    state.step === "admin_method" &&
    map[text]
  ) {

    const db = loadDB();

    const countries =
      Object.keys(db[map[text]]);

    if (countries.length === 0) {

      return ctx.reply(
        "❌ No Country Added"
      );

    }

    const buttons = countries.map(c => [

      {
        text: `🌍 ${c}`,
        callback_data: `admincountry_${map[text]}_${c}`
      }

    ]);

    buttons.push([
      {
        text: "⬅️ Back Menu",
        callback_data: "main_menu"
      }
    ]);

    buttons.push([
      {
        text: "🏠 Main Menu",
        callback_data: "main_menu"
      }
    ]);

    return ctx.reply(
`🌍 Select Country`,
      {
        reply_markup: {
          inline_keyboard: buttons
        }
      }
    );

  }

  /* ================= USER ================= */

  if (
    state.step === "user_method" &&
    map[text]
  ) {

    const db = loadDB();

    const countries =
      Object.keys(db[map[text]]);

    if (countries.length === 0) {

      return ctx.reply(
        "❌ No Country Added"
      );

    }

    const buttons = countries.map(c => [

      {
        text: `🌍 ${c}`,
        callback_data: `usercountry_${map[text]}_${c}`
      }

    ]);

    buttons.push([
      {
        text: "⬅️ Back Menu",
        callback_data: "main_menu"
      }
    ]);

    buttons.push([
      {
        text: "🏠 Main Menu",
        callback_data: "main_menu"
      }
    ]);

    return ctx.reply(
`🌍 Select Country`,
      {
        reply_markup: {
          inline_keyboard: buttons
        }
      }
    );

  }

  /* ================= ADMIN SEND ================= */

  if (state.step === "admin_send") {

    const db = loadDB();

    db[state.type][state.country]
      .push(text);

    saveDB(db);

    delete userState[ctx.from.id];

    return ctx.reply(
`✅ Method Added Successfully

📂 ${state.type}
🌍 ${state.country}`,
      mainMenu()
    );

  }

  /* ================= USER SEND ================= */

  if (state.step === "user_send") {

    const id = Date.now();

    pendingMethods[id] = {

      userId: ctx.from.id,
      method: text,
      type: state.type,
      country: state.country

    };

    delete userState[ctx.from.id];

    await bot.telegram.sendMessage(
      ADMIN_ID,

`👤 New Method Request

📂 ${state.type}
🌍 ${state.country}

📝 Method:

${text}`,

      {
        reply_markup: {
          inline_keyboard: [

            [
              {
                text: "✅ Approve",
                callback_data: `approve_${id}`
              },

              {
                text: "❌ Reject",
                callback_data: `reject_${id}`
              }
            ]

          ]
        }
      }
    );

    return ctx.reply(
`✅ Method Sent To Admin

⏳ Wait For Approval`,
      mainMenu()
    );

  }

});

/* ================= ADMIN COUNTRY ================= */

bot.action(/^admincountry_(.+)_(.+)$/, async (ctx) => {

  const type = ctx.match[1];
  const country = ctx.match[2];

  userState[ctx.from.id] = {

    step: "admin_send",
    type,
    country

  };

  await ctx.editMessageText(
`📝 Send Your Method

📂 ${type}
🌍 ${country}`,
    {
      reply_markup: {
        inline_keyboard: [

          [
            {
              text: "⬅️ Back Menu",
              callback_data: `view_${type}`
            }
          ],

          [
            {
              text: "🏠 Main Menu",
              callback_data: "main_menu"
            }
          ]

        ]
      }
    }
  );

});

/* ================= USER COUNTRY ================= */

bot.action(/^usercountry_(.+)_(.+)$/, async (ctx) => {

  const type = ctx.match[1];
  const country = ctx.match[2];

  userState[ctx.from.id] = {

    step: "user_send",
    type,
    country

  };

  await ctx.editMessageText(
`📝 Send Your Method

📂 ${type}
🌍 ${country}`,
    {
      reply_markup: {
        inline_keyboard: [

          [
            {
              text: "⬅️ Back Menu",
              callback_data: `view_${type}`
            }
          ],

          [
            {
              text: "🏠 Main Menu",
              callback_data: "main_menu"
            }
          ]

        ]
      }
    }
  );

});

/* ================= DELETE COUNTRY ================= */

bot.action(/^deletecountry_(.+)_(.+)$/, async (ctx) => {

  const type = ctx.match[1];
  const country = ctx.match[2];

  await ctx.editMessageText(
`🗑 Delete Option

📂 ${type}
🌍 ${country}`,
    {
      reply_markup: {
        inline_keyboard: [

          [
            {
              text: "🗑 Delete Country",
              callback_data: `delcountry_${type}_${country}`
            }
          ],

          [
            {
              text: "🗑 Delete Method",
              callback_data: `delmethod_${type}_${country}`
            }
          ],

          [
            {
              text: "🏠 Main Menu",
              callback_data: "main_menu"
            }
          ]

        ]
      }
    }
  );

});

/* ================= DELETE COUNTRY FINAL ================= */

bot.action(/^delcountry_(.+)_(.+)$/, async (ctx) => {

  const type = ctx.match[1];
  const country = ctx.match[2];

  const db = loadDB();

  delete db[type][country];

  saveDB(db);

  await ctx.editMessageText(
`✅ Country Deleted

📂 ${type}
🌍 ${country}`
  );

});

/* ================= DELETE METHOD ================= */

bot.action(/^delmethod_(.+)_(.+)$/, async (ctx) => {

  const type = ctx.match[1];
  const country = ctx.match[2];

  const db = loadDB();

  const methods = db[type][country] || [];

  if (methods.length === 0) {

    return ctx.answerCbQuery(
      "❌ No Method Available",
      { show_alert: true }
    );

  }

  const buttons = methods.map((m, i) => [

    {
      text: `${i + 1}`,
      callback_data: `finaldel_${type}_${country}_${i}`
    }

  ]);

  buttons.push([
    {
      text: "🏠 Main Menu",
      callback_data: "main_menu"
    }
  ]);

  await ctx.editMessageText(
`🗑 Select Method Number To Delete`,
    {
      reply_markup: {
        inline_keyboard: buttons
      }
    }
  );

});

/* ================= FINAL DELETE ================= */

bot.action(/^finaldel_(.+)_(.+)_(.+)$/, async (ctx) => {

  const type = ctx.match[1];
  const country = ctx.match[2];
  const index = Number(ctx.match[3]);

  const db = loadDB();

  db[type][country].splice(index, 1);

  saveDB(db);

  await ctx.editMessageText(
`✅ Method Deleted Successfully`
  );

});

/* ================= APPROVE ================= */

bot.action(/^approve_(.+)$/, async (ctx) => {

  if (ctx.from.id !== ADMIN_ID) return;

  const id = ctx.match[1];

  const data = pendingMethods[id];

  if (!data) return;

  const db = loadDB();

  db[data.type][data.country]
    .push(data.method);

  saveDB(db);

  await bot.telegram.sendMessage(
    data.userId,

`✅ Your Method Approved

📂 ${data.type}
🌍 ${data.country}

🎉 Thanks For Sharing`,
    mainMenu()
  );

  delete pendingMethods[id];

  await ctx.editMessageText(
`✅ Approved Successfully`
  );

});

/* ================= REJECT ================= */

bot.action(/^reject_(.+)$/, async (ctx) => {

  if (ctx.from.id !== ADMIN_ID) return;

  const id = ctx.match[1];

  const data = pendingMethods[id];

  if (!data) return;

  await bot.telegram.sendMessage(
    data.userId,

`❌ Your Method Rejected

📂 ${data.type}
🌍 ${data.country}`,

    {
      reply_markup: {
        inline_keyboard: [

          [
            {
              text: "🆘 Support",
              url: SUPPORT_LINK
            }
          ]

        ]
      }
    }
  );

  delete pendingMethods[id];

  await ctx.editMessageText(
`❌ Rejected`
  );

});

/* ================= START BOT ================= */

bot.launch();

console.log("🤖 Bot Running...");
