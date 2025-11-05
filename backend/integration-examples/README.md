# Exemplos de Integração - Sistema de Agendamento

Esta pasta contém exemplos práticos de código para integrar o sistema de agendamento com o ERP da ótica.

## 📁 Arquivos

### 1. `edge-function-sync-client.ts`
**Edge Function para sincronização em tempo real**

- **Onde usar**: Sistema de Agendamento (Supabase Edge Functions)
- **Quando**: Para sincronização automática e em tempo real
- **Como funciona**: Webhook do Supabase dispara a função quando um cliente é criado/atualizado

**Deploy:**
```bash
# No diretório do sistema de agendamento
supabase functions deploy sync-client-to-erp
```

**Configuração:**
1. Adicione secrets no Supabase (Settings > Edge Functions > Secrets):
   - `ERP_API_URL`: URL do endpoint do ERP
   - `ERP_API_KEY`: Chave de autenticação
2. Configure o Database Webhook (Database > Webhooks):
   - Tabela: `clients`
   - Eventos: `INSERT`, `UPDATE`
   - Edge Function: `sync-client-to-erp`

### 2. `migrate-clients.js`
**Script de migração em lote**

- **Onde usar**: Sistema de Agendamento (executar via Node.js)
- **Quando**: Para sincronização inicial de clientes existentes
- **Como funciona**: Busca todos os clientes e envia para o ERP em lotes

**Instalação de dependências:**
```bash
npm install @supabase/supabase-js node-fetch
```

**Execução:**
```bash
# Configurar variáveis de ambiente
export AGENDAMENTO_SUPABASE_URL="https://seu-projeto.supabase.co"
export AGENDAMENTO_SUPABASE_KEY="sua-key"
export ERP_API_URL="http://localhost:3000/api/v1/clients/sync"
export ERP_API_KEY="sua-api-key"

# Executar (primeiro em modo dry-run para testar)
node migrate-clients.js
```

## 🚀 Fluxo de Implementação Recomendado

### Passo 1: Configurar o ERP
✅ Já está pronto! O endpoint `/api/v1/clients/sync` está configurado.

### Passo 2: Gerar API Key
```bash
# No terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Adicione no `.env` do ERP:
```env
INTEGRATION_API_KEYS=chave_gerada_aqui
```

### Passo 3: Testar o Endpoint
```bash
curl -X POST http://localhost:3000/api/v1/clients/sync \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sua_chave_aqui" \
  -d '{
    "externalId": "test-123",
    "name": "Cliente Teste",
    "phone": "(11) 99999-9999"
  }'
```

### Passo 4: Migrar Dados Existentes (Opcional)
Se você já tem clientes no sistema de agendamento:

1. Configure o `migrate-clients.js` com suas credenciais
2. Execute em modo dry-run (DRY_RUN = true)
3. Verifique os logs
4. Execute a migração real (DRY_RUN = false)

### Passo 5: Configurar Sincronização em Tempo Real
1. Copie o conteúdo de `edge-function-sync-client.ts`
2. No Supabase do sistema de agendamento:
   ```bash
   supabase functions new sync-client-to-erp
   # Cole o código no arquivo criado
   supabase functions deploy sync-client-to-erp
   ```
3. Configure o Database Webhook (veja instruções no arquivo)

### Passo 6: Testar
1. Crie um cliente no sistema de agendamento
2. Verifique os logs da Edge Function
3. Confirme que o cliente apareceu no ERP

## 🧪 Testando a Integração

### Teste Manual (cURL)
```bash
# Criar/Atualizar cliente via API
curl -X POST http://localhost:3000/api/v1/clients/sync \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sua_api_key" \
  -d '{
    "externalId": "uuid-do-agendamento",
    "name": "João Silva",
    "email": "joao@email.com",
    "phone": "(11) 98765-4321",
    "cpf": "123.456.789-00"
  }'
```

### Teste via Postman/Insomnia
1. **URL**: `http://localhost:3000/api/v1/clients/sync`
2. **Método**: `POST`
3. **Headers**:
   - `Content-Type`: `application/json`
   - `X-API-Key`: `sua_api_key`
4. **Body** (JSON):
   ```json
   {
     "externalId": "test-uuid",
     "name": "Cliente Teste",
     "phone": "(11) 99999-9999",
     "email": "teste@email.com"
   }
   ```

### Verificar no ERP
```sql
-- No Supabase do ERP
SELECT 
  id,
  name,
  phone,
  external_id,
  external_system,
  created_at
FROM clients
WHERE external_system = 'agendamento'
ORDER BY created_at DESC;
```

## 📊 Monitoramento

### Logs da Edge Function
```bash
# Tempo real
supabase functions logs sync-client-to-erp --tail

# Últimas execuções
supabase functions logs sync-client-to-erp
```

### Logs do ERP
Os logs do servidor Node.js mostram cada sincronização:
```
[API Integration] Request from external system at 2025-11-02T10:30:00.000Z
```

## 🔧 Customização

### Adicionar Campos Extras

**No Edge Function (`edge-function-sync-client.ts`):**
```typescript
const erpPayload: ERPSyncPayload = {
  externalId: client.id,
  name: client.name,
  // ... campos existentes ...
  customField: client.custom_field, // Adicione aqui
};
```

**No Backend do ERP (`clientController.js`):**
```javascript
const clientData = {
  name,
  email: email || null,
  // ... campos existentes ...
  custom_field: customField || null, // Adicione aqui
  external_id: externalId,
  external_system: 'agendamento',
};
```

### Filtrar Clientes na Migração

**No `migrate-clients.js`:**
```javascript
// Buscar apenas clientes ativos
const { data: clients, error } = await supabase
  .from('clients')
  .select('*')
  .eq('is_active', true)  // Adicione filtros
  .order('created_at', { ascending: true });
```

## 🐛 Troubleshooting

### Edge Function não está disparando
1. Verifique se o webhook está configurado corretamente
2. Teste manualmente a função via Dashboard do Supabase
3. Verifique os logs: `supabase functions logs sync-client-to-erp`

### Erro 401 (Unauthorized)
- A API Key está incorreta ou não foi configurada no `.env` do ERP
- Verifique: `echo $INTEGRATION_API_KEYS`

### Cliente não aparece no ERP
1. Verifique os logs da Edge Function
2. Teste o endpoint diretamente com cURL
3. Confirme que os dados obrigatórios estão presentes (externalId, name, phone)

### Duplicação de Clientes
- Isso não deveria acontecer (o sistema busca por `external_id`)
- Se ocorrer, verifique se o `externalId` está sendo enviado corretamente

## 📚 Recursos Adicionais

- [Documentação completa](../INTEGRATION_GUIDE.md)
- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Supabase Webhooks Docs](https://supabase.com/docs/guides/database/webhooks)

## 💡 Dicas

1. **Teste em desenvolvimento primeiro**: Use URLs locais (localhost) antes de produção
2. **Monitore os logs**: Especialmente nas primeiras horas após deploy
3. **Use retry**: O Supabase automaticamente tenta reenviar webhooks que falharam
4. **Rate Limiting**: Configure limites para evitar sobrecarga
5. **Backup**: Faça backup dos dados antes de rodar a migração em lote

## 📞 Suporte

Em caso de dúvidas:
1. Consulte a [documentação completa](../INTEGRATION_GUIDE.md)
2. Verifique os logs (Edge Function e Backend ERP)
3. Entre em contato com a equipe de desenvolvimento

---

**Última atualização**: 02/11/2025

