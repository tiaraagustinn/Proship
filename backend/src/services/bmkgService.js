const axios = require('axios');

class BMKGService {
  constructor() {
    this.baseURL = 'https://data.bmkg.go.id/DataMKG/TEWS';
  }

  // Gempa terkini
  async getLatestEarthquake() {
    try {
      const response = await axios.get(`${this.baseURL}/autogempa.json`);
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching latest earthquake: ${error.message}`);
    }
  }

  // Gempa M 5.0+
  async getSignificantEarthquakes() {
    try {
      const response = await axios.get(`${this.baseURL}/gempaterkini.json`);
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching significant earthquakes: ${error.message}`);
    }
  }

  // Gempa dirasakan
  async getFeltEarthquakes() {
    try {
      const response = await axios.get(`${this.baseURL}/gempadirasakan.json`);
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching felt earthquakes: ${error.message}`);
    }
  }

  // Cuaca maritim
  async getMaritimeWeather() {
    try {
      const response = await axios.get('https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/PrakiraaNCuacaMaritimIndonesia.xml');
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching maritime weather: ${error.message}`);
    }
  }
}

module.exports = new BMKGService();