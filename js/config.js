'use strict';
/* ============================================================
   সাইট কনফিগারেশন — ডা. আরিফুল ইসলাম (রাজশাহী)
   এই ফাইলেই সাইটের পরিবর্তনযোগ্য সব সেটিংস এক জায়গায় আছে।
   ============================================================ */

window.SITE_CONFIG = {

  /* -----------------------------------------------------------
  ১) ফ্রি ক্লাউড ডাটা স্টোরেজ (ঐচ্ছিক — ফর্মের ডাটা ক্লাউডে জমা রাখতে)
  -----------------------------------------------------------
  অ্যাপয়েন্টমেন্ট ও রিভিউ ফর্মের ডাটা সম্পূর্ণ ফ্রিতে ক্লাউডে সংরক্ষণ
  করতে নিচের যেকোনো একটি ঘরে URL বসান (দুটোই দিলে Firebase আগে ব্যবহৃত হবে)।

  ক) Firebase Realtime Database (ফ্রি Spark প্ল্যানই যথেষ্ট):
     - https://console.firebase.google.com এ গিয়ে একটি প্রজেক্ট তৈরি করুন
     - Build > Realtime Database > Create Database (Test mode নির্বাচন করুন)
     - যে ডাটাবেস URL পাবেন (যেমন https://আপনার-প্রজেক্ট.firebaseio.com)
       সেটি নিচের firebaseDatabaseUrl ঘরে বসান

  খ) Google Sheets + Apps Script (সম্পূর্ণ ফ্রি, কোনো কার্ড লাগে না):
     - Google Drive এ একটি Google Sheet তৈরি করুন
     - Extensions > Apps Script খুলে নিচের কোডটি বসান:

        function doPost(e) {
          var d = JSON.parse(e.postData.contents);
          var sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
          if (sh.getLastRow() === 0) {
            sh.appendRow(['type','name','phone','service','date','slot','text','stars','createdAt']);
          }
          sh.appendRow([d.type, d.name, d.phone || '', d.service || '', d.date || '',
                        d.slot || '', d.text || '', d.stars || '', d.createdAt || '']);
          return ContentService.createTextOutput(JSON.stringify({ok:true}))
                 .setMimeType(ContentService.MimeType.JSON);
        }

     - Deploy > New deployment > Web app (Access: Anyone) করে /exec URL
       নিচের googleAppsScriptUrl ঘরে বসান

  দুটোই খালি রাখলে ডাটা ব্রাউজারের localStorage এ সেভ হবে (ডেমো মোড)।
  ----------------------------------------------------------- */
  firebaseDatabaseUrl: '',   // যেমন: 'https://your-project-default-rtdb.firebaseio.com'
  googleAppsScriptUrl: '',   // যেমন: 'https://script.google.com/macros/s/xxxxx/exec'

  /* -----------------------------------------------------------
  ২) যোগাযোগ — এখানে আসল নম্বর বসান
  (হোয়াটসঅ্যাপ ফ্লোটিং বাটন ও ফুটারের হোয়াটসঅ্যাপ লিংকে ব্যবহৃত হয়;
   বাকি tel:/mailto: লিংকগুলো index.html এ খুঁজে বদলে নিন)
  ----------------------------------------------------------- */
  whatsappNumber: '8801712345678',

  /* -----------------------------------------------------------
  ৩) অন্যান্য সেটিংস
  ----------------------------------------------------------- */
  maxSerialsPerDay: 30,   // দিনে সর্বোচ্চ কতগুলো সিরিয়াল গ্রহণ করা হবে
  carouselAutoMs: 6000    // রিভিউ স্লাইডার কত মিলিসেকেন্ড পর পর বদলাবে
};
