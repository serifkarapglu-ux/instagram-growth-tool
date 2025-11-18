// ------------------------------
// TELEGRAM + RENDER + WEBHOOK + LICENSE SYSTEM
// FULL WORKING PROJECT (index.js)
// ------------------------------

import express from 'express';
import { Telegraf } from 'telegraf';
import fs from 'fs';

// ------------------------------
// CONFIG AREA
// ------------------------------
const TOKEN = "8335971220:AAH9xspYENEO332p2lo2YmcDlmhg5sKkFOE"; // ← BURAYA KENDİ TOKENİNİ YAZ
const ADMIN_ID ="6446532700";       // ← BURAYA KENDİ TELEGRAM ID'NI YAZ
const PORT = process.env.PORT || 3000;

const bot = new Telegraf(TOKEN);
const app = express();
app.use(express.json());

// ------------------------------
// DATABASE - LICENSE KEY SYSTEM
// ------------------------------
const KEYPATH = './keys.json';
if (!fs.existsSync(KEYPATH)) fs.writeFileSync(KEYPATH, JSON.stringify({}, null, 2));
let keys = JSON.parse(fs.readFileSync(KEYPATH));

function saveKeys(){
  fs.writeFileSync(KEYPATH, JSON.stringify(keys, null, 2));
}

// ------------------------------
// LICENSE VERIFY FUNCTION
// ------------------------------
function verifyKey(key, userId){
  if(!keys[key]) return {success:false, msg:"❌ Geçersiz key."};
  let obj = keys[key];

  if(obj.isUsed && obj.ownerId !== userId)
    return {success:false, msg:"❌ Bu key başka kullanıcıya kayıtlı."};

  if(new Date(obj.expiresAt) < new Date())
    return {success:false, msg:"❌ Key süresi dolmuş."};

  obj.isUsed = true;
  obj.ownerId = userId;
  saveKeys();
  return {success:true, msg:"✅ Giriş başarılı! Menü yükleniyor..."};
}

// ------------------------------
// SIMPLE SESSION
// ------------------------------
const userState = {}; // session tutuyor

// ------------------------------
// START COMMAND
// ------------------------------
bot.start((ctx) => {
  ctx.reply("🔐 Lütfen lisans anahtarını giriniz:");
  userState[ctx.from.id] = { waitKey: true };
});

// ------------------------------
// TEXT MESSAGE HANDLER
// ------------------------------
bot.on('text', (ctx) => {
  const uid = ctx.from.id;
  const text = ctx.message.text;

  // LICENSE INPUT
  if(userState[uid]?.waitKey){
    let r = verifyKey(text, uid);
    ctx.reply(r.msg);
    if(r.success){
      userState[uid].waitKey = false;
      showMenu(ctx);
    }
    return;
  }
});

// ------------------------------
// ADMIN KEY CREATE COMMAND
// ------------------------------
bot.command('createkey', (ctx) => {
  if(ctx.from.id !== ADMIN_ID) return;

  const args = ctx.message.text.split(" ");
  const days = parseInt(args[1]);
  if(!days) return ctx.reply("Gün belirt. Örnek: /createkey 30");

  const key = Math.random().toString(36).substring(2,10).toUpperCase();
  const expiresAt = new Date(Date.now() + days*24*60*60*1000);

  keys[key] = { ownerId:null, expiresAt, isUsed:false };
  saveKeys();

  ctx.reply(`🔑 Yeni Key Oluşturuldu:\n${key}\n📅 Süre: ${days} gün`);
});

// ------------------------------
// MAIN MENU
// ------------------------------
function showMenu(ctx){
  ctx.reply(
`📊 *Instagram Growth Panel*

1️⃣ Hashtag Analizi
2️⃣ Rakip Analizi
3️⃣ En İyi Saate Analizi
4️⃣ Trend Müzikler
5️⃣ İçerik Öneri Motoru
6️⃣ Reels Performans Takibi
7️⃣ 30 Günlük İçerik Takvimi`, 
{parse_mode:'Markdown'}
);
}

// ------------------------------
// WEBHOOK ENDPOINT
// ------------------------------
app.post(`/${TOKEN}`, (req, res) => {
  bot.handleUpdate(req.body);
  res.sendStatus(200);
});

app.get('/', (req,res) => {
  res.send("Bot Çalışıyor ✔️");
});

// ------------------------------
app.listen(PORT, () => {
  console.log("Server başladı → PORT:", PORT);
});
