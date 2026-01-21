Attribute VB_Name = "modApp"
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
    Dim arr As Variant
    Dim i As Long
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
