# Implementação do TSO (Talão de Serviços Ópticos)

## ✅ Implementação Concluída

O sistema foi atualizado para incluir suporte completo ao TSO (Talão de Serviços Ópticos), com base no modelo físico utilizado na ótica.

## 📋 O que foi implementado

### 1. Models (Backend)

#### **Company.js** - Dados da Ótica
```javascript
- name, document, email
- phone, phone2
- address, neighborhood, city, state, zipCode
- logo, isActive
```

#### **Prescription.js** - Prescrições Médicas
```javascript
// Novos campos:
- rightEyeLonge (OD para longe)
- rightEyePerto (OD para perto)
- leftEyeLonge (OE para longe)
- leftEyePerto (OE para perto)
- addition (Adição para perto)
```

#### **Sale.js** - Vendas com TSO
```javascript
// Novos campos:
- tsoNumber (Número do TSO)
- emissionDate (Data de emissão)
- deliveryTime (Hora de entrega)
- laboratory (Laboratório)
- exchangeDate (Data de troca)
- exchangeNumber (Número da troca)
```

#### **SaleItem.js** - Itens da Venda
```javascript
// Novos campos:
- itemType (frame/lens/accessory/service)
- frameSpecifications (Especificações da armação)
- lensDiameter (Diâmetro da lente)
- frameClientReference (Referência da armação do cliente)
```

#### **Client.js** - Clientes
```javascript
// Novos campos:
- address (Rua, número)
- neighborhood (Bairro)
- city (Cidade)
- state (Estado - UF)
- zipCode (CEP)
```

### 2. Controllers e Rotas

- ✅ `companyController.js` - Gerenciamento da empresa
- ✅ `routes/company.js` - Endpoints da empresa
- ✅ `server.js` - Integração das rotas

### 3. Frontend

- ✅ Nova página **TSO.tsx**
- ✅ Menu atualizado: "Prescrições" → "TSO"
- ✅ Visualização de TSOs com detalhes completos
- ✅ Modal de detalhes do TSO

## 🚀 Como usar

### 1. Configure o banco de dados

**Opção A: Via SQL Editor do Supabase (Recomendado)**

1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Clique em **New Query**
5. Copie o conteúdo de: `backend/database/migration_tso.sql`
6. Cole e execute

**Opção B: Via Script Node.js**

```bash
cd backend
npm run setup-tso
```

### 2. Inicie o sistema

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 3. Acesse a página TSO

- URL: http://localhost:3000/tso

## 📊 Estrutura do TSO

### Campos do TSO (baseado no modelo físico)

```javascript
{
  // Dados da Ótica
  company: {
    name: "Ótica Davi",
    phone: "(033) 3241-5700",
    address: "RUA PRESIDENTE TANCREDO NEVES, 465",
    neighborhood: "CENTRO",
    city: "MANTENA",
    state: "MG",
    zipCode: "35290-000"
  },
  
  // Número e Datas
  tsoNumber: "12.468",
  emissionDate: "15/10/25",
  deliveryDate: "30/10/25",
  deliveryTime: "18:00",
  
  // Cliente
  client: {
    name: "MATHEUS VICTOR RIBEIRO",
    cpf: "094.628.897-67",
    address: "RUA EDUARTE TEIXEIRA DO PRADO, 141",
    neighborhood: "CAMPO NOVO",
    city: "BARRA DE SAO FRANCISCO",
    state: "ES",
    zipCode: "29800-000",
    birthDate: "20/01/03"
  },
  
  // Vendedor
  vendedor: "000023 GLEICY QUEIROZ PATRÍCIO DE ARAUJO",
  
  // Prescrição - LONGE
  prescriptionLonge: {
    addition: 1.50,
    rightEye: { sphere: 2.25, cylinder: 2.00, axis: 10, dp: 67, altura: 0, dnp: 34 },
    leftEye: { sphere: -2.75, cylinder: 1.00, axis: 170, dp: 0, altura: 0, dnp: 33 }
  },
  
  // Prescrição - PERTO
  prescriptionPerto: {
    rightEye: { sphere: 0, cylinder: 0, axis: 0, dp: 67, altura: 0 },
    leftEye: { sphere: 0, cylinder: 0, axis: 0, dp: 0, altura: 0 }
  },
  
  // Armação
  frame: {
    type: "ACETATO CLIENTE",
    value: 0
  },
  
  // Lente
  lens: {
    code: 6,
    type: "LENTE MULTIFOCAL",
    material: "VS BRANCA LT CR39 ORGaline",
    value: 0.01
  },
  
  // Financeiro
  values: {
    total: 0.01,
    others: 0,
    entrada: 0,
    saldo: 0.01
  },
  
  // Controles
  laboratory: "",
  conditionPayment: "",
  observation: "",
  pedVenda: "",
  dtVenda: "",
  dtPedido: "",
  dtEntrega: "",
  dtTroca: ""
}
```

## 🔧 APIs Disponíveis

### Company

- `GET /api/v1/company` - Obter dados da empresa
- `PUT /api/v1/company` - Atualizar dados da empresa

### Sales (agora com TSO)

- `GET /api/v1/sales` - Listar vendas (inclui número TSO)
- `POST /api/v1/sales` - Criar venda com TSO
- `GET /api/v1/sales/:id` - Ver detalhes da venda
- `PUT /api/v1/sales/:id` - Atualizar venda

## 📝 Próximos Passos (Melhorias Futuras)

1. **Geração de PDF do TSO**
   - Template visual idêntico ao TSO físico
   - Impressão direta do browser

2. **Integração completa com Vendas**
   - Criar TSO automaticamente ao finalizar venda
   - Número sequencial automático

3. **Histórico de TSOs por Cliente**
   - Listar todos os TSOs de um cliente
   - Rastreabilidade completa

4. **Status de Produção**
   - Acompanhamento da fabricação das lentes
   - Notificações de status

5. **Alertas de Entrega**
   - Notificação quando o produto estiver pronto
   - Lembrete para retirada

## 🎯 Comparação com o TSO Físico

| Campo TSO Físico | Campo no Sistema | Status |
|------------------|------------------|--------|
| Nome da Ótica | `company.name` | ✅ |
| Endereço da Ótica | `company.address`, `neighborhood`, `city`, `state`, `zipCode` | ✅ |
| Telefones | `company.phone`, `phone2` | ✅ |
| Número TSO | `sale.tsoNumber` | ✅ |
| Data Emissão | `sale.emissionDate` | ✅ |
| Data Entrega | `sale.deliveryDate` | ✅ |
| Hora Entrega | `sale.deliveryTime` | ✅ |
| Nome Cliente | `client.name` | ✅ |
| CPF Cliente | `client.cpf` | ✅ |
| Endereço Cliente | `client.address`, `neighborhood`, `city`, `state`, `zipCode` | ✅ |
| Vendedor | `user.name` | ✅ |
| Prescrição Longe | `prescription.rightEyeLonge`, `leftEyeLonge` | ✅ |
| Prescrição Perto | `prescription.rightEyePerto`, `leftEyePerto` | ✅ |
| Adição | `prescription.addition` | ✅ |
| Armação | `saleItem.frameSpecifications` | ✅ |
| Tipo Armação | `saleItem.frameSpecifications.type` | ✅ |
| Lente | `saleItem.lensSpecifications` | ✅ |
| Tipo Lente | `saleItem.lensSpecifications.type` | ✅ |
| Material Lente | `saleItem.lensSpecifications.material` | ✅ |
| Diâmetro | `saleItem.lensDiameter` | ✅ |
| Valor Total | `sale.total` | ✅ |
| Valor Entrada | `sale.paymentStatus` | ✅ |
| Valor Saldo | `sale.total - sale.paymentAmount` | ✅ |
| Laboratório | `sale.laboratory` | ✅ |
| Data Troca | `sale.exchangeDate` | ✅ |

## ✅ Tudo Implementado!

O sistema agora suporta completamente o TSO, com todos os campos necessários para emitir talões digitais conforme o modelo físico utilizado na ótica.










