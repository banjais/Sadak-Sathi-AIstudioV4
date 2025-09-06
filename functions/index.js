const functions = require("firebase-functions");
const axios = require("axios");
const cors = require("cors")({ origin: true });

// ========================
// Load all API keys from Firebase Functions Config
// ========================
const dhmKey = functions.config().dhm?.key;
const geminiKey = functions.config().gemini?.key;
const googleMapsKey = functions.config().googlemaps?.key;
const mapboxKey = functions.config().mapbox?.key;
const openRouterKey = functions.config().openrouter?.key;
const openWeatherKey = functions.config().openweather?.key;
const wazeKey = functions.config().waze?.key;
const pusherKey = functions.config().pusher?.key;
const otherKey = functions.config().other?.key;

// Extra future-proof API slots
const otherKeys = [
  functions.config().other1?.key,
  functions.config().other2?.key,
  functions.config().other3?.key,
  functions.config().other4?.key,
  functions.config().other5?.key
];

// -------------------
// Helper: safe handler
// -------------------
const safeHandler = (key, handler) => {
  if (!key) return (req, res) => res.status(500).send("Missing API key");
  return handler;
};

// ========================
// Weather Endpoint
// ========================
exports.getWeather = safeHandler(openWeatherKey, functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).send("Missing 'lat' or 'lon'");
    try {
      const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherKey}&units=metric`;
      const response = await axios.get(apiUrl);
      const data = response.data;
      const iconMap = {
        "01d": "wb_sunny","01n":"nightlight_round","02d":"partly_cloudy_day","02n":"partly_cloudy_night",
        "03d":"cloud","03n":"cloud","04d":"cloudy","04n":"cloudy","09d":"rainy","09n":"rainy",
        "10d":"rainy","10n":"rainy","11d":"thunderstorm","11n":"thunderstorm",
        "13d":"ac_unit","13n":"ac_unit","50d":"foggy","50n":"foggy"
      };
      res.status(200).json({ temp: data.main.temp, desc: data.weather[0].main, icon: iconMap[data.weather[0].icon] || "thermostat" });
    } catch (err) {
      console.error("Weather fetch error:", err);
      res.status(500).send("Failed to fetch weather");
    }
  });
}));

// ========================
// Traffic Endpoint
// ========================
exports.getTraffic = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (wazeKey) {
        const trafficResponse = await axios.get(`https://www.waze.com/live-traffic-api?apikey=${wazeKey}`);
        return res.status(200).json(trafficResponse.data);
      } else if (googleMapsKey) {
        const response = await axios.get(`https://maps.googleapis.com/maps/api/traffic/json?key=${googleMapsKey}`);
        return res.status(200).json(response.data);
      } else {
        return res.status(200).json({
          type: "FeatureCollection",
          features: [
            { type:"Feature", properties:{traffic:"heavy"}, geometry:{type:"LineString", coordinates:[[85.3240,27.7172],[85.3350,27.7190]] }},
            { type:"Feature", properties:{traffic:"moderate"}, geometry:{type:"LineString", coordinates:[[83.9856,28.2096],[83.9800,28.2200]] }},
            { type:"Feature", properties:{traffic:"light"}, geometry:{type:"LineString", coordinates:[[85.3100,27.7000],[85.3150,27.6950]] }}
          ]
        });
      }
    } catch (err) {
      console.error("Traffic fetch error:", err);
      res.status(500).send("Failed to fetch traffic data");
    }
  });
});

// ========================
// Routing Endpoint
// ========================
exports.findRoute = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { startLat, startLon, endLat, endLon, provider } = req.query;
    if (!startLat || !startLon || !endLat || !endLon) return res.status(400).send("Missing coordinates");
    try {
      let response;
      if (provider === "openrouter" && openRouterKey) {
        response = await axios.post("https://api.openrouter.ai/v1/directions", { start:[parseFloat(startLon),parseFloat(startLat)], end:[parseFloat(endLon),parseFloat(endLat)] }, { headers:{ "Authorization": `Bearer ${openRouterKey}` } });
      } else if (provider === "mapbox" && mapboxKey) {
        response = await axios.get(`https://api.mapbox.com/directions/v5/mapbox/driving/${startLon},${startLat};${endLon},${endLat}?access_token=${mapboxKey}`);
      } else if (googleMapsKey) {
        response = await axios.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${startLat},${startLon}&destination=${endLat},${endLon}&key=${googleMapsKey}`);
      } else {
        return res.status(500).send("No routing provider key available");
      }
      res.status(200).json(response.data);
    } catch (err) {
      console.error("Routing fetch error:", err);
      res.status(500).send("Failed to fetch route");
    }
  });
});

// ========================
// Gemini AI Endpoint
// ========================
exports.askAI = safeHandler(geminiKey, functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).send("Missing 'prompt'");
    try {
      const response = await axios.post("https://api.openrouter.ai/v1/chat/completions", { model:"gemini-2.5", messages:[{role:"user",content:prompt}] }, { headers:{ "Authorization": `Bearer ${geminiKey}` } });
      res.status(200).json(response.data);
    } catch (err) {
      console.error("AI fetch error:", err);
      res.status(500).send("Failed to fetch AI response");
    }
  });
}));

// ========================
// DHM Endpoint
// ========================
exports.getDHMData = safeHandler(dhmKey, functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const response = await axios.get(`https://api.dhm.gov.np/data?apikey=${dhmKey}`);
      res.status(200).json(response.data);
    } catch (err) {
      console.error("DHM fetch error:", err);
      res.status(500).send("Failed to fetch DHM data");
    }
  });
}));

// ========================
// Push / Pusher Endpoint
// ========================
exports.pushNotification = safeHandler(pusherKey, functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    res.status(200).json({ status: "Push sent (demo)" });
  });
}));

// ========================
// Other 3rd Party Endpoint
// ========================
exports.otherThirdParty = safeHandler(otherKey, functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const response = await axios.get(`https://api.example.com/data?apikey=${otherKey}`);
      res.status(200).json(response.data);
    } catch (err) {
      console.error("Other 3rd Party fetch error:", err);
      res.status(500).send("Failed to fetch Other 3rd Party data");
    }
  });
}));

// ========================
// Extra Other Keys (1-5)
// ========================
otherKeys.forEach((key, idx) => {
  exports[`otherThirdParty${idx+1}`] = safeHandler(key, functions.https.onRequest((req,res)=>{
    cors(req,res,()=>res.status(200).json({ status: `Other Key ${idx+1} endpoint ready` }));
  }));
});
