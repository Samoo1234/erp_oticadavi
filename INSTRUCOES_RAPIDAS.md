# 🚀 Instruções Rápidas - ERP Ótica

## Para iniciar o sistema completo

### Terminal 1 - Backend
```bash
cd "F:\erp oticadavi\backend"
npm run dev
```

Você deve ver:
- ✅ Servidor rodando na porta 3001
- ✅ Conexão com Supabase estabelecida

### Terminal 2 - Frontend
```bash
cd "F:\erp oticadavi\frontend"
npm run dev
```

Você deve ver:
- ✅ React app rodando em http://localhost:3000

## Testar criação de cliente

1. Acesse: http://localhost:3000
2. Faça login
3. Vá em "Clientes"
4. Clique em "Novo Cliente"
5. Preencha o formulário:
   - Nome Completo
   - Email
   - Telefone
   - CPF (com formatação automática)
   - Data de Nascimento
   - Gênero
   - Endereço completo
   - Observações
6. Clique em "Criar Cliente"
7. Cliente será salvo no Supabase

**Importante**: O backend PRECISA estar rodando para o formulário funcionar!

## Verificação

Abra o console do navegador (F12) e verifique:
- ✅ Se aparecer "Cliente criado com sucesso!" = Tudo certo
- ❌ Se aparecer "ERR_CONNECTION_REFUSED" = Backend não está rodando

## Recursos Implementados

### ✅ Formulário de Cliente
- Número único automático (6 dígitos)
- Validação completa de dados
- Formatação automática (CPF, CEP)
- Salva no Supabase

### ✅ TSO (Talão de Serviços Ópticos)
- Página completa de TSOs
- Visualização de detalhes
- Estrutura baseada no modelo físico

## URLs Importantes

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api/v1
- API Docs: http://localhost:3001/api-docs
- Supabase: https://app.supabase.com










