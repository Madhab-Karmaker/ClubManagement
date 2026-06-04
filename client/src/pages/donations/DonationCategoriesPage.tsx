import React, { useState, useEffect } from "react";
import apiClient from "../../api/apiClient";

interface DonationCategory {
  id: number;
  categoryName: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

const DonationCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<DonationCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    categoryName: "",
    description: "",
    isActive: true,
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get("/api/donation-categories");
      setCategories(response.data);
    } catch (err) {
      setError("Failed to load donation categories. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitLoading(true);
      if (editingId) {
        await apiClient.put(`/api/donation-categories/${editingId}`, formData);
      } else {
        await apiClient.post("/api/donation-categories", formData);
      }
      await fetchCategories();
      resetForm();
    } catch (err) {
      setError("Failed to save category. Please try again.");
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeleteId(id);
      await apiClient.delete(`/api/donation-categories/${id}`);
      await fetchCategories();
    } catch (err) {
      setError("Failed to delete category. Please try again.");
      console.error(err);
    } finally {
      setDeleteId(null);
    }
  };

  const handleEdit = (category: DonationCategory) => {
    setFormData({
      categoryName: category.categoryName,
      description: category.description,
      isActive: category.isActive,
    });
    setEditingId(category.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setFormData({ categoryName: "", description: "", isActive: true });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="donation-categories-page">
      {/* Header */}
      <div className="donation-categories-header">
        <div className="donation-categories-title">
          <h1>Donation Categories</h1>
          <p>Manage and organize donation categories for your club</p>
        </div>
        {!showForm && (
          <button
            className="btn-primary-gradient"
            onClick={() => setShowForm(true)}
          >
            <span>+</span> Add Category
          </button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="error-banner">
          <div className="error-banner-content">
            <span className="error-icon">⚠️</span>
            <div>
              <p className="error-title">Something went wrong</p>
              <p className="error-message">{error}</p>
            </div>
            <button
              className="error-banner-close"
              onClick={() => setError(null)}
            >
              ✕
            </button>
          </div>
          <button className="error-banner-retry" onClick={fetchCategories}>
            Retry
          </button>
        </div>
      )}

      {/* Form Section */}
      {showForm && (
        <div className="form-card">
          <div className="form-card-header">
            <h2>{editingId ? "Edit Category" : "Create New Category"}</h2>
            <button
              className="form-close-btn"
              onClick={resetForm}
              aria-label="Close form"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleSubmit} className="modern-form">
            <div className="form-group">
              <label htmlFor="categoryName">Category Name</label>
              <input
                id="categoryName"
                type="text"
                required
                value={formData.categoryName}
                onChange={(e) =>
                  setFormData({ ...formData, categoryName: e.target.value })
                }
                placeholder="e.g., Annual Fundraiser, Scholarship Fund"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description (Optional)</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe the purpose of this category..."
                rows={3}
                className="form-textarea"
              />
            </div>

            <div className="form-group form-group-checkbox">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="form-checkbox"
                />
                <span>Mark as active</span>
              </label>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-success"
                disabled={submitLoading}
              >
                {submitLoading ? "Saving..." : `${editingId ? "Update" : "Create"} Category`}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={resetForm}
                disabled={submitLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Content Section */}
      {loading ? (
        <div className="loading-skeleton">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-line skeleton-line-title" />
              <div className="skeleton-line skeleton-line-text" />
              <div className="skeleton-line skeleton-line-text" style={{ width: "70%" }} />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-state-icon">🏷️</div>
          <h3>No donation categories yet</h3>
          <p>Create your first donation category to organize contributions</p>
          <button
            className="btn-primary-gradient"
            onClick={() => setShowForm(true)}
          >
            Create Category
          </button>
        </div>
      ) : (
        <div className="categories-grid">
          {categories.map((category) => (
            <div key={category.id} className="category-card">
              <div className="category-card-header">
                <div className="category-header-content">
                  <h3>{category.categoryName}</h3>
                  <span
                    className={`status-badge ${
                      category.isActive ? "status-active" : "status-inactive"
                    }`}
                  >
                    {category.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="category-card-body">
                <p className="category-description">
                  {category.description || "No description provided"}
                </p>
              </div>
              <div className="category-card-footer">
                <button
                  className="btn-edit"
                  onClick={() => handleEdit(category)}
                >
                  Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(category.id)}
                  disabled={deleteId === category.id}
                >
                  {deleteId === category.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonationCategoriesPage;
