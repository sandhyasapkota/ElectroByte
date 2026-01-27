import { Address } from "../../Model/index.js";

const isValidPhone = (phone) => /^[0-9]{10,15}$/.test(phone || '');
const isValidText = (value, min, max) => typeof value === 'string' && value.trim().length >= min && value.length <= max;

// Get user's addresses
const getAddresses = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const addresses = await Address.findAll({ where: { userId } });
    res.status(200).json({ data: addresses, message: "Addresses fetched successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch addresses" });
  }
};

// Add address
const addAddress = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const { label, fullName, phone, address, city, state, zipCode, isDefault } = req.body;
    
    if (!fullName || !phone || !address || !city) {
      return res.status(400).json({ error: "Full name, phone, address and city are required" });
    }

    if (!isValidText(fullName, 2, 100)) {
      return res.status(400).json({ error: "Full name must be 2-100 characters" });
    }
    if (!isValidPhone(phone)) {
      return res.status(400).json({ error: "Phone number must be 10-15 digits" });
    }
    if (!isValidText(address, 5, 200)) {
      return res.status(400).json({ error: "Address must be 5-200 characters" });
    }
    if (!isValidText(city, 2, 100)) {
      return res.status(400).json({ error: "City must be 2-100 characters" });
    }
    if (state && !isValidText(state, 2, 100)) {
      return res.status(400).json({ error: "State must be 2-100 characters" });
    }
    if (zipCode && !/^[0-9]{5,10}$/.test(zipCode)) {
      return res.status(400).json({ error: "Postal code must be 5-10 digits" });
    }
    
    // If setting as default, unset other defaults
    if (isDefault) {
      await Address.update({ isDefault: false }, { where: { userId } });
    }
    
    const newAddress = await Address.create({
      userId, label, fullName, phone, address, city, state, zipCode, isDefault
    });
    
    res.status(201).json({ data: newAddress, message: "Address added successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to add address" });
  }
};

// Update address
const updateAddress = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const { id } = req.params;
    
    const address = await Address.findOne({ where: { id, userId } });
    if (!address) return res.status(404).json({ error: "Address not found" });

    if (req.body.fullName && !isValidText(req.body.fullName, 2, 100)) {
      return res.status(400).json({ error: "Full name must be 2-100 characters" });
    }
    if (req.body.phone && !isValidPhone(req.body.phone)) {
      return res.status(400).json({ error: "Phone number must be 10-15 digits" });
    }
    if (req.body.address && !isValidText(req.body.address, 5, 200)) {
      return res.status(400).json({ error: "Address must be 5-200 characters" });
    }
    if (req.body.city && !isValidText(req.body.city, 2, 100)) {
      return res.status(400).json({ error: "City must be 2-100 characters" });
    }
    if (req.body.state && !isValidText(req.body.state, 2, 100)) {
      return res.status(400).json({ error: "State must be 2-100 characters" });
    }
    if (req.body.zipCode && !/^[0-9]{5,10}$/.test(req.body.zipCode)) {
      return res.status(400).json({ error: "Postal code must be 5-10 digits" });
    }
    
    // If setting as default, unset other defaults
    if (req.body.isDefault) {
      await Address.update({ isDefault: false }, { where: { userId } });
    }
    
    await address.update(req.body);
    res.status(200).json({ data: address, message: "Address updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update address" });
  }
};

// Delete address
const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const { id } = req.params;
    
    const address = await Address.findOne({ where: { id, userId } });
    if (!address) return res.status(404).json({ error: "Address not found" });
    
    await address.destroy();
    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete address" });
  }
};

export { getAddresses, addAddress, updateAddress, deleteAddress };
