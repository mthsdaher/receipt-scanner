import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const Dashboard: React.FC = () => {
  // State to manage the current mode (scan or manual input)
  const [mode, setMode] = useState<'scan' | 'manual' | null>(null);
  // State to store the captured image or manually entered receipt data
  const [receiptData, setReceiptData] = useState({
    seller: '',
    date: '',
    items: [] as string[],
    value: 0,
    taxes: 0,
    totalValue: 0,
  });
  // Reference to the webcam component
  const webcamRef = useRef<Webcam>(null);
  // State to store the captured image
  const [image, setImage] = useState<string | null>(null);

  // Handler to capture image from webcam
  const captureImage = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    setImage(imageSrc || null);
  };

  // Handler to upload the captured image to the backend
  const uploadImage = async () => {
    if (!image) return;

    try {
      // Send the image to the backend API for OCR processing
      const response = await axios.post('http://localhost:3002/api/receipts/scan', { image });
      setReceiptData(response.data);
      setImage(null); // Clear the image after successful upload
    } catch (error) {
      console.error('Error uploading receipt image:', error);
      alert('Failed to process the receipt. Please try again.');
    }
  };

  // Handler for manual input form submission
  const handleManualSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemsInput = formData.get('items')?.toString() || '';
    setReceiptData({
      seller: formData.get('seller')?.toString() || '',
      date: formData.get('date')?.toString() || '',
      items: itemsInput.split(',').map(item => item.trim()),
      value: parseFloat(formData.get('value')?.toString() || '0'),
      taxes: parseFloat(formData.get('taxes')?.toString() || '0'),
      totalValue: parseFloat(formData.get('totalValue')?.toString() || '0'),
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard! Choose an option below to add a receipt.</p>

      {/* Mode selection buttons */}
      {!mode && (
        <div>
          <button onClick={() => setMode('scan')} style={{ marginRight: '10px' }}>
            Scan Receipt
          </button>
          <button onClick={() => setMode('manual')}>
            Enter Receipt Manually
          </button>
        </div>
      )}

      {/* Scan mode */}
      {mode === 'scan' && (
        <div>
          <h2>Scan Your Receipt</h2>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={350}
            style={{ marginBottom: '10px' }}
          />
          <div>
            <button onClick={captureImage} style={{ marginRight: '10px' }}>
              Capture Photo
            </button>
            <button onClick={() => setMode(null)}>Cancel</button>
          </div>
          {image && (
            <div>
              <img src={image} alt="Captured Receipt" style={{ marginTop: '10px' }} />
              <button onClick={uploadImage} style={{ marginTop: '10px' }}>
                Upload and Process
              </button>
            </div>
          )}
        </div>
      )}

      {/* Manual input mode */}
      {mode === 'manual' && (
        <div>
          <h2>Enter Receipt Details</h2>
          <form onSubmit={handleManualSubmit}>
            <div style={{ marginBottom: '10px' }}>
              <label>Seller: </label>
              <input type="text" name="seller" required />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Date: </label>
              <input type="date" name="date" required />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Items (comma-separated): </label>
              <input type="text" name="items" required />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Value: </label>
              <input type="number" name="value" step="0.01" required />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Taxes: </label>
              <input type="number" name="taxes" step="0.01" required />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Total Value: </label>
              <input type="number" name="totalValue" step="0.01" required />
            </div>
            <button type="submit" style={{ marginRight: '10px' }}>
              Submit
            </button>
            <button type="button" onClick={() => setMode(null)}>
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Display receipt data */}
      {receiptData.seller && (
        <div style={{ marginTop: '20px' }}>
          <h2>Receipt Data</h2>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Seller</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Date</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Items</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Value</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Taxes</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Total Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{receiptData.seller}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{receiptData.date}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{receiptData.items.join(', ')}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{receiptData.value.toFixed(2)}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{receiptData.taxes.toFixed(2)}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{receiptData.totalValue.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;