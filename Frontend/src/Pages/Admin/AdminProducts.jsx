import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaSearch, FaPlus, FaEdit, FaTrash, FaTimes, FaBox, 
  FaUpload, FaImage, FaStar, FaRegStar, FaWarehouse
} from "react-icons/fa";
import { productAPI, categoryAPI, brandAPI } from "../../services/api";
import { useToast } from "../../Component/Toast";
import AdminSidebar from "./AdminSidebar";

const API_BASE = "http://localhost:5000";

const AdminProducts = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  
  // Stock Modal State
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockProduct, setStockProduct] = useState(null);
  const [stockQuantity, setStockQuantity] = useState("");
  const [stockAction, setStockAction] = useState("add"); // 'add' or 'set'
  const [updatingStock, setUpdatingStock] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock_quantity: "",
    warranty_months: "",
    category_id: "",
    brand_id: "",
    status: "active"
  });

  useEffect(() => {
    checkAdminAccess();
    fetchData();
  }, []);

  const checkAdminAccess = () => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    if (user.role !== "admin") {
      navigate("/login");
    }
  };

  const fetchData = async () => {
    try {
      const [prodRes, catRes, brandRes] = await Promise.all([
        productAPI.getAll(),
        categoryAPI.getAll(),
        brandAPI.getAll()
      ]);
      if (prodRes.data) setProducts(prodRes.data);
      else if (Array.isArray(prodRes)) setProducts(prodRes);
      if (catRes.data) setCategories(catRes.data);
      else if (Array.isArray(catRes)) setCategories(catRes);
      if (brandRes.data) setBrands(brandRes.data);
      else if (Array.isArray(brandRes)) setBrands(brandRes);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  // Process files
  const handleFiles = (files) => {
    const validFiles = [];
    const previews = [...imagePreviews];
    
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        validFiles.push(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          previews.push({ url: e.target.result, file, isNew: true });
          setImagePreviews([...previews]);
        };
        reader.readAsDataURL(file);
      }
    });
    
    setImageFiles([...imageFiles, ...validFiles]);
  };

  // Remove preview image
  const removePreview = (index) => {
    const newPreviews = [...imagePreviews];
    const newFiles = [...imageFiles];
    
    if (imagePreviews[index].isNew) {
      const fileIndex = newFiles.indexOf(imagePreviews[index].file);
      if (fileIndex > -1) newFiles.splice(fileIndex, 1);
    }
    
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
    setImageFiles(newFiles);
  };

  // Delete existing image
  const handleDeleteExistingImage = async (imageId) => {
    if (!window.confirm("Delete this image?")) return;
    
    try {
      await productAPI.deleteImage(selectedProduct.id, imageId);
      setExistingImages(existingImages.filter(img => img.id !== imageId));
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  // Set primary image
  const handleSetPrimary = async (imageId) => {
    try {
      await productAPI.setPrimaryImage(selectedProduct.id, imageId);
      setExistingImages(existingImages.map(img => ({
        ...img,
        isPrimary: img.id === imageId
      })));
    } catch (error) {
      console.error("Error setting primary:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("stock_quantity", formData.stock_quantity || 0);
      data.append("warranty_months", formData.warranty_months || 0);
      data.append("category_id", formData.category_id);
      data.append("brand_id", formData.brand_id);
      data.append("status", formData.status);
      
      // Add image files
      imageFiles.forEach((file) => {
        data.append("images", file);
      });
      
      if (editMode) {
        await productAPI.update(selectedProduct.id, data);
      } else {
        await productAPI.create(data);
      }
      
      fetchData();
      setShowModal(false);
      resetForm();
      toast.success(editMode ? "Product updated successfully!" : "Product created successfully!");
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productAPI.delete(id);
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  // Open Stock Modal
  const openStockModal = (product) => {
    setStockProduct(product);
    setStockQuantity("");
    setStockAction("add");
    setShowStockModal(true);
  };

  // Handle Stock Update
  const handleStockUpdate = async () => {
    if (!stockQuantity || isNaN(stockQuantity)) {
      toast.warning("Please enter a valid quantity");
      return;
    }
    
    setUpdatingStock(true);
    try {
      await productAPI.updateStock(stockProduct.id, parseInt(stockQuantity), stockAction);
      
      // Update local state
      setProducts(products.map(p => {
        if (p.id === stockProduct.id) {
          const newStock = stockAction === 'add' 
            ? p.stock_quantity + parseInt(stockQuantity)
            : parseInt(stockQuantity);
          return { ...p, stock_quantity: newStock };
        }
        return p;
      }));
      
      setShowStockModal(false);
      toast.success("Stock updated successfully!");
    } catch (error) {
      console.error("Error updating stock:", error);
      toast.error("Failed to update stock: " + error.message);
    } finally {
      setUpdatingStock(false);
    }
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      stock_quantity: product.stock_quantity || 0,
      warranty_months: product.warranty_months || 0,
      category_id: product.category_id || "",
      brand_id: product.brand_id || "",
      status: product.status || "active"
    });
    setExistingImages(product.images || []);
    setImageFiles([]);
    setImagePreviews([]);
    setEditMode(true);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      stock_quantity: "",
      warranty_months: "",
      category_id: "",
      brand_id: "",
      status: "active"
    });
    setSelectedProduct(null);
    setEditMode(false);
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${API_BASE}${url}`;
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <AdminSidebar active="Products" />
      
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Product Management</h1>
            <p className="text-gray-500 mt-2">Manage your product catalog</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <FaPlus /> Add Product
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <p className="text-gray-500 text-sm">Total Products</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{products.length}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <p className="text-gray-500 text-sm">In Stock</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {products.filter(p => p.stock_quantity > 0).length}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <p className="text-gray-500 text-sm">Out of Stock</p>
            <p className="text-3xl font-bold text-red-600 mt-1">
              {products.filter(p => !p.stock_quantity || p.stock_quantity === 0).length}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <p className="text-gray-500 text-sm">Categories</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{categories.length}</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="relative max-w-md">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    <FaBox className="mx-auto text-4xl mb-2 text-gray-300" />
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {product.image_url || (product.images && product.images[0]) ? (
                            <img 
                              src={getImageUrl(product.image_url || product.images[0]?.imageUrl)} 
                              alt={product.name} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <FaBox className="text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{product.Category?.name || '-'}</td>
                    <td className="px-6 py-4">{product.Brand?.name || '-'}</td>
                    <td className="px-6 py-4 font-medium">Rs. {parseFloat(product.price).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.stock_quantity > 10 ? 'bg-green-100 text-green-600' :
                        product.stock_quantity > 0 ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {product.stock_quantity || 0} units
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {product.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openStockModal(product)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                          title="Update Stock"
                        >
                          <FaWarehouse />
                        </button>
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                          title="Edit Product"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                          title="Delete Product"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold">{editMode ? 'Edit' : 'Add'} Product</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                  <FaTimes size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Existing Images (Edit Mode) */}
                {editMode && existingImages.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Images</label>
                    <div className="flex flex-wrap gap-3">
                      {existingImages.map((img) => (
                        <div key={img.id} className="relative group">
                          <img 
                            src={getImageUrl(img.imageUrl)} 
                            alt="Product" 
                            className={`w-20 h-20 object-cover rounded-lg border-2 ${
                              img.isPrimary ? 'border-yellow-400' : 'border-gray-200'
                            }`}
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(img.id)}
                              className="p-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                              title="Set as primary"
                            >
                              {img.isPrimary ? <FaStar size={12} /> : <FaRegStar size={12} />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteExistingImage(img.id)}
                              className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                              title="Delete"
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>
                          {img.isPrimary && (
                            <span className="absolute -top-1 -right-1 bg-yellow-400 text-xs px-1 rounded">★</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {editMode ? 'Add More Images' : 'Product Images'}
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-input').click()}
                  >
                    <FaUpload className="mx-auto text-3xl text-gray-400 mb-2" />
                    <p className="text-gray-600">Drag & drop images here or click to browse</p>
                    <p className="text-sm text-gray-400 mt-1">Supports: JPG, PNG, GIF, WebP (Max 5MB each)</p>
                    <input
                      id="file-input"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  {/* New Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-3">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={preview.url} 
                            alt="Preview" 
                            className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removePreview(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs.) *</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warranty (months)</label>
                    <input
                      type="number"
                      value={formData.warranty_months}
                      onChange={(e) => setFormData({ ...formData, warranty_months: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
                    <select
                      value={formData.brand_id}
                      onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select brand</option>
                      {brands.map(brand => (
                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="discontinued">Discontinued</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>{editMode ? 'Update' : 'Add'} Product</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stock Update Modal */}
        {showStockModal && stockProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Update Stock</h2>
                <button 
                  onClick={() => setShowStockModal(false)} 
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {/* Product Info */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                  {stockProduct.image_url ? (
                    <img 
                      src={getImageUrl(stockProduct.image_url)} 
                      alt={stockProduct.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaBox className="text-gray-400 text-xl" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{stockProduct.name}</p>
                  <p className="text-sm text-gray-500">
                    Current Stock: <span className={`font-medium ${
                      stockProduct.stock_quantity > 10 ? 'text-green-600' :
                      stockProduct.stock_quantity > 0 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>{stockProduct.stock_quantity || 0} units</span>
                  </p>
                </div>
              </div>

              {/* Action Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="stockAction"
                      value="add"
                      checked={stockAction === "add"}
                      onChange={(e) => setStockAction(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">Add to stock</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="stockAction"
                      value="set"
                      checked={stockAction === "set"}
                      onChange={(e) => setStockAction(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">Set stock to</span>
                  </label>
                </div>
              </div>

              {/* Quantity Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {stockAction === "add" ? "Quantity to Add" : "New Stock Quantity"}
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  placeholder={stockAction === "add" ? "Enter quantity to add" : "Enter new stock quantity"}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {stockAction === "add" && stockQuantity && (
                  <p className="text-sm text-gray-500 mt-2">
                    New stock will be: <span className="font-medium text-green-600">
                      {(stockProduct.stock_quantity || 0) + parseInt(stockQuantity || 0)} units
                    </span>
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowStockModal(false)}
                  className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50 font-medium"
                  disabled={updatingStock}
                >
                  Cancel
                </button>
                <button
                  onClick={handleStockUpdate}
                  disabled={updatingStock || !stockQuantity}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                >
                  {updatingStock ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <FaWarehouse />
                      Update Stock
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminProducts;
