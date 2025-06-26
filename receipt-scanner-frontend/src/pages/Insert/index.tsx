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
              <p><strong>Store:</strong> {parsedData.store}</p>
              <p><strong>Total:</strong> ${parsedData.total.toFixed(2)}</p>
              <p><strong>Date:</strong> {parsedData.date}</p>
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
