// index.js

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
["🌍 Add Country"],
["🏠 Main Menu"]
]).resize();

}

/* ================= METHOD BUTTON ================= */

function methodButtons() {

return Markup.inlineKeyboard([

[  
  Markup.button.callback(  
    "💎 Telegram Method",  
    "view_Telegram"  
  ),  

  Markup.button.callback(  
    "🔥 Whatsapp Method",  
    "view_Whatsapp"  
  )  
],  

[  
  Markup.button.callback(  
    "📘 Facebook Method",  
    "view_Facebook"  
  ),  

  Markup.button.callback(  
    "🎵 Tiktok Method",  
    "view_Tiktok"  
  )  
]

]);

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
Markup.inlineKeyboard([

[  
    Markup.button.url(  
      "🌍 Main Channel",  
      MAIN_CHANNEL  
    )  
  ],  

  [  
    Markup.button.url(  
      "🔥 Global Channel",  
      GLOBAL_CHANNEL  
    )  
  ],  

  [  
    Markup.button.callback(  
      "✅ Joined",  
      "joined"  
    )  
  ]  

])

);

});

/* ================= JOINED ================= */

bot.action("joined", async (ctx) => {

const joined = await checkJoin(ctx.from.id);

if (!joined) {

return ctx.answerCbQuery(  
  "❌ Join All Channels First",  
  { show_alert: true }  
);

}

await ctx.deleteMessage();

await ctx.reply(
`✨ Welcome

🔥 Select Any Method Below`,
methodButtons()
);

await ctx.reply(
✨ Control Panel,
mainMenu()
);

});

/* ================= MAIN MENU ================= */

bot.hears("🏠 Main Menu", async (ctx) => {

await ctx.reply(
`✨ Welcome Back

🔥 Select Any Method Below`,
methodButtons()
);

await ctx.reply(
✨ Control Panel,
mainMenu()
);

});

/* ================= VIEW METHOD ================= */

["Telegram","Whatsapp","Facebook","Tiktok"].forEach(type => {

bot.action(view_${type}, async (ctx) => {

const db = loadDB();  

const countries = Object.keys(db[type]);  

if (countries.length === 0) {  

  return ctx.reply(  
    "❌ No Country Added"  
  );  

}  

const buttons = countries.map(c => [  

  Markup.button.callback(  
    `🌍 ${c}`,  
    `country_${type}_${c}`  
  )  

]);  

buttons.push([  
  Markup.button.callback(  
    "🏠 Main Menu",  
    "main_menu"  
  )  
]);  

ctx.reply(

🌍 Select Country,
Markup.inlineKeyboard(buttons)
);

});

});

/* ================= COUNTRY ================= */

bot.action(/country_(.+)_(.+)/, async (ctx) => {

const type = ctx.match[1];
const country = ctx.match[2];

const db = loadDB();

const methods = db[type][country] || [];

ctx.reply(
`✨ ${type} Method

🌍 Country:
${country}

📦 Total Method:
${methods.length}`,
Markup.inlineKeyboard([

[  
    Markup.button.callback(  
      "📂 Show Method",  
      `show1_${type}_${country}`  
    )  
  ],  

  [  
    Markup.button.callback(  
      "⚡ Show 5 Method",  
      `show5_${type}_${country}`  
    )  
  ],  

  [  
    Markup.button.callback(  
      "🏠 Main Menu",  
      "main_menu"  
    )  
  ]  

])

);

});

/* ================= SHOW 1 ================= */

bot.action(/show1_(.+)_(.+)/, async (ctx) => {

const type = ctx.match[1];
const country = ctx.match[2];

const db = loadDB();

const methods = db[type][country] || [];

if (methods.length === 0) {

return ctx.reply(  
  "❌ No Method Available"  
);

}

const random =
methods[Math.floor(Math.random() * methods.length)];

ctx.reply(
${random},
Markup.inlineKeyboard([

[  
    Markup.button.callback(  
      "🔄 Change",  
      `show1_${type}_${country}`  
    )  
  ],  

  [  
    Markup.button.callback(  
      "🏠 Main Menu",  
      "main_menu"  
    )  
  ]  

])

);

});

/* ================= SHOW 5 ================= */

bot.action(/show5_(.+)_(.+)/, async (ctx) => {

const type = ctx.match[1];
const country = ctx.match[2];

const db = loadDB();

const methods = db[type][country] || [];

if (methods.length === 0) {

return ctx.reply(  
  "❌ No Method Available"  
);

}

const random = methods
.sort(() => 0.5 - Math.random())
.slice(0, 5);

ctx.reply(
random.map((m,i)=>
${i+1}. ${m}).join("\n\n"),

Markup.inlineKeyboard([  

  [  
    Markup.button.callback(  
      "🔄 Change",  
      `show5_${type}_${country}`  
    )  
  ],  

  [  
    Markup.button.callback(  
      "🏠 Main Menu",  
      "main_menu"  
    )  
  ]  

])

);

});

/* ================= INLINE MAIN MENU ================= */

bot.action("main_menu", async (ctx) => {

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

/* ================= ADMIN METHOD ================= */

bot.hears("👑 Admin Method", async (ctx) => {

if (ctx.from.id !== ADMIN_ID) {
return;
}

ctx.reply(
👑 Select Method,
Markup.keyboard([

["💎 Telegram", "🔥 Whatsapp"],  
  ["📘 Facebook", "🎵 Tiktok"],  
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
👤 Select Method,
Markup.keyboard([

["💎 Telegram", "🔥 Whatsapp"],  
  ["📘 Facebook", "🎵 Tiktok"],  
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
return;
}

ctx.reply(
🌍 Select Method,
Markup.keyboard([

["💎 Telegram", "🔥 Whatsapp"],  
  ["📘 Facebook", "🎵 Tiktok"],  
  ["🏠 Main Menu"]  

]).resize()

);

userState[ctx.from.id] = {
step: "country_add"
};

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

🌍 Send New Country Name
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

  Markup.button.callback(  
    `🌍 ${c}`,  
    `admincountry_${map[text]}_${c}`  
  )  

]);  

buttons.push([  
  Markup.button.callback(  
    "🏠 Main Menu",  
    "main_menu"  
  )  
]);  

return ctx.reply(

🌍 Select Country,
Markup.inlineKeyboard(buttons)
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

  Markup.button.callback(  
    `🌍 ${c}`,  
    `usercountry_${map[text]}_${c}`  
  )  

]);  

buttons.push([  
  Markup.button.callback(  
    "🏠 Main Menu",  
    "main_menu"  
  )  
]);  

return ctx.reply(

🌍 Select Country,
Markup.inlineKeyboard(buttons)
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

bot.action(/admincountry_(.+)_(.+)/, async (ctx) => {

const type = ctx.match[1];
const country = ctx.match[2];

userState[ctx.from.id] = {

step: "admin_send",  
type,  
country

};

ctx.reply(
`📝 Send Your Method

📂 ${type}
🌍 ${country}`
);

});

/* ================= USER COUNTRY ================= */

bot.action(/usercountry_(.+)_(.+)/, async (ctx) => {

const type = ctx.match[1];
const country = ctx.match[2];

userState[ctx.from.id] = {

step: "user_send",  
type,  
country

};

ctx.reply(
`📝 Send Your Method

📂 ${type}
🌍 ${country}`
);

});

/* ================= APPROVE ================= */

bot.action(/approve_(.+)/, async (ctx) => {

if (ctx.from.id !== ADMIN_ID) {
return;
}

const id = ctx.match[1];

const data = pendingMethods[id];

if (!data) {
return;
}

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

ctx.editMessageText(
"✅ Approved Successfully"
);

});

/* ================= REJECT ================= */

bot.action(/reject_(.+)/, async (ctx) => {

if (ctx.from.id !== ADMIN_ID) {
return;
}

const id = ctx.match[1];

const data = pendingMethods[id];

if (!data) {
return;
}

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

ctx.editMessageText(
"❌ Rejected"
);

});

/* ================= BOT START ================= */

bot.launch();

console.log("🤖 Bot Running...");
