-- Receipt Scanner - AI Features: Embeddings and Explainability
-- Requires: PostgreSQL with pgvector extension installed
-- Install pgvector: https://github.com/pgvector/pgvector#installation
--
-- Execute this in DBeaver (or psql) after 001_initial_schema.sql

-- Enable vector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column for RAG (OpenAI text-embedding-3-small = 1536 dimensions)
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Index for similarity search (cosine distance). HNSW works on empty tables.
CREATE INDEX IF NOT EXISTS idx_receipts_embedding
ON receipts USING hnsw (embedding vector_cosine_ops);

-- Column for AI categorization reasoning (explainability)
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS categorization_reasoning TEXT;
