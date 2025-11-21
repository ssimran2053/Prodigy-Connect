import React from "react";
import ListingForm from "../components/ListingForm";

const CreateListing = () => {
  const handleSubmit = (data) => {
    console.log("Validated listing:", data);
    // later: send to backend with fetch/axios
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Create New Listing</h2>
      <ListingForm onSubmit={handleSubmit} />
    </div>
  );
};

export default CreateListing;
