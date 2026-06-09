const mongoose = require('mongoose');
require('dotenv').config();

const reviewSchema = new mongoose.Schema({
  name:      { type: String },
  email:     { type: String },
  rating:    { type: Number },
  title:     { type: String },
  content:   { type: String },
  status:    { type: String, default: 'approved' },
  createdAt: { type: Date, default: Date.now },
});
const Review = mongoose.model('Review', reviewSchema);

const reviews = [
  { name: 'Sarah Mitchell', email: 's.mitchell@gmail.com', rating: 5, title: 'Absolutely life-changing trip!', content: 'India Tours Guide made our Golden Triangle tour completely seamless. Our driver was punctual, knowledgeable and went above and beyond every single day. The Taj Mahal at sunrise was breathtaking — exactly as promised. Will be booking again for Rajasthan next year!', createdAt: new Date('2025-03-15') },
  { name: 'James & Karen Thornton', email: 'jkthornton@outlook.com', rating: 5, title: 'Best tour company in Delhi', content: 'We were nervous about visiting India for the first time but the team made us feel completely at ease. The full-day Delhi tour covered everything from Jama Masjid to Qutub Minar. Our guide Ravi was exceptional — very professional and full of fascinating stories. Highly recommend!', createdAt: new Date('2025-02-28') },
  { name: 'Priya Sundaram', email: 'priya.s@yahoo.com', rating: 5, title: 'Perfect Varanasi experience', content: 'The Golden Triangle with Varanasi package was spectacular. Watching the Ganga Aarti ceremony was one of the most spiritual moments of my life. Everything from hotel bookings to transfers was perfectly organised. Not a single hiccup the entire 8 days.', createdAt: new Date('2025-02-10') },
  { name: 'Marco Rossi', email: 'marco.rossi@libero.it', rating: 5, title: 'Ottima organizzazione — Excellent!', content: 'I came from Italy for a 4-day Golden Triangle tour and honestly exceeded all my expectations. Private car, English-speaking guide who was incredibly knowledgeable about Mughal history, and the Taj Mahal visit at golden hour was unforgettable. A+ service from start to finish.', createdAt: new Date('2025-01-22') },
  { name: 'Aisha Al-Farsi', email: 'aisha.f@hotmail.com', rating: 5, title: 'Wonderful Jaipur day tour', content: 'Our one-day Jaipur tour was absolutely wonderful. Amber Fort, the City Palace and Hawa Mahal all in one day and we never felt rushed. The guide explained every detail beautifully. The car was clean and comfortable. I would recommend this to every traveller visiting India.', createdAt: new Date('2025-01-08') },
  { name: 'David Chen', email: 'd.chen@gmail.com', rating: 4, title: 'Great value, very professional', content: 'Booked the Full Day Delhi tour for our family of four. Guide was extremely well-informed and patient with our kids. A couple of traffic delays that were outside anyones control but the team handled everything calmly. Overall a brilliant experience and great value for money.', createdAt: new Date('2024-12-19') },
  { name: 'Sophie Leblanc', email: 'sophie.lb@gmail.com', rating: 5, title: 'Golden Triangle with Mumbai — superb!', content: 'The 8-day Golden Triangle with Mumbai package was perfectly curated. Every hotel was excellent, every guide was professional and the domestic flight connection went smoothly. Mumbai was a fantastic addition — Gateway of India and Elephanta Caves were highlights. Merci beaucoup!', createdAt: new Date('2024-12-05') },
  { name: 'Robert & Linda Walsh', email: 'walsh.travels@icloud.com', rating: 5, title: 'Retirement trip of a lifetime', content: 'We chose India Tours Guide for our retirement trip and it was the best decision we made. The team was so responsive before we even arrived — answering all our questions within hours. During the tour our guide became like family. The Agra full-day sunrise tour is something we will never forget.', createdAt: new Date('2024-11-28') },
  { name: 'Fatima Hassan', email: 'fatima.h@gmail.com', rating: 5, title: 'Seamless, stress-free, stunning', content: 'As a solo female traveller I was initially cautious but India Tours Guide made me feel completely safe the entire journey. The Half Day Old Delhi rickshaw ride through the spice market was such an authentic experience. Highly recommend the team — they truly care about their guests.', createdAt: new Date('2024-11-14') },
  { name: 'Thomas Mueller', email: 't.mueller@web.de', rating: 4, title: 'Sehr gut — very good experience', content: 'Booked the Half Day New Delhi tour before my business meetings. Guide was on time, very professional and managed to show me Humayun Tomb, Qutub Minar and Lotus Temple in just 4 hours. Excellent organisation. The only minor thing was the car GPS had some issue but the driver knew the roads perfectly anyway.', createdAt: new Date('2024-10-30') },
  { name: 'Yuki Tanaka', email: 'yuki.t@docomo.jp', rating: 5, title: '最高の旅でした — Amazing journey!', content: 'I visited India for the first time from Japan and India Tours Guide made it truly special. The Golden Triangle tour was perfectly paced — not too rushed, not too slow. My guide spoke excellent English and was very patient with my many questions. The Taj Mahal is even more beautiful in person. 5 stars!', createdAt: new Date('2024-10-15') },
  { name: 'Emily & Tom Pearce', email: 'pearce.family@gmail.com', rating: 5, title: 'Family trip made effortless', content: 'Travelling with three children can be stressful but India Tours Guide made it completely effortless. The kids loved the rickshaw ride in Old Delhi and our guide kept them engaged with stories and fun facts throughout. The 4-day Golden Triangle was perfectly paced for a family. Would book again in a heartbeat.', createdAt: new Date('2024-09-22') },
];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await Review.insertMany(reviews.map(r => ({ ...r, status: 'approved' })));
  const count = await Review.countDocuments({ status: 'approved' });
  console.log(`Done — ${count} approved reviews in DB`);
  await mongoose.disconnect();
})();
