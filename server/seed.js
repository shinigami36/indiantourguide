// Legacy seeder: populates the Tour collection used only by the admin API
// (/api/tours). The public frontend renders tours from src/data/indiaTours.js
// and never reads this collection.
const mongoose = require('mongoose');
require('dotenv').config();

// Tour Schema (same as in index.js)
const tourSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  titleKey: { type: String, required: true },
  durationKey: { type: String, required: true },
  locationsKey: { type: String, required: true },
  descriptionKey: { type: String, required: true },
  itineraryKey: { type: String, required: true },
  includesKey: { type: String, required: true },
  video: { type: String },
  rating: { type: Number, default: 4.5 },
  active: { type: Boolean, default: true }
});

const Tour = mongoose.model('Tour', tourSchema);

// Tour data from frontend
const toursData = [
  {
    id: 'golden-triangle',
    titleKey: 'tours.goldenTriangle.title',
    durationKey: 'tours.goldenTriangle.duration',
    locationsKey: 'tours.goldenTriangle.locations',
    descriptionKey: 'tours.goldenTriangle.description',
    itineraryKey: 'tours.goldenTriangle.itinerary',
    includesKey: 'tours.goldenTriangle.includes',
    video: '/assets/images/Golden%20Triangle%20Tour.mp4',
    rating: 4.8
  },
  {
    id: 'agra-full-day',
    titleKey: 'tours.agraFullDay.title',
    durationKey: 'tours.agraFullDay.duration',
    locationsKey: 'tours.agraFullDay.locations',
    descriptionKey: 'tours.agraFullDay.description',
    itineraryKey: 'tours.agraFullDay.itinerary',
    includesKey: 'tours.agraFullDay.includes',
    video: '/assets/images/1DayAgraTour.mp4',
    rating: 4.9
  },
  {
    id: 'jaipur-1-day',
    titleKey: 'tours.jaipurDay.title',
    durationKey: 'tours.jaipurDay.duration',
    locationsKey: 'tours.jaipurDay.locations',
    descriptionKey: 'tours.jaipurDay.description',
    itineraryKey: 'tours.jaipurDay.itinerary',
    includesKey: 'tours.jaipurDay.includes',
    video: '/assets/images/1DayJaipurTour.mp4',
    rating: 4.7
  },
  {
    id: 'delhi-old-half-day',
    titleKey: 'tours.delhiOldHalfDay.title',
    durationKey: 'tours.delhiOldHalfDay.duration',
    locationsKey: 'tours.delhiOldHalfDay.locations',
    descriptionKey: 'tours.delhiOldHalfDay.description',
    itineraryKey: 'tours.delhiOldHalfDay.itinerary',
    includesKey: 'tours.delhiOldHalfDay.includes',
    video: '/assets/images/Delhi%20Day%20Tour.mp4',
    rating: 4.6
  },
  {
    id: 'delhi-new-half-day',
    titleKey: 'tours.delhiNewHalfDay.title',
    durationKey: 'tours.delhiNewHalfDay.duration',
    locationsKey: 'tours.delhiNewHalfDay.locations',
    descriptionKey: 'tours.delhiNewHalfDay.description',
    itineraryKey: 'tours.delhiNewHalfDay.itinerary',
    includesKey: 'tours.delhiNewHalfDay.includes',
    video: '/assets/images/Delhi%20Day%20Tour.mp4',
    rating: 4.6
  },
  {
    id: 'delhi-full-day',
    titleKey: 'tours.delhiFullDay.title',
    durationKey: 'tours.delhiFullDay.duration',
    locationsKey: 'tours.delhiFullDay.locations',
    descriptionKey: 'tours.delhiFullDay.description',
    itineraryKey: 'tours.delhiFullDay.itinerary',
    includesKey: 'tours.delhiFullDay.includes',
    video: '/assets/tour-videos/Delhi%20Day%20Tour.mp4',
    rating: 4.7
  },
  {
    id: 'golden-triangle-mumbai',
    titleKey: 'tours.goldenTriangleMumbai.title',
    durationKey: 'tours.goldenTriangleMumbai.duration',
    locationsKey: 'tours.goldenTriangleMumbai.locations',
    descriptionKey: 'tours.goldenTriangleMumbai.description',
    itineraryKey: 'tours.goldenTriangleMumbai.itinerary',
    includesKey: 'tours.goldenTriangleMumbai.includes',
    video: '/assets/tour-videos/Golden%20Triangle%20With%20Mumbai.mp4',
    rating: 4.8
  },
  {
    id: 'golden-triangle-varanasi',
    titleKey: 'tours.goldenTriangleVaranasi.title',
    durationKey: 'tours.goldenTriangleVaranasi.duration',
    locationsKey: 'tours.goldenTriangleVaranasi.locations',
    descriptionKey: 'tours.goldenTriangleVaranasi.description',
    itineraryKey: 'tours.goldenTriangleVaranasi.itinerary',
    includesKey: 'tours.goldenTriangleVaranasi.includes',
    video: '/assets/tour-videos/Golden%20Triangle%20Tour%20with%20Varanasi.mp4',
    rating: 4.9
  },
  // Turkey 🇹🇷
  {
    id: 'turkish-delight-9d',
    titleKey: 'tours.turkishDelight9D.title',
    durationKey: 'tours.turkishDelight9D.duration',
    locationsKey: 'tours.turkishDelight9D.locations',
    descriptionKey: 'tours.turkishDelight9D.description',
    itineraryKey: 'tours.turkishDelight9D.itinerary',
    includesKey: 'tours.turkishDelight9D.includes',
    video: null,
    rating: 4.9
  },
  {
    id: 'istanbul-cappadocia-7d',
    titleKey: 'tours.istanbulCappadocia7D.title',
    durationKey: 'tours.istanbulCappadocia7D.duration',
    locationsKey: 'tours.istanbulCappadocia7D.locations',
    descriptionKey: 'tours.istanbulCappadocia7D.description',
    itineraryKey: 'tours.istanbulCappadocia7D.itinerary',
    includesKey: 'tours.istanbulCappadocia7D.includes',
    video: null,
    rating: 4.8
  },
  {
    id: 'seven-churches-8d',
    titleKey: 'tours.sevenChurches8D.title',
    durationKey: 'tours.sevenChurches8D.duration',
    locationsKey: 'tours.sevenChurches8D.locations',
    descriptionKey: 'tours.sevenChurches8D.description',
    itineraryKey: 'tours.sevenChurches8D.itinerary',
    includesKey: 'tours.sevenChurches8D.includes',
    video: null,
    rating: 4.9
  }
];

async function seedTours() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/indiatourguide', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing tours
    await Tour.deleteMany({});
    console.log('Cleared existing tours');

    // Insert new tours
    const tours = await Tour.insertMany(toursData);
    console.log(`Seeded ${tours.length} tours successfully`);

    console.log('Tour seeding completed!');
  } catch (error) {
    console.error('Error seeding tours:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

seedTours();