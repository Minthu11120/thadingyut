# သီတင်းကျွတ် မီးပုံးပျံ ဆုတောင်းလွှာ - Thadingyut Floating Lantern Wishes

မြန်မာ့ရိုးရာ သီတင်းကျွတ် မီးထွန်းပွဲတော် ဆုတောင်းမီးပုံးပျံများကို လွှတ်တင်ပြီး လူတိုင်း၏ မေတ္တာဆုတောင်းစာများကို တိုက်ရိုက် ကြည့်ရှု သာဓုခေါ်ဆိုနိုင်သော အွန်လိုင်းဆုတောင်းလွှာ Web Application

---

## Vercel ပေါ်တွင် တင်နည်း (How to Deploy to Vercel)

ဤ Project သည် **Vercel** တွင် အလွယ်တကူ တိုက်ရိုက် Deploy လုပ်နိုင်ရန် `vercel.json` နှင့် Serverless API (`/api/index.ts`) ဖွဲ့စည်းပုံတို့ဖြင့် အဆင်သင့် ပြင်ဆင်ပြီးဖြစ်ပါသည်။

### နည်းလမ်း (၁) - GitHub မှတစ်ဆင့် Vercel သို့ တင်နည်း (အကြံပြုချက်)

1. ဤ Code များကို မိမိ၏ **GitHub Repository** သို့ Push ပြုလုပ်ပါ။
2. [Vercel Dashboard](https://vercel.com/dashboard) သို့ ဝင်ရောက်ပြီး **"Add New Project"** ကို နှိပ်ပါ။
3. မိမိ၏ GitHub Repository ကို ရွေးချယ်ပြီး **Import** လုပ်ပါ။
4. Project Settings တွင်:
   - **Framework Preset**: `Vite` (Vercel မှ အလိုအလျောက် သိရှိပါသည်)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Deploy** ခလုတ်ကို နှိပ်လိုက်သည်နှင့် စက္ကန့်ပိုင်းအတွင်း သင့် Website ကို Live အသုံးပြုနိုင်မည် ဖြစ်ပါသည်။

---

### နည်းလမ်း (၂) - Vercel CLI ဖြင့် တင်နည်း

Terminal မှတစ်ဆင့် Deploy လုပ်လိုပါက:

```bash
# Vercel CLI မရှိသေးပါက install လုပ်ရန်
npm install -g vercel

# Deploy ပြုလုပ်ရန်
vercel

# Production သို့ တိုက်ရိုက်တင်ရန်
vercel --prod
```

---

## Local Development (စက်တွင်း စမ်းသပ်ရန်)

```bash
# Dependencies သွင်းရန်
npm install

# Dev Server ဖွင့်ရန်
npm run dev

# Production Build စမ်းသပ်ရန်
npm run build
npm start
```
