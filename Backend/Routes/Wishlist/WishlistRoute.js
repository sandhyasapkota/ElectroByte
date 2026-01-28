import express from "express";
import { 
  getWishlist, 
  addToWishlist, 
  removeFromWishlist, 
  toggleWishlist,
  checkWishlist 
} from "../../Controller/Wishlist/WishlistController.js";
import { authenticateToken } from "../../Middleware/token-middleware.js";

const router = express.Router();

router.use(authenticateToken);

// Get user's wishlist
router.get("/", getWishlist);

// Add to wishlist
router.post("/", addToWishlist);

// Toggle wishlist (add/remove)
router.post("/toggle", toggleWishlist);

// Check if product is in wishlist
router.get("/check/:productId", checkWishlist);

// Remove from wishlist
router.delete("/:productId", removeFromWishlist);

export { router as wishlistRouter };
