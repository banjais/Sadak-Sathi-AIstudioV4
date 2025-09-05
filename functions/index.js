const functions = require("firebase-functions");
const axios = require("axios");
const cors = require("cors")({ origin: true });

// ===== Load Keys from Firebase Functions Config =====
const dhmKey = functions.config().dhm?.key;
const firebaseKey = functions.config().firebase?.key;
const firebaseAppId = functions.config().firebase?.appid;
const firebaseSenderId = functions.config().firebase?.senderid;
const firebaseProjectId = functions.config().firebase?.projectid;
const firebaseStorage = functions.config().firebase?.storage;
const geminiKey = functions.config().gemini?.key;
const googleMapsKey = functions.config().googlemaps?.key;
const mapboxKey = functions.config().mapbox?.key;
const openRouterKey = functions.config().openrouter?.key;
const openWeatherKey = functions.config().openweather?.key;
const otherKey = functions.config().other?.key;
const pusherKey = functions.config().pusher?.key;
const wazeKey = functions.config().waze?.key;
const weatherKey = functions.config().weather?.key;

// ===== Extra 3rd-Party Keys Slots (Future-proofing) =====
const otherKey1 = functions.config().other1?.key;
const otherKey2 = functions.config().other2?.key;
const otherKey3 = functions.config().other3?.key;
const otherKey4 = functions.config().other4?.key;
const otherKey5 = functions.config().other5?.key;

// ===== Weather Endpoint (OpenWeather) =====
exports.getWeather = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (!openWeatherKey) return res.status(500).send("Missing OpenWeather API key");

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
      res.status(200).json({
        temp: data.main.temp,
        desc: data.weather[0].main,
        icon: iconMap[data.weather[0].icon] || "thermostat"
      });
    } catch (err) {
      console.error("Weather fetch error:", err);
      res.status(500).send("Failed to fetch weather");
    }
  });
});

// ===== Traffic Endpoint (Waze + Optional Google Maps fallback) =====
exports.getTraffic = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (wazeKey) {
        // Example Waze API call (replace with real Waze API if available)
        const trafficResponse = await axios.get(`https://www.waze.com/live-traffic-api?apikey=${wazeKey}`);
        return res.status(200).json(trafficResponse.data);
      } else if (googleMapsKey) {
        // Optional Google Maps Traffic fallback
        const response = await axios.get(`https://maps.googleapis.com/maps/api/traffic/json?key=${googleMapsKey}`);
        return res.status(200).json(response.data);
      } else {
        // Fallback mock
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

// ===== Routing Endpoint (Google Maps + OpenRouter + Mapbox) =====
exports.findRoute = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { startLat, startLon, endLat, endLon, provider } = req.query;
    if (!startLat || !startLon || !endLat || !endLon) return res.status(400).send("Missing coordinates");

    try {
      let response;
      if (provider === "openrouter" && openRouterKey) {
        response = await axios.post("https://api.openrouter.ai/v1/directions", {
          start: [parseFloat(startLon), parseFloat(startLat)],
          end: [parseFloat(endLon), parseFloat(endLat)]
        }, { headers: { "Authorization": `Bearer ${openRouterKey}` } });
        return res.status(200).json(response.data);
      } else if (provider === "mapbox" && mapboxKey) {
        response = await axios.get(`https://api.mapbox.com/directions/v5/mapbox/driving/${startLon},${startLat};${endLon},${endLat}?access_token=${mapboxKey}`);
        return res.status(200).json(response.data);
      } else if (googleMapsKey) {
        response = await axios.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${startLat},${startLon}&destination=${endLat},${endLon}&key=${googleMapsKey}`);
        return res.status(200).json(response.data);
      } else {
        return res.status(500).send("No routing provider key available");
      }
    } catch (err) {
      console.error("Routing fetch error:", err);
      res.status(500).send("Failed to fetch route");
    }
  });
});

// ===== Gemini AI Endpoint =====
exports.askAI = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).send("Missing 'prompt'");
    if (!geminiKey) return res.status(500).send("Missing Gemini API key");

    try {
      const response = await axios.post("https://api.openrouter.ai/v1/chat/completions", {
        model: "gemini-2.5",
        messages: [{ role: "user", content: prompt }]
      }, { headers: { "Authorization": `Bearer ${geminiKey}` } });
      res.status(200).json(response.data);
    } catch (err) {
      console.error("AI fetch error:", err);
      res.status(500).send("Failed to fetch AI response");
    }
  });
});

// ===== DHM Endpoint =====
exports.getDHMData = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (!dhmKey) return res.status(500).send("Missing DHM API key");

    try {
      const response = await axios.get(`https://api.dhm.gov.np/data?apikey=${dhmKey}`);
      res.status(200).json(response.data);
    } catch (err) {
      console.error("DHM fetch error:", err);
      res.status(500).send("Failed to fetch DHM data");
    }
  });
});

// ===== Push / Pusher Endpoint =====
exports.pushNotification = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (!pusherKey) return res.status(500).send("Missing Pusher API key");
    try {
      // Example: You can integrate Pusher API here
      res.status(200).json({ status: "Push sent (demo)" });
    } catch (err) {
      console.error("Push error:", err);
      res.status(500).send("Failed to send push");
    }
  });
});

// ===== Other 3rd Party Endpoint Example =====
exports.otherThirdParty = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (!otherKey) return res.status(500).send("Missing Other 3rd Party API key");
    try {
      const response = await axios.get(`https://api.example.com/data?apikey=${otherKey}`);
      res.status(200).json(response.data);
    } catch (err) {
      console.error("Other 3rd Party fetch error:", err);
      res.status(500).send("Failed to fetch Other 3rd Party data");
    }
  });
});

// ===== Extra 3rd Party Slots =====
exports.otherThirdParty1 = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (!otherKey1) return res.status(500).send("Missing Other Key 1");
    res.status(200).json({ status: "Other Key 1 endpoint ready" });
  });
});
exports.otherThirdParty2 = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (!otherKey2) return res.status(500).send("Missing Other Key 2");
    res.status(200).json({ status: "Other Key 2 endpoint ready" });
  });
});
exports.otherThirdParty3 = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (!otherKey3) return res.status(500).send("Missing Other Key 3");
    res.status(200).json({ status: "Other Key 3 endpoint ready" });
  });
});
exports.otherThirdParty4 = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (!otherKey4) return res.status(500).send("Missing Other Key 4");
    res.status(200).json({ status: "Other Key 4 endpoint ready" });
  });
});
exports.otherThirdParty5 = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (!otherKey5) return res.status(500).send("Missing Other Key 5");
    res.status(200).json({ status: "Other Key 5 endpoint ready" });
  });
});
