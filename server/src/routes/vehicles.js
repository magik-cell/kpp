const express = require('express');
const Vehicle = require('../models/Vehicle');
const Entry = require('../models/Entry');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Функція валідації українських номерів автомобілів
const validateUkrainianLicensePlate = (licensePlate) => {
  const ukrainianPlateRegex = /^[АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ]{1,2}[0-9]{3,4}[АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ]{0,2}$|^[0-9]{4}[АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ]{2}$/;
  return ukrainianPlateRegex.test(licensePlate.toUpperCase());
};

// Отримання всіх автомобілів (для офіцерів інституту та КПП)
router.get('/', authenticateToken, requireRole(['unit_officer', 'kpp_officer']), async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const query = { isActive: true };
    if (search) {
      query.$or = [
        { licensePlate: { $regex: search, $options: 'i' } },
        { owner: { $regex: search, $options: 'i' } }
      ];
    }

    const vehicles = await Vehicle.find(query)
      .populate('createdBy', 'username fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Vehicle.countDocuments(query);

    const formattedVehicles = vehicles.map((vehicle) => {
      const vehicleData = vehicle.toObject();
      return {
        id: vehicleData._id.toString(),
        licensePlate: vehicleData.licensePlate,
        brand: vehicleData.brand,
        model: vehicleData.vehicleModel,
        owner: vehicleData.owner,
        accessType: vehicleData.accessType,
        validUntil: vehicleData.validUntil,
        isActive: vehicleData.isActive,
        createdBy: vehicleData.createdBy,
        createdAt: vehicleData.createdAt,
        updatedAt: vehicleData.updatedAt
      };
    });

    res.json({
      vehicles: formattedVehicles,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        hasNext: skip + limitNum < total,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({ error: 'Помилка отримання списку автомобілів' });
  }
});

// Отримання інформації про конкретний автомобіль за номером
router.get('/check/:licensePlate', authenticateToken, async (req, res) => {
  try {
    const { licensePlate } = req.params;
    const upperPlate = licensePlate.toUpperCase();

    const vehicle = await Vehicle.findOne({ 
      licensePlate: upperPlate, 
      isActive: true 
    }).populate('createdBy', 'username fullName');

    if (!vehicle) {
      return res.status(404).json({ 
        error: 'Автомобіль не знайдено в базі даних',
        licensePlate: upperPlate,
        allowed: false
      });
    }

    // Перевірка терміну дії
    let isValid = true;
    let validityMessage = 'Дозвіл на проїзд';

    if (vehicle.accessType !== 'permanent' && vehicle.validUntil) {
      if (new Date() > vehicle.validUntil) {
        isValid = false;
        validityMessage = 'Термін дії дозволу закінчився';
      }
    }

    // Отримання останнього запису проїзду
    const lastEntry = await Entry.findOne({ vehicle: vehicle._id }).sort({ createdAt: -1 });

    res.json({
      vehicle: {
        id: vehicle._id,
        licensePlate: vehicle.licensePlate,
        brand: vehicle.brand,
        model: vehicle.vehicleModel,
        owner: vehicle.owner,
        accessType: vehicle.accessType,
        validUntil: vehicle.validUntil,
        createdBy: vehicle.createdBy
      },
      allowed: isValid,
      message: validityMessage,
      lastEntry: lastEntry ? {
        entryTime: lastEntry.entryTime,
        exitTime: lastEntry.exitTime,
        status: lastEntry.status,
        createdAt: lastEntry.createdAt
      } : null
    });
  } catch (error) {
    console.error('Check vehicle error:', error);
    res.status(500).json({ error: 'Помилка перевірки автомобіля' });
  }
});

// Додавання нового автомобіля (тільки для чергового інституту)
router.post('/', authenticateToken, requireRole(['unit_officer']), async (req, res) => {
  try {
    const { licensePlate, brand, model, owner, accessType, validUntil } = req.body;

    if (!licensePlate || !brand || !model || !owner || !accessType) {
      return res.status(400).json({ 
        error: "Всі поля є обов'язковими",
        required: ['licensePlate', 'brand', 'model', 'owner', 'accessType']
      });
    }

    // Валідація формату українського номера
    if (!validateUkrainianLicensePlate(licensePlate)) {
      return res.status(400).json({ 
        error: 'Неправильний формат номера автомобіля. Використовуйте українські літери та цифри (наприклад: АА1234ВВ)'
      });
    }

    // Перевірка наявності автомобіля
    const existingVehicle = await Vehicle.findOne({ licensePlate: licensePlate.toUpperCase() });
    if (existingVehicle) {
      return res.status(409).json({ 
        error: 'Автомобіль з таким номером вже існує',
        existing: {
          licensePlate: existingVehicle.licensePlate,
          owner: existingVehicle.owner,
          isActive: existingVehicle.isActive
        }
      });
    }

    // Розрахунок validUntil для різних типів доступу
    let calculatedValidUntil;
    if (accessType === 'temporary_24h') {
      calculatedValidUntil = new Date();
      calculatedValidUntil.setHours(calculatedValidUntil.getHours() + 24);
    } else if (accessType === 'temporary_custom' && validUntil) {
      calculatedValidUntil = new Date(validUntil);
    }

    const newVehicle = new Vehicle({
      licensePlate: licensePlate.toUpperCase(),
      brand,
      vehicleModel: model,
      owner,
      accessType,
      validUntil: calculatedValidUntil,
      createdBy: req.user && req.user._id
    });

    await newVehicle.save();
    await newVehicle.populate('createdBy', 'username fullName');

    const formattedVehicle = {
      id: newVehicle._id.toString(),
      licensePlate: newVehicle.licensePlate,
      brand: newVehicle.brand,
      model: newVehicle.vehicleModel,
      owner: newVehicle.owner,
      accessType: newVehicle.accessType,
      validUntil: newVehicle.validUntil,
      isActive: newVehicle.isActive,
      createdBy: newVehicle.createdBy,
      createdAt: newVehicle.createdAt,
      updatedAt: newVehicle.updatedAt
    };

    res.status(201).json({ message: 'Автомобіль успішно додано', vehicle: formattedVehicle });
  } catch (error) {
    console.error('Add vehicle error:', error);
    if (error && error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Помилка валідації',
        details: Object.values(error.errors || {}).map((err) => err.message)
      });
    }
    res.status(500).json({ error: 'Помилка додавання автомобіля' });
  }
});

// Редагування автомобіля (тільки для чергового інституту)
router.put('/:id', authenticateToken, requireRole(['unit_officer']), async (req, res) => {
  try {
    const { id } = req.params;
    const { licensePlate, brand, model, owner, accessType, validUntil, isActive } = req.body;

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Автомобіль не знайдено' });
    }

    // Валідація формату українського номера (якщо змінюється)
    if (licensePlate && !validateUkrainianLicensePlate(licensePlate)) {
      return res.status(400).json({ 
        error: 'Неправильний формат номера автомобіля. Використовуйте українські літери та цифри (наприклад: АА1234ВВ)'
      });
    }

    // Перевірка унікальності номера (якщо змінюється)
    if (licensePlate && licensePlate.toUpperCase() !== vehicle.licensePlate) {
      const existingVehicle = await Vehicle.findOne({ 
        licensePlate: licensePlate.toUpperCase(),
        _id: { $ne: id }
      });
      if (existingVehicle) {
        return res.status(409).json({ error: 'Автомобіль з таким номером вже існує' });
      }
    }

    // Оновлення полів
    if (licensePlate) vehicle.licensePlate = licensePlate.toUpperCase();
    if (brand) vehicle.brand = brand;
    if (model) vehicle.vehicleModel = model;
    if (owner) vehicle.owner = owner;
    if (accessType) vehicle.accessType = accessType;
    if (isActive !== undefined) vehicle.isActive = isActive;

    // Розрахунок validUntil
    if (accessType === 'temporary_24h') {
      vehicle.validUntil = new Date();
      vehicle.validUntil.setHours(vehicle.validUntil.getHours() + 24);
    } else if (accessType === 'temporary_custom' && validUntil) {
      vehicle.validUntil = new Date(validUntil);
    } else if (accessType === 'permanent') {
      vehicle.validUntil = undefined;
    }

    await vehicle.save();
    await vehicle.populate('createdBy', 'username fullName');

    const formattedVehicle = {
      id: vehicle._id.toString(),
      licensePlate: vehicle.licensePlate,
      brand: vehicle.brand,
      model: vehicle.vehicleModel,
      owner: vehicle.owner,
      accessType: vehicle.accessType,
      validUntil: vehicle.validUntil,
      isActive: vehicle.isActive,
      createdBy: vehicle.createdBy,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt
    };

    res.json({ message: 'Автомобіль успішно оновлено', vehicle: formattedVehicle });
  } catch (error) {
    console.error('Update vehicle error:', error);
    if (error && error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Помилка валідації',
        details: Object.values(error.errors || {}).map((err) => err.message)
      });
    }
    res.status(500).json({ error: 'Помилка оновлення автомобіля' });
  }
});

// Видалення автомобіля (м'яке видалення - позначення як неактивний)
router.delete('/:id', authenticateToken, requireRole(['unit_officer']), async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Автомобіль не знайдено' });
    }
    vehicle.isActive = false;
    await vehicle.save();
    res.json({ message: 'Автомобіль успішно видалено', vehicleId: id });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({ error: 'Помилка видалення автомобіля' });
  }
});

module.exports = router;
