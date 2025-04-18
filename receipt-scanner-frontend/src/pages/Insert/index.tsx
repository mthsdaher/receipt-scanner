import React from 'react';
import Layout from '@components/Layout';
import { useInsertReceiptController } from './controller';
import { styles } from './styles';

const InsertReceipt: React.FC = () => {
  const {
    file,
    parsedData,
    loading,
    saved,
    handleFileChange,
    handleUpload,
    handleSave,
    userId,
  } = useInsertReceiptController();

  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>Insert Receipt</h1>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className={styles.input}
        />

        <button
          onClick={handleUpload}
          className={styles.button}
          disabled={!file || loading}
        >
          {loading ? 'Processing...' : 'Upload & Extract'}
        </button>

        {parsedData && (
          <div className={styles.section}>
            <h2 className={styles.subtitle}>Extracted Data</h2>
            <div className={styles.dataItem}>
              <p><strong>Company:</strong> {parsedData.company}</p>
              <p><strong>Address:</strong> {parsedData.address}</p>
              <p><strong>Subtotal:</strong> ${parsedData.subtotal}</p>
              <p><strong>Tax:</strong> ${parsedData.tax}</p>
              <p><strong>Total:</strong> ${parsedData.total}</p>
              <p><strong>Date:</strong> {parsedData.date}</p>
              <p><strong>Time:</strong> {parsedData.time}</p>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold">Items:</h3>
              <ul className={styles.list}>
                {parsedData.items?.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <button
              onClick={handleSave}
              className={styles.saveButton}
              disabled={!userId}
            >
              Save to Database
            </button>

            {saved && (
              <p className={styles.successMessage}>
                Receipt saved successfully!
              </p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default InsertReceipt;
