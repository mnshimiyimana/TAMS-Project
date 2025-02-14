import Insights from "../models/insightsModel.js";

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
