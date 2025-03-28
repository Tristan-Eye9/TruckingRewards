"use client";
import { useState } from "react";

export default function Home() {
  const [isEditing, setIsEditing] = useState(false);
  const [descriptions, setDescriptions] = useState([
    "This is the product description. It provides an overview of the product’s features, benefits, and key details.",
  ]);

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const addTextBox = () => {
    setDescriptions([...descriptions, "New description text..."]);
  };

  const removeTextBox = (index: number) => {
    setDescriptions(descriptions.filter((_, i) => i !== index));
  };

  const updateDescription = (index: number, value: string) => {
    const newDescriptions = [...descriptions];
    newDescriptions[index] = value;
    setDescriptions(newDescriptions);
  };

  return (
    <div>
      <title>Product Information</title>

      {/* Navigation Bar */}
      <div className="navbar">
        <div className="nav-buttons">
          <button>Home</button>
          <button>Catalog</button>
          <button>Points</button>
          <button>More</button>
        </div>
        <button className="edit-button" onClick={toggleEditMode}>
          {isEditing ? "Save" : "Edit"}
        </button>
      </div>

      <div className="container">
        {/* Sidebar */}
        <div className="sidebar">
          <h3><u>Project Details</u></h3>
          <p><b>Team Number:</b> <span>22</span></p>
          <p><b>Sprint Number:</b> <span>2</span></p>
          <p><b>Release Date:</b> <span>February 6, 2025</span></p>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <h1 className="product-name">Product Name</h1>

          <div id="description-container">
            {descriptions.map((desc, index) => (
              <div key={index} className={`product-description ${isEditing ? "editable" : ""}`}>
                {isEditing && (
                  <button className="remove-btn" onClick={() => removeTextBox(index)}>X</button>
                )}
                {isEditing ? (
                  <textarea
                    value={desc}
                    onChange={(e) => updateDescription(index, e.target.value)}
                    className="editable-content"
                  />
                ) : (
                  <p className="editable-content">{desc}</p>
                )}
              </div>
            ))}
          </div>

          {isEditing && (
            <div className="action-buttons">
              <button onClick={addTextBox}>Add Text Box</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
