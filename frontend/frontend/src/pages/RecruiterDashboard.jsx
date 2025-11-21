import React from "react";
import "../DashBoardTable.css";

const RecruiterDashboard = () => {
  const data = [
    { id: 1, name: "John Doe", skill: "Tutoring", price: "$20/hr" },
    { id: 2, name: "Sarah Khan", skill: "Logo Design", price: "$50" },
  ];

  return (
    <div className="dashboard-table-container">
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Skill</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td>{row.skill}</td>
              <td>{row.price}</td>
              <td>
                <button className="action-btn edit-btn">Edit</button>
                <button className="action-btn delete-btn">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecruiterDashboard;
