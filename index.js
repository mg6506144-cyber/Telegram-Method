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
      "𓆩❌𓆪 Join Global Channel First",
      { show_alert: true }
    );

  }

  await ctx.editMessageText(
`𓆩✨𓆪 Welcome Smart User

𓆩📘𓆪 Please Select Your Method Below`,
    methodButtons()
  );

  await ctx.reply(
`𓆩✨𓆪 Control Panel Open`,
    mainMenu()
  );

});

/* ================= MAIN MENU ================= */

bot.hears("𓆩🏠𓆪 Main Menu", async (ctx) => {

  delete userState[ctx.from.id];

  await ctx.reply(
`𓆩✨𓆪 Welcome Back

𓆩📘𓆪 Which Method Need Your 𓆩❓𓆪 Select Method Below`,
    methodButtons()
  );

  await ctx.reply(
`𓆩✨𓆪 Control Panel`,
    mainMenu()
  );

});

/* ================= INLINE MAIN MENU ================= */

bot.action("main_menu", async (ctx) => {

  await ctx.editMessageText(
`𓆩✨𓆪 Welcome Back Smart User

𓆩📘𓆪 Please Select Any Method Below`,
    methodButtons()
  );

});

/* ================= VIEW METHOD ================= */

["Telegram", "Whatsapp", "Facebook", "Tiktok"].forEach(type => {

  bot.action(`view_${type}`, async (ctx) => {

    const db = loadDB();

    const countries = Object.keys(db[type]);

    if (countries.length === 0) {

      return ctx.answerCbQuery(
        "𓆩❌𓆪 No Country Available Please Contact Admin",
        { show_alert: true }
      );

    }

    const buttons = countries.map(c => [

      {
        text: `𓆩🌍𓆪 ${c}`,
        callback_data: `country_${type}_${c}`
      }

    ]);

    buttons.push([
      {
        text: "𓆩⬅️𓆪 Back Menu",
        callback_data: "main_menu"
      }
    ]);

    buttons.push([
      {
        text: "𓆩🏠𓆪 Main Menu",
        callback_data: "main_menu"
      }
    ]);

    await ctx.editMessageText(
`𓆩🌍𓆪 Please Select Country`,
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
`𓆩✨𓆪 ${type} Method

𓆩🌍𓆪 Country:
${country}

𓆩📦𓆪 Total Method:
${methods.length}`,
    {
      reply_markup: {
        inline_keyboard: [

          [
            {
              text: "𓆩📂𓆪 Show Method",
              callback_data: `show1_${type}_${country}`
            }
          ],

          [
            {
              text: "𓆩⚡𓆪 Show 5 Method",
              callback_data: `show5_${type}_${country}`
            }
          ],

          [
            {
              text: "𓆩⬅️𓆪 Back Menu",
              callback_data: `view_${type}`
            }
          ],

          [
            {
              text: "𓆩🏠𓆪 Main Menu",
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
      "𓆩❌𓆪 No Method Available",
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
              text: "𓆩🔄𓆪 Change",
              callback_data: `show1_${type}_${country}`
            }
          ],

          [
            {
              text: "𓆩⬅️𓆪 Back Menu",
              callback_data: `country_${type}_${country}`
            }
          ],

          [
            {
              text: "𓆩🏠𓆪 Main Menu",
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
      "𓆩❌𓆪 No Method Available",
      { show_alert: true }
    );

  }

  const random = methods
    .sort(() => 0.5 - Math.random())
    .slice(0, 5);

  await ctx.editMessageText(
random.map((m, i) =>
`${i + 1}. ${m}`
).join("\n\n"),

    {
      reply_markup: {
        inline_keyboard: [

          [
            {
              text: "𓆩🔄𓆪 Change",
              callback_data: `show5_${type}_${country}`
            }
          ],

          [
            {
              text: "𓆩⬅️𓆪 Back Menu",
              callback_data: `country_${type}_${country}`
            }
          ],

          [
            {
              text: "𓆩🏠𓆪 Main Menu",
              callback_data: "main_menu"
            }
          ]

        ]
      }
    }
  );

});

/* ================= ADMIN METHOD ================= */

bot.hears("𓆩👑𓆪 Admin Method", async (ctx) => {

  if (ctx.from.id !== ADMIN_ID) {

    await bot.telegram.sendMessage(
      ADMIN_ID,
`🚨 User Clicked Admin Button

👤 Name: ${ctx.from.first_name}
🆔 ID: ${ctx.from.id}
📛 Username: @${ctx.from.username || "NoUsername"}`
    );

    return ctx.reply(
`𓆩❌𓆪 This Button Is Only For Admin`
    );

  }

  ctx.reply(
`𓆩👑𓆪 Select Method`,
    Markup.keyboard([

      ["𓆩📱𓆪 Telegram", "𓆩💬𓆪 Whatsapp"],
      ["𓆩📘𓆪 Facebook", "𓆩🎵𓆪 Tiktok"],
      ["𓆩⬅️𓆪 Back Menu"],
      ["𓆩🏠𓆪 Main Menu"]

    ]).resize()
  );

  userState[ctx.from.id] = {
    step: "admin_method"
  };

});

/* ================= USER METHOD ================= */

bot.hears("𓆩👤𓆪 User Method", async (ctx) => {

  ctx.reply(
`𓆩👤𓆪 Please Select Which Method You Want To Add`,
    Markup.keyboard([

      ["𓆩📱𓆪 Telegram", "𓆩💬𓆪 Whatsapp"],
      ["𓆩📘𓆪 Facebook", "𓆩🎵𓆪 Tiktok"],
      ["𓆩⬅️𓆪 Back Menu"],
      ["𓆩🏠𓆪 Main Menu"]

    ]).resize()
  );

  userState[ctx.from.id] = {
    step: "user_method"
  };

});

/* ================= ADD COUNTRY ================= */

bot.hears("𓆩🌍𓆪 Add Country", async (ctx) => {

  if (ctx.from.id !== ADMIN_ID) {

    return ctx.reply(
`𓆩❌𓆪 This Button Is Only For Admin`
    );

  }

  ctx.reply(
`𓆩🌍𓆪 Select Method`,
    Markup.keyboard([

      ["𓆩📱𓆪 Telegram", "𓆩💬𓆪 Whatsapp"],
      ["𓆩📘𓆪 Facebook", "𓆩🎵𓆪 Tiktok"],
      ["𓆩⬅️𓆪 Back Menu"],
      ["𓆩🏠𓆪 Main Menu"]

    ]).resize()
  );

  userState[ctx.from.id] = {
    step: "country_add"
  };

});

/* ================= DELETE ================= */

bot.hears("𓆩🗑𓆪 Delete", async (ctx) => {

  if (ctx.from.id !== ADMIN_ID) {

    return ctx.reply(
`𓆩❌𓆪 This Button Is Only For Admin`
    );

  }

  ctx.reply(
`𓆩🗑𓆪 Select Method`,
    Markup.keyboard([

      ["𓆩📱𓆪 Telegram", "𓆩💬𓆪 Whatsapp"],
      ["𓆩📘𓆪 Facebook", "𓆩🎵𓆪 Tiktok"],
      ["𓆩⬅️𓆪 Back Menu"],
      ["𓆩🏠𓆪 Main Menu"]

    ]).resize()
  );

  userState[ctx.from.id] = {
    step: "delete_method_select"
  };

});

/* ================= BACK MENU ================= */

bot.hears("𓆩⬅️𓆪 Back Menu", async (ctx) => {

  delete userState[ctx.from.id];

  ctx.reply(
`𓆩✨𓆪 Welcome Back`,
    mainMenu()
  );

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

  /* ================= DELETE SELECT ================= */

  if (
    state.step === "delete_method_select" &&
    map[text]
  ) {

    const type = map[text];

    const db = loadDB();

    const countries = Object.keys(db[type]);

    if (countries.length === 0) {

      return ctx.reply("𓆩❌𓆪 No Country Added");

    }

    const buttons = countries.map(c => [

      {
        text: `𓆩🌍𓆪 ${c}`,
        callback_data: `deletecountry_${type}_${c}`
      }

    ]);

    buttons.push([
      {
        text: "𓆩🏠𓆪 Main Menu",
        callback_data: "main_menu"
      }
    ]);

    return ctx.reply(
`𓆩🌍𓆪 Select Country`,
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
`𓆩🌍𓆪 Send New Country Name`
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
`𓆩✅𓆪 Country Added Successfully

𓆩🌍𓆪 Country:
${text}

𓆩📂𓆪 Method:
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
        "𓆩❌𓆪 No Country Added"
      );

    }

    const buttons = countries.map(c => [

      {
        text: `𓆩🌍𓆪 ${c}`,
        callback_data: `admincountry_${map[text]}_${c}`
      }

    ]);

    buttons.push([
      {
        text: "𓆩⬅️𓆪 Back Menu",
        callback_data: "main_menu"
      }
    ]);

    buttons.push([
      {
        text: "𓆩🏠𓆪 Main Menu",
        callback_data: "main_menu"
      }
    ]);

    return ctx.reply(
`𓆩🌍𓆪 Select Country`,
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
        "𓆩❌𓆪 No Country Added"
      );

    }

    const buttons = countries.map(c => [

      {
        text: `𓆩🌍𓆪 ${c}`,
        callback_data: `usercountry_${map[text]}_${c}`
      }

    ]);

    buttons.push([
      {
        text: "𓆩⬅️𓆪 Back Menu",
        callback_data: "main_menu"
      }
    ]);

    buttons.push([
      {
        text: "𓆩🏠𓆪 Main Menu",
        callback_data: "main_menu"
      }
    ]);

    return ctx.reply(
`𓆩🌍𓆪 Select Country`,
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
`𓆩✅𓆪 Method Added Successfully

𓆩📂𓆪 ${state.type}
𓆩🌍𓆪 ${state.country}`,
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

`𓆩👤𓆪 New Method Request

𓆩📂𓆪 ${state.type}
𓆩🌍𓆪 ${state.country}

𓆩📝𓆪 Method:

${text}`,

      {
        reply_markup: {
          inline_keyboard: [

            [
              {
                text: "𓆩✅𓆪 Approve",
                callback_data: `approve_${id}`
              },

              {
                text: "𓆩❌𓆪 Reject",
                callback_data: `reject_${id}`
              }
            ]

          ]
        }
      }
    );

    return ctx.reply(
`𓆩✅𓆪 Method Sent To Admin

𓆩⏳𓆪 Wait For Approval`,
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
`𓆩📝𓆪 Please Share Your Working Method Here

𓆩🌍𓆪 All Users Will Be Able To See This Method After Approval  𓆩✅𓆪

𓆩📂𓆪 ${type}
𓆩🌍𓆪 ${country}`,
    {
      reply_markup: {
        inline_keyboard: [

          [
            {
              text: "𓆩⬅️𓆪 Back Menu",
              callback_data: `view_${type}`
            }
          ],

          [
            {
              text: "𓆩🏠𓆪 Main Menu",
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
`𓆩📝𓆪 Please Share Your Working Method Here

𓆩🌍𓆪 All Users Will Be Able To See This Method After Approval  𓆩✅𓆪

𓆩📂𓆪 ${type}
𓆩🌍𓆪 ${country}`,
    {
      reply_markup: {
        inline_keyboard: [

          [
            {
              text: "𓆩⬅️𓆪 Back Menu",
              callback_data: `view_${type}`
            }
          ],

          [
            {
              text: "𓆩🏠𓆪 Main Menu",
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
`𓆩🗑𓆪 Delete Option

𓆩📂𓆪 ${type}
𓆩🌍𓆪 ${country}`,
    {
      reply_markup: {
        inline_keyboard: [

          [
            {
              text: "𓆩🗑𓆪 Delete Country",
              callback_data: `delcountry_${type}_${country}`
            }
          ],

          [
            {
              text: "𓆩🗑𓆪 Delete Method",
              callback_data: `delmethod_${type}_${country}`
            }
          ],

          [
            {
              text: "𓆩🏠𓆪 Main Menu",
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
`𓆩✅𓆪 Country Deleted

𓆩📂𓆪 ${type}
𓆩🌍𓆪 ${country}`
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
      "𓆩❌𓆪 No Method Available",
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
      text: "𓆩🏠𓆪 Main Menu",
      callback_data: "main_menu"
    }
  ]);

  await ctx.editMessageText(
`𓆩🗑𓆪 Select Method Number To Delete`,
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
`𓆩✅𓆪 Method Deleted Successfully`
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

`𓆩✅𓆪 Your Method Approved

𓆩📂𓆪 ${data.type}
𓆩🌍𓆪 ${data.country}

𓆩🎉𓆪 Thanks For Sharing Working Method`,
    mainMenu()
  );

  delete pendingMethods[id];

  await ctx.editMessageText(
`𓆩✅𓆪 Approved Successfully`
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

`𓆩❌𓆪 Your Method Rejected

𓆩📂𓆪 ${data.type}
𓆩🌍𓆪 ${data.country}`,

    {
      reply_markup: {
        inline_keyboard: [

          [
            {
              text: "𓆩🆘𓆪 Support",
              url: SUPPORT_LINK
            }
          ]

        ]
      }
    }
  );

  delete pendingMethods[id];

  await ctx.editMessageText(
`𓆩❌𓆪 Rejected`
  );

});

/* ================= START BOT ================= */

bot.launch();

console.log("🤖 Bot Running...");
