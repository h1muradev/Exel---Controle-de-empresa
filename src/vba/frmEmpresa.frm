VERSION 5.00
Begin VB.UserForm frmEmpresa
   Caption         =   "Cadastro de Empresa"
   ClientHeight    =   7200
   ClientLeft      =   120
   ClientTop       =   465
   ClientWidth     =   9600
   StartUpPosition =   1  'CenterOwner
End
Attribute VB_Name = "frmEmpresa"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
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
