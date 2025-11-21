import React, { useState } from "react";

const ListingForm = ({ onSubmit }) => {
  const [values, setValues] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    location: "",
    email: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!values.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!values.description.trim()) {
      newErrors.description = "Description is required";
    } else if (values.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (!values.price) {
      newErrors.price = "Price is required";
    } else if (isNaN(values.price) || Number(values.price) <= 0) {
      newErrors.price = "Price must be a positive number";
    }

    if (!values.category.trim()) {
      newErrors.category = "Category is required";
    }

    if (!values.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!values.email.trim()) {
      newErrors.email = "Contact email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      newErrors.email = "Enter a valid email address";
    }

    setErrors(newErrors);

    // form is valid if no keys in errors
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    // pass data up or send to API
    if (onSubmit) {
      onSubmit(values);
    }

    // optional: reset
    // setValues({ title: "", description: "", price: "", category: "", location: "", email: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="listing-form">
      <div className="form-row">
        <label>Title</label>
        <input
          name="title"
          value={values.title}
          onChange={handleChange}
          placeholder="e.g. Math Tutoring, Logo Design..."
        />
        {errors.title && <p className="error-text">{errors.title}</p>}
      </div>

      <div className="form-row">
        <label>Description</label>
        <textarea
          name="description"
          value={values.description}
          onChange={handleChange}
          placeholder="Briefly describe the service..."
        />
        {errors.description && <p className="error-text">{errors.description}</p>}
      </div>

      <div className="form-row">
        <label>Price</label>
        <input
          name="price"
          value={values.price}
          onChange={handleChange}
          placeholder="e.g. 20 (for $20/hr)"
        />
        {errors.price && <p className="error-text">{errors.price}</p>}
      </div>

      <div className="form-row">
        <label>Category</label>
        <input
          name="category"
          value={values.category}
          onChange={handleChange}
          placeholder="Tutoring, Design, Home Help..."
        />
        {errors.category && <p className="error-text">{errors.category}</p>}
      </div>

      <div className="form-row">
        <label>Location</label>
        <input
          name="location"
          value={values.location}
          onChange={handleChange}
          placeholder="City / Neighborhood"
        />
        {errors.location && <p className="error-text">{errors.location}</p>}
      </div>

      <div className="form-row">
        <label>Contact Email</label>
        <input
          name="email"
          value={values.email}
          onChange={handleChange}
          placeholder="name@example.com"
        />
        {errors.email && <p className="error-text">{errors.email}</p>}
      </div>

      <button type="submit" className="submit-btn">
        Create Listing
      </button>
    </form>
  );
};

export default ListingForm;
