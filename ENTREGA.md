# Solução Excel (XLSM) — Gestão de Cadastro de Empresas

Este documento contém **todo o passo‑a‑passo de montagem**, **fórmulas**, **regras de formatação condicional**, **design (style guide)** e **código VBA completo** solicitado para você implementar no Excel Desktop (Windows, Office 365/2021+).

---

## 1) Passo a passo de montagem no Excel

### 1.1. Criar as abas (nomes exatos)
Crie as planilhas nesta ordem e com os nomes **exatamente** iguais:
1. **Base de Dados**
2. **Observacoes**
3. **Dashboard**
4. **Config** (oculta)
5. **Wiki_Cores**

> Dica: clique com o botão direito na guia > **Renomear** e depois reorganize com arrastar.

---

### 1.2. Base de Dados (tblEmpresas)
Na aba **Base de Dados**, crie a tabela com **ListObject**:
1. Digite os cabeçalhos (linha 1) na ordem exata:

```
Codigo
Apelido
CNPJ
Responsavel
CPF
TipoUnidade
CodigoMatriz
Status
EmiteNFe
EmiteNFCe
EmiteISS
ValidadeCertificado
StatusCertificado
AtualizadoEm
```

2. Selecione o intervalo dos cabeçalhos e pressione **Ctrl+T** para criar a tabela.
3. Marque **“Minha tabela tem cabeçalhos”**.
4. Na guia **Design da Tabela**, renomeie para **tblEmpresas**.

#### Validações (Data Validation)
Configure na aba **Base de Dados**:
- **TipoUnidade**: Lista com `Matriz;Filial` (Config)
- **Status**: Lista com `Ativa;Inativa;Inadimplente` (Config)
- **EmiteNFe/EmiteNFCe/EmiteISS**: Lista com `Sim;Nao` (Config)

**Como**: selecione a coluna inteira da tabela > **Dados > Validação de Dados** > **Lista** > Fonte: referência às listas em **Config**.

#### Fórmula de StatusCertificado
Na coluna **StatusCertificado** da tabela **tblEmpresas**, insira a fórmula:

```
=SE([@ValidadeCertificado]="";"";SE([@ValidadeCertificado]<HOJE();"Vencido";SE([@ValidadeCertificado]<=HOJE()+Config!$D$3;"Perto de vencer";"Ativo")))
```

Essa fórmula se replica automaticamente nas linhas da tabela.

---

### 1.3. Observacoes (tblObservacoes)
Na aba **Observacoes**, crie a tabela **tblObservacoes**:

Cabeçalhos (linha 1):
```
DataHora
CodigoEmpresa
Apelido
Observacao
Usuario
```

Selecione e pressione **Ctrl+T** > “Minha tabela tem cabeçalhos” > renomeie para **tblObservacoes**.

---

### 1.4. Config (aba oculta)
Na aba **Config**, crie listas e parâmetros:

| Célula | Conteúdo |
|-------|----------|
| A1 | Lista Status |
| A2 | Ativa |
| A3 | Inativa |
| A4 | Inadimplente |
| B1 | Lista SimNao |
| B2 | Sim |
| B3 | Nao |
| C1 | Lista TipoUnidade |
| C2 | Matriz |
| C3 | Filial |
| D1 | Lista StatusCertificado |
| D2 | Ativo |
| D3 | Perto de vencer |
| D4 | Vencido |
| F1 | Param |
| F2 | DiasAlertaCertificado |
| D3 | **30** (valor padrão) |

> Importante: o **parâmetro deve ficar em Config!D3** conforme especificação.

Depois oculte a aba **Config**.

---

### 1.5. Dashboard (layout, cards, gráficos e filtros)

#### 1.5.1. Configurações iniciais
- Desative **Linhas de Grade** (Exibir > Linhas de grade).
- Defina **fundo** da planilha com cor **#0b0f17**.
- Ajuste largura de colunas para formar grid visual.

#### 1.5.2. Header (título + botões)
- Crie um título grande: **“Dashboard - Gestão de Empresas”**.
- Insira **formas retangulares arredondadas** como botões:
  - **Cadastrar Nova Empresa** → macro `AbrirCadastroEmpresa`
  - **Base de Dados** → macro `GoBase`
  - **Observações** → macro `GoObservacoes`
  - **Refresh** → macro `RefreshAll`

**Estilo dos botões:**
- Fundo **#111827**, borda **#1f2937**, texto branco.
- Botão **Refresh** em destaque: fundo **#7c3aed**, texto branco.

#### 1.5.3. Cards KPI
Crie 4 “cards” com fundo **#111827**, borda **#1f2937**, canto arredondado.

Fórmulas nos cards:
1. **Total de Empresas**: `=CONT.VALORES(tblEmpresas[Codigo])`
2. **Qtd Ativas**: `=CONT.SES(tblEmpresas[Status];"Ativa")`
3. **Qtd Inadimplentes**: `=CONT.SES(tblEmpresas[Status];"Inadimplente")`
4. **Qtd que emitem NFe**: `=CONT.SES(tblEmpresas[EmiteNFe];"Sim")`

#### 1.5.4. Gráficos
Use **PivotTables** (recomendado) ou tabelas‑resumo com `CONT.SES`.

**Gráfico 1 – Pizza (Status)**
- Fonte: PivotTable com **Status** (linhas) e **contagem de Codigo**.

**Gráfico 2 – Colunas (Emissão Fiscal)**
- Fonte: tabela com contagem de **Sim** para NFe/NFCe/ISS.

**Gráfico 3 – Colunas (Certificados)**
- Fonte: PivotTable com **StatusCertificado** (linhas) e **contagem de Codigo**.

#### 1.5.5. Slicers (filtros)
Crie Slicers conectados às PivotTables:
- **Status**
- **TipoUnidade**
- **EmiteNFe**

Use **Conexões de Relatório** para ligar os slicers a todas as PivotTables.

#### 1.5.6. Busca inteligente (ActiveX)
Na aba **Dashboard**:
1. Insira um **TextBox ActiveX** com nome **txtBusca**.
2. Insira um **ListBox ActiveX** com nome **lstResultados**.
3. Posicione ambos dentro de um card.

---

### 1.6. Wiki_Cores (legenda)
Crie uma legenda simples com o significado das cores (status, certificado, etc.).
Inclua link no Dashboard (forma ou texto) apontando para esta aba.

---

## 2) Código VBA completo

> Ative o Editor VBA (Alt+F11). Insira módulos conforme indicado.
> **Sempre use `Option Explicit`.**

### 2.1. Módulo padrão: modApp
**Inserir > Módulo** e cole (o mesmo conteúdo também está em `src/vba/modApp.bas` para importação direta):

```vba
Option Explicit

Public Sub AbrirCadastroEmpresa()
    frmEmpresa.Show
End Sub

Public Sub AbrirObservacoes()
    frmObs.Show
End Sub

Public Sub GoBase()
    ThisWorkbook.Worksheets("Base de Dados").Activate
End Sub

Public Sub GoDashboard()
    ThisWorkbook.Worksheets("Dashboard").Activate
End Sub

Public Sub GoObservacoes()
    ThisWorkbook.Worksheets("Observacoes").Activate
End Sub

Public Sub RefreshAll()
    On Error GoTo TrataErro
    Application.ScreenUpdating = False
    ThisWorkbook.RefreshAll
    Application.CalculateFull
    Application.ScreenUpdating = True
    Exit Sub
TrataErro:
    Application.ScreenUpdating = True
    MsgBox "Erro ao atualizar: " & Err.Description, vbExclamation
End Sub

Public Function NextCodigo() As Long
    Dim ws As Worksheet
    Dim lo As ListObject
    Dim maxVal As Variant

    Set ws = ThisWorkbook.Worksheets("Base de Dados")
    Set lo = ws.ListObjects("tblEmpresas")

    If lo.ListRows.Count = 0 Then
        NextCodigo = 1
    Else
        maxVal = Application.WorksheetFunction.Max(lo.ListColumns("Codigo").DataBodyRange)
        NextCodigo = CLng(maxVal) + 1
    End If
End Function

Public Sub AtualizarBusca()
    Dim wsDash As Worksheet
    Dim wsBase As Worksheet
    Dim lo As ListObject
    Dim txtBusca As Object
    Dim lst As Object
    Dim arr, i As Long
    Dim termo As String

    Set wsDash = ThisWorkbook.Worksheets("Dashboard")
    Set wsBase = ThisWorkbook.Worksheets("Base de Dados")
    Set lo = wsBase.ListObjects("tblEmpresas")

    Set txtBusca = wsDash.OLEObjects("txtBusca").Object
    Set lst = wsDash.OLEObjects("lstResultados").Object

    termo = NormalizarTexto(txtBusca.Text)

    lst.Clear
    lst.ColumnCount = 6
    lst.ColumnHeads = False

    If lo.ListRows.Count = 0 Or Len(termo) = 0 Then Exit Sub

    arr = lo.DataBodyRange.Value

    For i = 1 To UBound(arr, 1)
        Dim apelido As String, cnpj As String
        apelido = NormalizarTexto(CStr(arr(i, lo.ListColumns("Apelido").Index)))
        cnpj = NormalizarTexto(CStr(arr(i, lo.ListColumns("CNPJ").Index)))

        If InStr(1, apelido, termo, vbTextCompare) > 0 Or InStr(1, cnpj, termo, vbTextCompare) > 0 Then
            lst.AddItem arr(i, lo.ListColumns("Codigo").Index)
            lst.List(lst.ListCount - 1, 1) = arr(i, lo.ListColumns("Apelido").Index)
            lst.List(lst.ListCount - 1, 2) = arr(i, lo.ListColumns("CNPJ").Index)
            lst.List(lst.ListCount - 1, 3) = arr(i, lo.ListColumns("Status").Index)
            lst.List(lst.ListCount - 1, 4) = arr(i, lo.ListColumns("EmiteNFe").Index)
            lst.List(lst.ListCount - 1, 5) = arr(i, lo.ListColumns("StatusCertificado").Index)
        End If
    Next i
End Sub

Public Sub IrParaEmpresaSelecionada()
    Dim wsDash As Worksheet
    Dim wsBase As Worksheet
    Dim lo As ListObject
    Dim lst As Object
    Dim codigo As Variant
    Dim rng As Range

    Set wsDash = ThisWorkbook.Worksheets("Dashboard")
    Set wsBase = ThisWorkbook.Worksheets("Base de Dados")
    Set lo = wsBase.ListObjects("tblEmpresas")
    Set lst = wsDash.OLEObjects("lstResultados").Object

    If lst.ListIndex < 0 Then Exit Sub

    codigo = lst.List(lst.ListIndex, 0)

    Set rng = lo.ListColumns("Codigo").DataBodyRange.Find(What:=codigo, LookIn:=xlValues, LookAt:=xlWhole)

    If Not rng Is Nothing Then
        wsBase.Activate
        rng.Select
    End If
End Sub

Private Function NormalizarTexto(ByVal texto As String) As String
    Dim t As String
    t = LCase$(texto)
    t = Replace(t, ".", "")
    t = Replace(t, "-", "")
    t = Replace(t, "/", "")
    t = Replace(t, " ", "")
    t = RemoverAcentos(t)
    NormalizarTexto = t
End Function

Private Function RemoverAcentos(ByVal texto As String) As String
    Dim i As Long
    Dim acentos As String
    Dim semAcentos As String

    acentos = "áàâãäéèêëíìîïóòôõöúùûüçñ"
    semAcentos = "aaaaaeeeeiiiiooooouuuucn"

    For i = 1 To Len(acentos)
        texto = Replace(texto, Mid$(acentos, i, 1), Mid$(semAcentos, i, 1))
    Next i

    RemoverAcentos = texto
End Function
```

---

### 2.2. Código da planilha Dashboard
No VBA, clique com o botão direito em **Dashboard** > “Exibir código” e cole (o mesmo conteúdo também está em `src/vba/Dashboard.cls` para importação):

```vba
Option Explicit

Private Sub txtBusca_Change()
    modApp.AtualizarBusca
End Sub

Private Sub lstResultados_DblClick(ByVal Cancel As MSForms.ReturnBoolean)
    modApp.IrParaEmpresaSelecionada
End Sub
```

---

### 2.3. UserForm: frmEmpresa (Cadastro)
Crie o UserForm **frmEmpresa** e adicione os controles com estes nomes:

**TextBox**: `txtApelido`, `txtCNPJ`, `txtResponsavel`, `txtCPF`, `txtCodigoMatriz`, `dtValidadeCert`

**ComboBox**: `cboStatus`, `cboTipoUnidade`

**CheckBox**: `chkNFe`, `chkNFCe`, `chkISS`

**CommandButton**: `cmdSalvar`, `cmdCancelar`, `cmdObs`

Código do formulário (o mesmo conteúdo também está em `src/vba/frmEmpresa.frm`):

```vba
Option Explicit

Private Sub UserForm_Initialize()
    With cboStatus
        .Clear
        .AddItem "Ativa"
        .AddItem "Inativa"
        .AddItem "Inadimplente"
    End With

    With cboTipoUnidade
        .Clear
        .AddItem "Matriz"
        .AddItem "Filial"
    End With

    txtCodigoMatriz.Enabled = False
End Sub

Private Sub cboTipoUnidade_Change()
    txtCodigoMatriz.Enabled = (cboTipoUnidade.Value = "Filial")
    If Not txtCodigoMatriz.Enabled Then txtCodigoMatriz.Value = ""
End Sub

Private Sub cmdSalvar_Click()
    Dim ws As Worksheet
    Dim lo As ListObject
    Dim newRow As ListRow
    Dim cnpjLimpo As String

    If Trim$(txtApelido.Value) = "" Or Trim$(txtCNPJ.Value) = "" Then
        MsgBox "Apelido e CNPJ são obrigatórios.", vbExclamation
        Exit Sub
    End If

    cnpjLimpo = LimparCNPJ(txtCNPJ.Value)

    Set ws = ThisWorkbook.Worksheets("Base de Dados")
    Set lo = ws.ListObjects("tblEmpresas")
    Set newRow = lo.ListRows.Add

    With newRow.Range
        .Cells(1, lo.ListColumns("Codigo").Index).Value = modApp.NextCodigo
        .Cells(1, lo.ListColumns("Apelido").Index).Value = txtApelido.Value
        .Cells(1, lo.ListColumns("CNPJ").Index).Value = cnpjLimpo
        .Cells(1, lo.ListColumns("Responsavel").Index).Value = txtResponsavel.Value
        .Cells(1, lo.ListColumns("CPF").Index).Value = txtCPF.Value
        .Cells(1, lo.ListColumns("TipoUnidade").Index).Value = cboTipoUnidade.Value
        .Cells(1, lo.ListColumns("CodigoMatriz").Index).Value = txtCodigoMatriz.Value
        .Cells(1, lo.ListColumns("Status").Index).Value = cboStatus.Value
        .Cells(1, lo.ListColumns("EmiteNFe").Index).Value = IIf(chkNFe.Value, "Sim", "Nao")
        .Cells(1, lo.ListColumns("EmiteNFCe").Index).Value = IIf(chkNFCe.Value, "Sim", "Nao")
        .Cells(1, lo.ListColumns("EmiteISS").Index).Value = IIf(chkISS.Value, "Sim", "Nao")
        .Cells(1, lo.ListColumns("ValidadeCertificado").Index).Value = dtValidadeCert.Value
        .Cells(1, lo.ListColumns("AtualizadoEm").Index).Value = Now
    End With

    MsgBox "Empresa cadastrada com sucesso!", vbInformation
    LimparCampos
End Sub

Private Sub cmdCancelar_Click()
    Unload Me
End Sub

Private Sub cmdObs_Click()
    frmObs.Show
End Sub

Private Sub LimparCampos()
    txtApelido.Value = ""
    txtCNPJ.Value = ""
    txtResponsavel.Value = ""
    txtCPF.Value = ""
    cboStatus.Value = ""
    cboTipoUnidade.Value = ""
    txtCodigoMatriz.Value = ""
    chkNFe.Value = False
    chkNFCe.Value = False
    chkISS.Value = False
    dtValidadeCert.Value = ""
End Sub

Private Function LimparCNPJ(ByVal texto As String) As String
    Dim t As String
    t = Replace(texto, ".", "")
    t = Replace(t, "-", "")
    t = Replace(t, "/", "")
    t = Replace(t, " ", "")
    LimparCNPJ = t
End Function
```

---

### 2.4. UserForm: frmObs (Observações)
Crie o UserForm **frmObs** com controles:

**ComboBox**: `cboEmpresa`
**TextBox** (MultiLine): `txtObs`
**CommandButton**: `cmdSalvarObs`, `cmdFechar`

Código do formulário (o mesmo conteúdo também está em `src/vba/frmObs.frm`):

```vba
Option Explicit

Private Sub UserForm_Initialize()
    Dim ws As Worksheet
    Dim lo As ListObject
    Dim arr, i As Long

    Set ws = ThisWorkbook.Worksheets("Base de Dados")
    Set lo = ws.ListObjects("tblEmpresas")

    cboEmpresa.Clear

    If lo.ListRows.Count = 0 Then Exit Sub

    arr = lo.DataBodyRange.Value

    For i = 1 To UBound(arr, 1)
        cboEmpresa.AddItem arr(i, lo.ListColumns("Codigo").Index) & " - " & arr(i, lo.ListColumns("Apelido").Index)
    Next i
End Sub

Private Sub cmdSalvarObs_Click()
    Dim ws As Worksheet
    Dim lo As ListObject
    Dim newRow As ListRow
    Dim codigo As String
    Dim apelido As String

    If cboEmpresa.Value = "" Or Trim$(txtObs.Value) = "" Then
        MsgBox "Selecione a empresa e informe a observação.", vbExclamation
        Exit Sub
    End If

    codigo = Split(cboEmpresa.Value, " - ")(0)
    apelido = Split(cboEmpresa.Value, " - ")(1)

    Set ws = ThisWorkbook.Worksheets("Observacoes")
    Set lo = ws.ListObjects("tblObservacoes")
    Set newRow = lo.ListRows.Add

    With newRow.Range
        .Cells(1, lo.ListColumns("DataHora").Index).Value = Now
        .Cells(1, lo.ListColumns("CodigoEmpresa").Index).Value = codigo
        .Cells(1, lo.ListColumns("Apelido").Index).Value = apelido
        .Cells(1, lo.ListColumns("Observacao").Index).Value = txtObs.Value
        .Cells(1, lo.ListColumns("Usuario").Index).Value = Environ$("Username")
    End With

    MsgBox "Observação registrada!", vbInformation
    txtObs.Value = ""
End Sub

Private Sub cmdFechar_Click()
    Unload Me
End Sub
```

---

## 3) Fórmulas utilizadas

### 3.1. StatusCertificado (tblEmpresas)
```
=SE([@ValidadeCertificado]="";"";SE([@ValidadeCertificado]<HOJE();"Vencido";SE([@ValidadeCertificado]<=HOJE()+Config!$D$3;"Perto de vencer";"Ativo")))
```

### 3.2. KPIs no Dashboard
```
Total de Empresas:    =CONT.VALORES(tblEmpresas[Codigo])
Qtd Ativas:           =CONT.SES(tblEmpresas[Status];"Ativa")
Qtd Inadimplentes:    =CONT.SES(tblEmpresas[Status];"Inadimplente")
Qtd que emitem NFe:   =CONT.SES(tblEmpresas[EmiteNFe];"Sim")
```

### 3.3. Tabelas‑resumo (se não usar Pivot)
**Emissão Fiscal:**
```
NFe:  =CONT.SES(tblEmpresas[EmiteNFe];"Sim")
NFCe: =CONT.SES(tblEmpresas[EmiteNFCe];"Sim")
ISS:  =CONT.SES(tblEmpresas[EmiteISS];"Sim")
```

**Certificados:**
```
Ativo:         =CONT.SES(tblEmpresas[StatusCertificado];"Ativo")
Perto de vencer: =CONT.SES(tblEmpresas[StatusCertificado];"Perto de vencer")
Vencido:       =CONT.SES(tblEmpresas[StatusCertificado];"Vencido")
```

---

## 4) Formatação condicional e cores

### 4.1. Status (linha inteira na tblEmpresas)
Aplique com fórmula na faixa de dados da tabela.

1. **Inadimplente** (prioridade alta)
```
=$H2="Inadimplente"
```
Cor: **#7f1d1d** (vermelho escuro)

2. **Inativa**
```
=$H2="Inativa"
```
Cor: **#374151** (cinza escuro)

3. **Ativa**
```
=$H2="Ativa"
```
Cor: **#064e3b** (verde escuro)

### 4.2. TipoUnidade (overlay leve)
1. **Matriz**
```
=$F2="Matriz"
```
Cor: **#1e3a8a** (azul escuro)

2. **Filial**
```
=$F2="Filial"
```
Cor: **#4c1d95** (roxo escuro)

### 4.3. StatusCertificado (somente célula)
1. **Ativo** → **#16a34a**
2. **Perto de vencer** → **#facc15**
3. **Vencido** → **#dc2626**

---

## 5) Style Guide (UI/Design)

**Cores:**
- Fundo: `#0b0f17`
- Cards: `#111827`
- Bordas: `#1f2937`
- Texto: `#ffffff`
- Texto secundário: `#9ca3af`
- Destaque/Primary: `#7c3aed`

**Tipografia:**
- Fonte: Segoe UI
- Título: 20–24pt, branco
- Labels: 9–10pt, cinza claro
- KPI valor: 22–26pt, branco

**Grid (sugestão):**
- 4 cards na primeira linha
- 2 colunas principais abaixo (busca + gráficos)

---

## 6) Checklist de Qualidade

- [ ] Todas as abas existem com nomes exatos.
- [ ] Tabelas **tblEmpresas** e **tblObservacoes** criadas com colunas na ordem correta.
- [ ] Fórmulas e validações aplicadas.
- [ ] Formatação condicional funcional.
- [ ] Dashboard sem gridlines e com layout clean/dark.
- [ ] Slicers conectados a todos os pivots.
- [ ] Busca inteligente funcionando (txtBusca + lstResultados).
- [ ] UserForms funcionando com validações e gravações corretas.
- [ ] Sem referências quebradas.
- [ ] Performance OK com 5k+ linhas (uso de arrays na busca).

---

**Pronto!** Com esse guia e o código acima, você consegue implementar a solução completa em Excel conforme solicitado.
