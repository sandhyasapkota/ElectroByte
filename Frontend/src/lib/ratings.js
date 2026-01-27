import { feedbackAPI } from "../services/api";

const normalizeId = (value) => {
  if (value === null || value === undefined) return null;
  return String(value);
};

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export const fetchRatingsForProducts = async (products) => {
  const ids = products
    .map((product) => normalizeId(product?.id))
    .filter((id) => id);

  if (ids.length === 0) {
    return new Map();
  }

  const results = await Promise.all(
    ids.map(async (id) => {
      try {
        const response = await feedbackAPI.getProductRatings(id);
        const data = response?.data || {};
        return {
          productId: id,
          averageRating: toNumber(data.averageRating),
          totalReviews: toNumber(data.totalReviews),
        };
      } catch (error) {
        return { productId: id, averageRating: 0, totalReviews: 0 };
      }
    })
  );

  return new Map(results.map((item) => [item.productId, item]));
};

export const getRatingData = (ratingMap, productId) => {
  const key = normalizeId(productId);
  if (!key) {
    return { averageRating: 0, totalReviews: 0 };
  }
  return ratingMap.get(key) || { averageRating: 0, totalReviews: 0 };
};
