VERSION 5.00
Begin VB.UserForm frmObs
   Caption         =   "Observações"
   ClientHeight    =   4200
   ClientLeft      =   120
   ClientTop       =   465
   ClientWidth     =   7200
   StartUpPosition =   1  'CenterOwner
End
Attribute VB_Name = "frmObs"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
Option Explicit

Private Sub UserForm_Initialize()
    Dim ws As Worksheet
    Dim lo As ListObject
    Dim arr As Variant
    Dim i As Long

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
