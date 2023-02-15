import React from "react";
import Table from "react-bootstrap/Table";
import { useState } from "react";
function EmailTable() {
  
             

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Date</th>
          <th>From</th>
          <th>To</th>
          <th>Subject</th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody id="result"></tbody>
    </Table>
  );
}

export default EmailTable;
