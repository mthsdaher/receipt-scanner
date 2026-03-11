import React, { useRef } from 'react';
import Layout from '../../components/Layout';
import { useInsertReceiptController } from './controller';
import {
  Card,
  ErrorMessage,
  Field,
  FileNameText,
  FileRow,
  FormGrid,
  HelperText,
  HiddenInput,
  LoadingStatus,
  LoadingText,
  PageContainer,
  PrimaryButton,
  SaveButton,
  SecondaryButton,
  Section,
  Subtitle,
  SuccessMessage,
  TextInput,
  Title,
} from './styles';

const InsertReceipt: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const {
    file,
    receiptForm,
    loading,
    saving,
    saved,
    error,
    handleFileChange,
    handleFieldChange,
    handleUpload,
    handleSave,
    userId,
  } = useInsertReceiptController();

  return (
    <Layout>
      <PageContainer>
        <Card>
          <Title>Insert Receipt</Title>

          <HelperText>
          Upload a receipt image for OCR, or manually fill the fields below.
          </HelperText>

          <HiddenInput
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />

          <FileRow>
            <SecondaryButton
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              Choose receipt image
            </SecondaryButton>
            <FileNameText>
            {file ? file.name : "No file selected"}
            </FileNameText>
          </FileRow>

          <PrimaryButton
            type="button"
            onClick={handleUpload}
            disabled={!file || loading}
          >
            {loading ? 'Processing OCR...' : 'Upload & Extract'}
          </PrimaryButton>

        {loading && (
          <LoadingStatus role="status" aria-live="polite">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              aria-hidden="true"
              style={{ display: "block" }}
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="#99f6e4"
                strokeWidth="3"
                fill="none"
              />
              <path
                d="M22 12a10 10 0 0 1-10 10"
                stroke="#0f766e"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 12 12"
                  to="360 12 12"
                  dur="0.9s"
                  repeatCount="indefinite"
                />
              </path>
            </svg>
            <LoadingText>
              Your receipt is being processed. Please wait...
            </LoadingText>
          </LoadingStatus>
        )}

          <Section>
            <Subtitle>Receipt Data</Subtitle>
            <FormGrid>
              <Field>
              <span>Store / Description</span>
              <TextInput
                type="text"
                value={receiptForm.store}
                onChange={handleFieldChange("store")}
                placeholder="e.g. Supermarket ABC"
              />
              </Field>

              <Field>
              <span>Total amount</span>
              <TextInput
                type="number"
                min="0"
                step="0.01"
                value={receiptForm.total}
                onChange={handleFieldChange("total")}
                placeholder="0.00"
              />
              </Field>

              <Field>
              <span>Date</span>
              <TextInput
                type="date"
                value={receiptForm.date}
                onChange={handleFieldChange("date")}
              />
              </Field>

              <Field>
              <span>Category</span>
              <TextInput
                type="text"
                value={receiptForm.category}
                onChange={handleFieldChange("category")}
                placeholder="e.g. grocery"
              />
              </Field>
            </FormGrid>

            <SaveButton
              type="button"
              onClick={handleSave}
              disabled={!userId || saving}
            >
              {saving ? "Saving..." : "Save to Database"}
            </SaveButton>

            {error && <ErrorMessage>{error}</ErrorMessage>}
          {saved && (
              <SuccessMessage>
              Receipt saved successfully.
              </SuccessMessage>
          )}
          </Section>
        </Card>
      </PageContainer>
    </Layout>
  );
};

export default InsertReceipt;
