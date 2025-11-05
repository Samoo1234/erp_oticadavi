# 🚀 Início Rápido - Integração de Clientes

Guia prático para integrar o sistema de agendamento com o ERP em **5 minutos**.

## ✅ Checklist Rápida

- [ ] Gerar API Key
- [ ] Configurar ERP
- [ ] Testar endpoint
- [ ] (Opcional) Migrar dados existentes
- [ ] Configurar sincronização em tempo real
- [ ] Testar integração completa

---

## 1️⃣ Gerar API Key (1 min)

```bash
# Execute no terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Exemplo de saída:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

✅ Copie essa chave gerada!

---

## 2️⃣ Configurar ERP (1 min)

### Adicionar no arquivo `.env` do backend do ERP:

```env
INTEGRATION_API_KEYS=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### Reiniciar servidor:

```bash
cd backend
npm run dev
```

✅ Servidor configurado!

---

## 3️⃣ Testar Endpoint (1 min)

```bash
curl -X POST http://localhost:3000/api/v1/clients/sync \
  -H "Content-Type: application/json" \
  -H "X-API-Key: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2" \
  -d '{
    "externalId": "test-123",
    "name": "Cliente Teste",
    "phone": "(11) 99999-9999",
    "email": "teste@email.com"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Cliente criado com sucesso",
  "action": "created",
  "data": { ... }
}
```

✅ Endpoint funcionando!

---

## 4️⃣ (Opcional) Migrar Dados Existentes (5-10 min)

Se você já tem clientes no sistema de agendamento:

### Instalar dependências:
```bash
cd /caminho/do/sistema-agendamento
npm install @supabase/supabase-js node-fetch
```

### Configurar o script:
Edite `migrate-clients.js`:
```javascript
const AGENDAMENTO_SUPABASE_URL = 'https://seu-projeto.supabase.co';
const AGENDAMENTO_SUPABASE_KEY = 'sua-key-aqui';
const ERP_API_URL = 'http://localhost:3000/api/v1/clients/sync';
const ERP_API_KEY = 'a1b2c3d4...'; // Sua API Key
const DRY_RUN = true; // true = teste, false = execução real
```

### Executar teste (dry-run):
```bash
node migrate-clients.js
```

### Executar migração real:
```javascript
// Altere no arquivo:
const DRY_RUN = false;
```
```bash
node migrate-clients.js
```

✅ Dados migrados!

---

## 5️⃣ Configurar Sincronização em Tempo Real (10-15 min)

### No Supabase do sistema de agendamento:

#### Criar Edge Function:
```bash
supabase functions new sync-client-to-erp
```

#### Copiar código:
Copie o conteúdo do arquivo `edge-function-sync-client.ts` para a função criada.

#### Configurar Secrets:
No painel do Supabase: **Settings > Edge Functions > Secrets**

Adicione:
- **Nome**: `ERP_API_URL`
- **Valor**: `http://localhost:3000/api/v1/clients/sync` (ou URL de produção)

- **Nome**: `ERP_API_KEY`
- **Valor**: `a1b2c3d4...` (sua API Key)

#### Deploy:
```bash
supabase functions deploy sync-client-to-erp
```

#### Configurar Webhook:
No painel do Supabase: **Database > Webhooks > Create a new hook**

- **Name**: `sync-client-to-erp`
- **Table**: `clients`
- **Events**: Marque `INSERT` e `UPDATE`
- **Type**: `Edge Function`
- **Edge Function**: Selecione `sync-client-to-erp`

Clique em **Save**.

✅ Sincronização configurada!

---

## 6️⃣ Testar Integração Completa (2 min)

### Criar cliente no sistema de agendamento:

1. Acesse o sistema de agendamento
2. Crie um novo cliente (ou edite um existente)
3. Preencha os dados e salve

### Verificar logs da Edge Function:
```bash
supabase functions logs sync-client-to-erp --tail
```

**Saída esperada:**
```
✅ Cliente sincronizado com sucesso: João Silva { action: 'created', status: 200 }
```

### Verificar no ERP:
Acesse o painel do ERP e vá em **Clientes**. O cliente deve aparecer com:
- Nome e dados corretos
- Campo "Sistema Externo": `agendamento`

✅ Integração funcionando perfeitamente! 🎉

---

## 🎯 Resumo

✅ **API Key gerada e configurada**  
✅ **Endpoint testado e funcionando**  
✅ **Dados existentes migrados (opcional)**  
✅ **Sincronização em tempo real ativa**  
✅ **Integração completa e operacional**

---

## 🐛 Problemas?

### Cliente não sincroniza
```bash
# Verifique logs da Edge Function
supabase functions logs sync-client-to-erp

# Verifique se o webhook está ativo
# Supabase > Database > Webhooks
```

### Erro 401
```bash
# API Key incorreta, verifique:
echo $INTEGRATION_API_KEYS  # No servidor ERP
```

### Erro 400
```
# Dados obrigatórios faltando: externalId, name, phone
# Verifique se a tabela 'clients' tem esses campos
```

---

## 📚 Próximos Passos

1. **Produção**: Altere URLs de `localhost` para domínio de produção
2. **HTTPS**: Configure certificado SSL
3. **Monitoramento**: Configure alertas para falhas
4. **Rate Limiting**: Limite requisições por minuto
5. **Backup**: Implemente estratégia de backup

---

## 📖 Documentação Completa

- [Guia de Integração Completo](../INTEGRATION_GUIDE.md)
- [Exemplos de Código](./README.md)

---

**Dúvidas?** Entre em contato com a equipe de desenvolvimento.

**Última atualização**: 02/11/2025

