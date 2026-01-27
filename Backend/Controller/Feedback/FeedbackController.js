import { Feedback, Product, Order, Repair, User } from "../../Model/index.js";
import { Sequelize } from "sequelize";

// Create feedback
const createFeedback = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const { type, referenceId, rating, comment } = req.body;
    
    if (!type || !referenceId || !rating) {
      return res.status(400).json({ error: "Type, reference ID and rating are required" });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }
    
    // Check if user already gave feedback
    const existing = await Feedback.findOne({ where: { userId, type, referenceId } });
    if (existing) {
      return res.status(400).json({ error: "You have already given feedback" });
    }
    
    const feedback = await Feedback.create({ userId, type, referenceId, rating, comment });
    res.status(201).json({ data: feedback, message: "Feedback submitted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to submit feedback" });
  }
};

// Get product ratings with user info
const getProductRatings = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const feedbacks = await Feedback.findAll({
      where: { type: 'product', referenceId: productId },
      include: [
        { 
          model: User, 
          attributes: ['id', 'username', 'profileImage'] 
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    const avgRating = feedbacks.length > 0
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
      : 0;
    
    res.status(200).json({ 
      data: { 
        feedbacks, 
        averageRating: avgRating.toFixed(1),
        totalReviews: feedbacks.length 
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch ratings" });
  }
};

// Get user's own reviews
const getMyReviews = async (req, res) => {
  try {
    const userId = req.user.user.id;
    
    const feedbacks = await Feedback.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
    
    // Enrich with product/order details
    const enrichedFeedbacks = await Promise.all(feedbacks.map(async (feedback) => {
      const feedbackData = feedback.toJSON();
      
      if (feedback.type === 'product') {
        const product = await Product.findByPk(feedback.referenceId, {
          attributes: ['id', 'name', 'image_url']
        });
        feedbackData.product = product;
      }
      
      return feedbackData;
    }));
    
    res.status(200).json({ data: enrichedFeedbacks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch your reviews" });
  }
};

// Delete user's own review
const deleteMyReview = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const { id } = req.params;
    
    const feedback = await Feedback.findOne({ where: { id, userId } });
    
    if (!feedback) {
      return res.status(404).json({ error: "Review not found" });
    }
    
    await feedback.destroy();
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete review" });
  }
};

// Get all feedbacks (Admin)
const getAllFeedbacks = async (req, res) => {
  try {
    const { type } = req.query;
    const where = {};
    if (type) where.type = type;
    
    const feedbacks = await Feedback.findAll({
      where,
      include: [
        { model: User, attributes: ['id', 'username', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({ data: feedbacks });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch feedbacks" });
  }
};

export { createFeedback, getProductRatings, getAllFeedbacks, getMyReviews, deleteMyReview };
