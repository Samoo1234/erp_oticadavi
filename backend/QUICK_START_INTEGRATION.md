# 🚀 Quick Start: Integração VisionCare → ERP

Guia rápido de 5 minutos para configurar a sincronização automática de pacientes.

---

## ✅ **Pré-requisitos**

- Backend do ERP rodando (`npm run dev`)
- Acesso ao dashboard do VisionCare
- ngrok instalado

---

## 📋 **Passo a Passo**

### **1️⃣ Configurar `.env`**

Adicione no arquivo `backend/.env`:

```env
INTEGRATION_API_KEYS=sua-chave-api-aqui
VISIONCARE_ANON_KEY=sua-chave-visioncare-aqui
ERP_BASE_URL=http://localhost:3000
```

📖 **Detalhes**: Ver `CONFIG_ENV.md`

---

### **2️⃣ Executar Migração Inicial**

```bash
cd backend
node migrate-visioncare-patients.js
```

Isso vai sincronizar todos os pacientes existentes.

---

### **3️⃣ Expor o Servidor com ngrok**

```powershell
ngrok http 3000
```

**Copie a URL** que aparece (ex: `https://abc123.ngrok.io`)

⚠️ **Deixe essa janela aberta!**

---

### **4️⃣ Configurar Webhook no VisionCare**

1. Acesse: https://supabase.com/dashboard/project/nfvrbyiocqozpkyispkb
2. Vá em **Database** → **Webhooks** → **Create a new webhook**
3. Preencha:

```
Name: erp-sync-patients
Table: patients
Events: ✅ Insert, Update, Delete

HTTP Request:
  Type: POST
  URL: https://SUA-URL-NGROK.ngrok.io/api/v1/clients/sync

HTTP Headers:
  x-api-key: SUA-CHAVE-API
  Content-Type: application/json
```

4. Clique em **Create webhook**

---

### **5️⃣ Testar**

No VisionCare, crie um novo paciente e veja os logs no backend do ERP:

```
📥 Webhook recebido: {...}
✅ Cliente criado: Nome do Paciente
```

---

## 🎉 **Pronto!**

A sincronização está ativa! Toda vez que um paciente for:
- **Criado** → Automaticamente aparece no ERP
- **Editado** → Atualizado no ERP
- **Excluído** → Desativado no ERP

---

## 📚 **Guias Completos**

- **Configuração Detalhada**: `INTEGRATION_VISIONCARE.md`
- **Variáveis de Ambiente**: `CONFIG_ENV.md`
- **Troubleshooting**: `INTEGRATION_VISIONCARE.md` (seção de troubleshooting)

---

## 🆘 **Problemas?**

1. Verifique se o ngrok está rodando
2. Verifique se a URL do webhook está correta
3. Verifique se a `x-api-key` está correta
4. Veja os logs do webhook no Supabase

---

**Boa sincronização! 🔄✨**

