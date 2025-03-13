import Insights from "../models/insightsModel.js";
import Package from "../models/packageModel.js";
import Shift from "../models/shiftModel.js";

export const createInsight = async (req, res) => {
  try {
    const insight = new Insights(req.body);
    await insight.save();
    res.status(201).json(insight);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getInsights = async (req, res) => {
  try {
    const insights = await Insights.find();
    res.status(200).json(insights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getInsightById = async (req, res) => {
  try {
    const insight = await Insights.findById(req.params.id);
    if (!insight) {
      return res.status(404).json({ message: "Insight not found" });
    }
    res.status(200).json(insight);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateInsight = async (req, res) => {
  try {
    const insight = await Insights.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!insight) {
      return res.status(404).json({ message: "Insight not found" });
    }
    res.status(200).json(insight);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteInsight = async (req, res) => {
  try {
    const insight = await Insights.findByIdAndDelete(req.params.id);
    if (!insight) {
      return res.status(404).json({ message: "Insight not found" });
    }
    res.status(200).json({ message: "Insight deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const generatePackageInsights = async (req, res) => {
  try {
    const { agencyId, startDate, endDate } = req.query;

    if (!agencyId) {
      return res.status(400).json({ message: "Agency ID is required" });
    }

    const query = { agencyName: req.userAgency };

    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const packages = await Package.find(query);

    const totalPackages = packages.length;
    const deliveredPackages = packages.filter(
      (pkg) => pkg.status === "Delivered"
    ).length;
    const successRate =
      totalPackages > 0 ? (deliveredPackages / totalPackages) * 100 : 0;

    const routeCounts = {};
    packages.forEach((pkg) => {
      const route = `${pkg.pickupLocation}-${pkg.deliveryLocation}`;
      routeCounts[route] = (routeCounts[route] || 0) + 1;
    });

    const hotRoutes = Object.entries(routeCounts)
      .map(([route, count]) => {
        const [origin, destination] = route.split("-");
        return { origin, destination, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    let totalTransitTime = 0;
    let packagesWithTransitTime = 0;

    packages.forEach((pkg) => {
      if (pkg.status === "Delivered" && pkg.deliveredAt && pkg.createdAt) {
        const deliveredAt = new Date(pkg.deliveredAt);
        const createdAt = new Date(pkg.createdAt);
        const transitTime = (deliveredAt - createdAt) / (1000 * 60 * 60); // in hours
        totalTransitTime += transitTime;
        packagesWithTransitTime++;
      }
    });

    const averageTransitTime =
      packagesWithTransitTime > 0
        ? totalTransitTime / packagesWithTransitTime
        : 0;

    const packageAnalytics = {
      deliveryEfficiency: successRate,
      packageVolume: totalPackages,
      successRate: successRate,
      averageTransitTime: averageTransitTime,
      hotRoutes: hotRoutes,
      packageTrends: [], 
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let insight = await Insights.findOne({
      agencyId,
      reportDate: { $gte: today },
    });

    if (insight) {
      insight.packageAnalytics = packageAnalytics;
      await insight.save();
    } else {
      insight = new Insights({
        agencyId,
        reportDate: new Date(),
        reportDetails: "Package insights",
        packageAnalytics,
      });
      await insight.save();
    }

    res.status(200).json({ packageAnalytics });
  } catch (error) {
    console.error("Error generating package insights:", error);
    res.status(500).json({ error: error.message });
  }
};

export const generateFineInsights = async (req, res) => {
  try {
    const { agencyId } = req.query;

    if (!agencyId) {
      return res.status(400).json({ message: "Agency ID is required" });
    }

    const sampleFineData = {
      totalAmount: 245000,
      unpaidAmount: 78500,
      finesByCategory: [
        { category: "Speed", count: 23, amount: 115000 },
        { category: "Parking", count: 12, amount: 48000 },
        { category: "Documentation", count: 9, amount: 36000 },
        { category: "Vehicle Condition", count: 7, amount: 28000 },
        { category: "Route Violation", count: 6, amount: 18000 },
      ],
      finesByDriver: [
        { driverName: "John Doe", count: 5, amount: 25000, status: "Unpaid" },
        { driverName: "Jane Smith", count: 4, amount: 20000, status: "Paid" },
        {
          driverName: "Bob Johnson",
          count: 3,
          amount: 15000,
          status: "Disputed",
        },
      ],
      recentFines: [
        {
          date: new Date("2025-02-15"),
          driverName: "John Doe",
          vehiclePlate: "ABC123",
          amount: 5000,
          reason: "Speeding - 75 in 60 zone",
          location: "Main Highway, KM 45",
          status: "Unpaid",
        },
        {
          date: new Date("2025-02-10"),
          driverName: "Jane Smith",
          vehiclePlate: "XYZ789",
          amount: 3000,
          reason: "Improper parking",
          location: "Downtown Bus Terminal",
          status: "Paid",
        },
        {
          date: new Date("2025-02-05"),
          driverName: "Bob Johnson",
          vehiclePlate: "DEF456",
          amount: 8000,
          reason: "Missing documentation",
          location: "Border checkpoint",
          status: "Disputed",
        },
      ],
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let insight = await Insights.findOne({
      agencyId,
      reportDate: { $gte: today },
    });

    if (insight) {
      insight.finesAnalytics = sampleFineData;
      await insight.save();
    } else {
      insight = new Insights({
        agencyId,
        reportDate: new Date(),
        reportDetails: "Fines insights",
        finesAnalytics: sampleFineData,
      });
      await insight.save();
    }

    res.status(200).json({ finesAnalytics: sampleFineData });
  } catch (error) {
    console.error("Error generating fine insights:", error);
    res.status(500).json({ error: error.message });
  }
};
