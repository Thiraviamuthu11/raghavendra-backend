const express = require('express');
const router = express.Router();
const { BATTERIES, COMPATIBILITY } = require('../data/batteries');

// GET /api/products — list all batteries, optional ?type=bike|car
router.get('/', (req, res) => {
  const { type } = req.query;
  const results = type
    ? BATTERIES.filter((b) => b.type === type)
    : BATTERIES;
  res.json({ success: true, data: results });
});

// GET /api/products/:id — single battery
router.get('/:id', (req, res) => {
  const battery = BATTERIES.find((b) => b.id === parseInt(req.params.id));
  if (!battery) {
    return res.status(404).json({ success: false, message: 'Battery not found' });
  }
  res.json({ success: true, data: battery });
});

// GET /api/products/finder/compatibility — full compatibility map
router.get('/finder/compatibility', (req, res) => {
  res.json({ success: true, data: COMPATIBILITY });
});

// GET /api/products/finder/result?vehicleType=car&brand=Maruti&model=Swift+Petrol
router.get('/finder/result', (req, res) => {
  const { vehicleType, brand, model } = req.query;
  if (!vehicleType || !brand || !model) {
    return res
      .status(400)
      .json({ success: false, message: 'vehicleType, brand, and model are required' });
  }

  const typeMap = COMPATIBILITY[vehicleType];
  if (!typeMap) {
    return res.status(400).json({ success: false, message: 'Invalid vehicleType' });
  }
  const brandMap = typeMap[brand];
  if (!brandMap) {
    return res.status(404).json({ success: false, message: 'Brand not found' });
  }
  const batteryId = brandMap[model];
  if (!batteryId) {
    return res.status(404).json({ success: false, message: 'Model not found' });
  }

  const battery = BATTERIES.find((b) => b.id === batteryId);
  res.json({ success: true, data: battery });
});

module.exports = router;
