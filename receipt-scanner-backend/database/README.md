# Banco de Dados PostgreSQL

## Configuração no DBeaver

1. **Criar o banco de dados**
   - No DBeaver: botão direito em PostgreSQL → Create Database
   - Nome: `receipt_scanner` (ou outro de sua preferência)

2. **Executar a migração**
   - Abra o arquivo `migrations/001_initial_schema.sql`
   - Execute o script no banco criado (Execute SQL Script ou Ctrl+Enter em cada bloco)

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
