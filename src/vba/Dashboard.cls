VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "Dashboard"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = True
Option Explicit

Private Sub txtBusca_Change()
    modApp.AtualizarBusca
End Sub

Private Sub lstResultados_DblClick(ByVal Cancel As MSForms.ReturnBoolean)
    modApp.IrParaEmpresaSelecionada
End Sub
