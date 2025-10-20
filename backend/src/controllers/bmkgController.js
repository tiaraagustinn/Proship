const bmkgService = require('../services/bmkgService');

exports.getLatestEarthquake = async (req, res) => {
  try {
    const data = await bmkgService.getLatestEarthquake();
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getSignificantEarthquakes = async (req, res) => {
  try {
    const data = await bmkgService.getSignificantEarthquakes();
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getFeltEarthquakes = async (req, res) => {
  try {
    const data = await bmkgService.getFeltEarthquakes();
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getMaritimeWeather = async (req, res) => {
  try {
    const data = await bmkgService.getMaritimeWeather();
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};