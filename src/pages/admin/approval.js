import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import '../../styles/approval.css';

function ApprovalRequests() {
  const [requests, setRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('http://localhost:3001/veterinarianRequests');
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load approval requests');
    }
  };

  const handleAction = async (id, action) => {
    try {
      // Get the vet request data
      const request = requests.find(req => req.id === id);
      
      if (action === 'accept') {
        // Add to veterinarians collection
        const vetResponse = await fetch('http://localhost:3001/veterinarians', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...request,
            status: 'approved'
          })
        });

        if (!vetResponse.ok) throw new Error('Failed to add veterinarian');
      }

      // Update request status
      const updateResponse = await fetch(`http://localhost:3001/veterinarianRequests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action === 'accept' ? 'approved' : 'declined' })
      });

      if (!updateResponse.ok) throw new Error('Failed to update request');

      toast.success(`Request ${action === 'accept' ? 'approved' : 'declined'} successfully`);
      fetchRequests(); // Refresh the list
    } catch (error) {
      console.error('Error:', error);
      toast.error(`Failed to ${action} request`);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = requests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(requests.length / itemsPerPage);

  return (
    <div className="approval-container">
      <div className="table-container">
        <table className="approval-table">
          <thead>
            <tr>
              <th>Vet ID</th>
              <th>Fullname</th>
              <th>Clinic Name</th>
              <th>Address</th>
              <th>Documents</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((request) => (
              <tr key={request.id}>
                <td>{request.id}</td>
                <td>{request.fullName}</td>
                <td>{request.clinic.name}</td>
                <td>{`${request.clinic.address.street}, ${request.clinic.address.city}`}</td>
                <td>
                  <button className="view-btn" onClick={() => window.open(request.document)}>
                    View
                  </button>
                </td>
                <td className="action-buttons">
                  <button
                    className="accept-btn"
                    onClick={() => handleAction(request.id, 'accept')}
                  >
                    Accept
                  </button>
                  <button
                    className="decline-btn"
                    onClick={() => handleAction(request.id, 'decline')}
                  >
                    Decline
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <div className="items-per-page">
          Show on page: 
          <select 
            value={itemsPerPage} 
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="page-controls">
          Page:
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            &lt;
          </button>
          <span>{currentPage}</span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}

export default ApprovalRequests;
