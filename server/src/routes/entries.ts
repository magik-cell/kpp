import express from 'express';
import Vehicle from '../models/Vehicle';
import Entry from '../models/Entry';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Відмітка про вїзд/виїзд автомобіля (тільки для чергового КПП)
router.post('/toggle/:licensePlate', authenticateToken, requireRole(['kpp_officer']), async (req: AuthRequest, res) => {
  try {
    const { licensePlate } = req.params;
    const upperPlate = licensePlate.toUpperCase();

    // Знаходимо автомобіль
    const vehicle = await Vehicle.findOne({ 
      licensePlate: upperPlate, 
      isActive: true 
    });

    if (!vehicle) {
      return res.status(404).json({ 
        error: 'Автомобіль не знайдено в базі даних',
        licensePlate: upperPlate,
        allowed: false
      });
    }

    // Перевірка терміну дії
    if (vehicle.accessType !== 'permanent' && vehicle.validUntil) {
      if (new Date() > vehicle.validUntil) {
        return res.status(403).json({
          error: 'Термін дії дозволу закінчився',
          vehicle: {
            licensePlate: vehicle.licensePlate,
            owner: vehicle.owner,
            validUntil: vehicle.validUntil
          },
          allowed: false
        });
      }
    }

    // Знаходимо останній запис проїзду
    const lastEntry = await Entry.findOne({ 
      vehicle: vehicle._id 
    }).sort({ createdAt: -1 });

    const currentTime = new Date();
    let newEntry: any;

    // Якщо немає записів або останній запис - виїзд, створюємо запис про вїзд
    if (!lastEntry || lastEntry.status === 'exited') {
      newEntry = new Entry({
        vehicle: vehicle._id,
        licensePlate: vehicle.licensePlate,
        entryTime: currentTime,
        exitTime: null,
        status: 'entered',
        processedBy: req.user!._id
      });

      await newEntry.save();
      await newEntry.populate([
        { path: 'vehicle', select: 'licensePlate brand model owner' },
        { path: 'processedBy', select: 'username fullName' }
      ]);

      res.json({
        message: 'Автомобіль зареєстровано на території',
        action: 'entry',
        entry: newEntry,
        vehicle: {
          licensePlate: vehicle.licensePlate,
          brand: vehicle.brand,
          model: vehicle.vehicleModel,
          owner: vehicle.owner
        }
      });

    } else if (lastEntry.status === 'entered') {
      // Якщо останній запис - вїзд, оновлюємо його на виїзд
      lastEntry.exitTime = currentTime;
      lastEntry.status = 'exited';
      await lastEntry.save();

      await lastEntry.populate([
        { path: 'vehicle', select: 'licensePlate brand model owner' },
        { path: 'processedBy', select: 'username fullName' }
      ]);

      res.json({
        message: 'Автомобіль зареєстровано як такий що покинув територію',
        action: 'exit',
        entry: lastEntry,
        vehicle: {
          licensePlate: vehicle.licensePlate,
          brand: vehicle.brand,
          model: vehicle.vehicleModel,
          owner: vehicle.owner
        },
        duration: {
          entryTime: lastEntry.entryTime,
          exitTime: lastEntry.exitTime,
          totalMinutes: lastEntry.entryTime && lastEntry.exitTime ? 
            Math.round((lastEntry.exitTime.getTime() - lastEntry.entryTime.getTime()) / (1000 * 60)) : 0
        }
      });
    }

  } catch (error) {
    console.error('Toggle entry error:', error);
    res.status(500).json({ error: 'Помилка обробки проїзду' });
  }
});

// Отримання історії проїздів для конкретного автомобіля
router.get('/history/:licensePlate', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { licensePlate } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const vehicle = await Vehicle.findOne({ 
      licensePlate: licensePlate.toUpperCase() 
    });

    if (!vehicle) {
      return res.status(404).json({ 
        error: 'Автомобіль не знайдено',
        licensePlate: licensePlate.toUpperCase()
      });
    }

    const entries = await Entry.find({ vehicle: vehicle._id })
      .populate('processedBy', 'username fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Entry.countDocuments({ vehicle: vehicle._id });

    res.json({
      vehicle: {
        licensePlate: vehicle.licensePlate,
        brand: vehicle.brand,
        model: vehicle.vehicleModel,
        owner: vehicle.owner
      },
      entries,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        hasNext: skip + limitNum < total,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Помилка отримання історії проїздів' });
  }
});

// Отримання всіх записів проїздів з фільтрацією (для чергового частини)
router.get('/', authenticateToken, requireRole(['unit_officer']), async (req: AuthRequest, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      dateFrom, 
      dateTo, 
      licensePlate 
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    let query: any = {};

    // Фільтр за статусом
    if (status && ['entered', 'exited'].includes(status as string)) {
      query.status = status;
    }

    // Фільтр за датою
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom as string);
      if (dateTo) {
        const endDate = new Date(dateTo as string);
        endDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDate;
      }
    }

    // Фільтр за номером авто
    if (licensePlate) {
      query.licensePlate = { $regex: licensePlate, $options: 'i' };
    }

    const entries = await Entry.find(query)
      .populate('vehicle', 'licensePlate brand model owner')
      .populate('processedBy', 'username fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Entry.countDocuments(query);

    res.json({
      entries,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        hasNext: skip + limitNum < total,
        hasPrev: pageNum > 1
      },
      filters: {
        status: status || 'all',
        dateFrom,
        dateTo,
        licensePlate
      }
    });
  } catch (error) {
    console.error('Get entries error:', error);
    res.status(500).json({ error: 'Помилка отримання записів проїздів' });
  }
});

// Отримання статистики (кількість автомобілів на території зараз)
router.get('/stats/current', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Знайти всі автомобілі, які зараз на території (останній запис - вїзд)
    const pipeline: any[] = [
      {
        $sort: { vehicle: 1, createdAt: -1 }
      },
      {
        $group: {
          _id: "$vehicle",
          lastEntry: { $first: "$$ROOT" }
        }
      },
      {
        $match: {
          "lastEntry.status": "entered"
        }
      },
      {
        $lookup: {
          from: "vehicles",
          localField: "_id",
          foreignField: "_id",
          as: "vehicleInfo"
        }
      },
      {
        $unwind: "$vehicleInfo"
      },
      {
        $project: {
          _id: "$lastEntry._id",
          vehicle: "$vehicleInfo",
          entryTime: "$lastEntry.entryTime",
          processedBy: "$lastEntry.processedBy",
          createdAt: "$lastEntry.createdAt"
        }
      }
    ];

    const currentVehicles = await Entry.aggregate(pipeline);
    
    // Populate processedBy field
    await Entry.populate(currentVehicles, {
      path: 'processedBy',
      select: 'username fullName'
    });

    res.json({
      message: 'Автомобілі зараз на території',
      count: currentVehicles.length,
      vehicles: currentVehicles
    });
  } catch (error) {
    console.error('Get current stats error:', error);
    res.status(500).json({ error: 'Помилка отримання статистики' });
  }
});

// Отримання історії в'їздів/виїздів для конкретного автомобіля
router.get('/history/:licensePlate', authenticateToken, requireRole(['unit_officer', 'kpp_officer']), async (req: AuthRequest, res) => {
  try {
    const { licensePlate } = req.params;
    const upperPlate = licensePlate.toUpperCase();

    // Знаходимо автомобіль
    const vehicle = await Vehicle.findOne({ 
      licensePlate: upperPlate 
    });

    if (!vehicle) {
      return res.status(404).json({ 
        error: 'Автомобіль не знайдено в базі даних' 
      });
    }

    // Отримуємо всю історію в'їздів/виїздів для цього автомобіля
    const entries = await Entry.find({ 
      vehicle: vehicle._id 
    })
    .populate('processedBy', 'username fullName')
    .sort({ createdAt: -1 }); // Сортуємо за датою (найновіші спочатку)

    // Форматуємо дані для фронтенду
    const formattedEntries = entries.map(entry => ({
      _id: entry._id,
      timestamp: entry.createdAt,
      action: entry.status === 'entered' ? 'entry' : 'exit',
      officerName: (entry.processedBy as any)?.fullName || (entry.processedBy as any)?.username || 'Невідомий'
    }));

    res.json(formattedEntries);
  } catch (error) {
    console.error('Get vehicle history error:', error);
    res.status(500).json({ error: 'Помилка отримання історії автомобіля' });
  }
});

export default router;