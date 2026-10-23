# သီတင်းကျွတ် မီးပုံးပျံ ဆုတောင်းလွှာ - Thadingyut Floating Lantern Wishes

မြန်မာ့ရိုးရာ သီတင်းကျွတ် မီးထွန်းပွဲတော် ဆုတောင်းမီးပုံးပျံများကို လွှတ်တင်ပြီး လူတိုင်း၏ မေတ္တာဆုတောင်းစာများကို တိုက်ရိုက် ကြည့်ရှု သာဓုခေါ်ဆိုနိုင်သော အွန်လိုင်းဆုတောင်းလွှာ Web Application

---

## ဒေတာများ အမြဲတည်တံ့စေခြင်း (Data Persistence & Sync)

1. **Client-Side LocalStorage Persistence**:
   - ဆုတောင်းမီးပုံး လွှတ်တင်ထားသမျှနှင့် သာဓုခေါ်ဆိုထားသော အချက်အလက်များကို အသုံးပြုသူ၏ Browser Storage (`localStorage`) တွင် အလိုအလျောက် အမြဲမှတ်သားထားပေးပါသည်။
   - Refresh ပြုလုပ်သည့်အခါတွင်လည်း ဆုတောင်းစာများ မပျောက်ဘဲ ချက်ချင်း ပြန်လည်ပေါ်လာမည် ဖြစ်ပါသည်။

2. **Bidirectional Server Sync (`/api/wishes/sync`)**:
   - Vercel Serverless Function Instance အသစ် စတင်လည်ပတ်သွားသည့်အခါ Client က ၎င်း၏ သိမ်းဆည်းထားသော ဆုတောင်းစာများကို Server သို့ အလိုအလျောက် Sync လုပ်ပေးသဖြင့် အခြားသူများလည်း ဆက်လက်မြင်တွေ့နိုင်မည် ဖြစ်ပါသည်။

3. **Cloud Database ထည့်သွင်းလိုပါက (Vercel KV / Upstash Redis)**:
   - Vercel Dashboard ရှိ **Storage** tab မှ **"Create Database" -> "KV (Redis)"** ကို နှိပ်၍ Project နှင့် ချိတ်ဆက်ရုံဖြင့် (`KV_REST_API_URL` နှင့် `KV_REST_API_TOKEN` အလိုအလျောက် သတ်မှတ်ပြီး) ကမ္ဘာတစ်ဝှမ်းရှိ မည်သည့် Device မှမဆို အမြဲတမ်း Permanent Cloud Storage အဖြစ် သိမ်းဆည်းပေးမည် ဖြစ်ပါသည်။

---

## Vercel ပေါ်တွင် တင်နည်း (How to Deploy to Vercel)

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

```bash
# Vercel CLI မရှိသေးပါက install လုပ်ရန်
npm install -g vercel

# Deploy ပြုလုပ်ရန်
vercel --prod
```
