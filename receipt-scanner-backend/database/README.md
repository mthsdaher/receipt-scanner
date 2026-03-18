# Banco de Dados PostgreSQL

## Configuração no DBeaver

1. **Criar o banco de dados**
   - No DBeaver: botão direito em PostgreSQL → Create Database
   - Nome: `receipt_scanner` (ou outro de sua preferência)

2. **Executar as migrações** (em ordem)
   - `migrations/001_initial_schema.sql` — schema inicial
   - `migrations/002_add_embeddings.sql` — colunas para AI (embeddings, explainability)
   - `migrations/003_financial_validation.sql` — subtotal, tax, validation_status
   - `migrations/004_idempotency_and_duplicate_support.sql` — idempotency_key_hash
   - **Nota:** A migração 002 requer a extensão [pgvector](https://github.com/pgvector/pgvector#installation) no PostgreSQL

3. **Configurar a connection string no `.env.development`**
   ```
   DATABASE_URL=postgresql://usuario:senha@localhost:5432/receipt_scanner
   ```
   - Substitua `usuario`, `senha` e `5432` conforme sua configuração local

## Formato da URL de conexão

```
postgresql://[usuário]:[senha]@[host]:[porta]/[nome_do_banco]
```

Exemplo local:
```
postgresql://postgres:postgres@localhost:5432/receipt_scanner
```
