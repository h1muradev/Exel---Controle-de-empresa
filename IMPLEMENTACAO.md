# Implementação no Excel (importação dos arquivos VBA)

Este repositório fornece os arquivos VBA exportados para facilitar a importação no Excel Desktop.

## Arquivos disponíveis
- `src/vba/modApp.bas`
- `src/vba/Dashboard.cls`
- `src/vba/frmEmpresa.frm`
- `src/vba/frmObs.frm`

## Como importar
1. Abra o Excel e o arquivo `.XLSM`.
2. Pressione **Alt + F11** para abrir o Editor VBA.
3. Menu **Arquivo > Importar arquivo...**
4. Importe, nesta ordem:
   - `modApp.bas`
   - `Dashboard.cls` (substituir o módulo de planilha do Dashboard, se solicitado)
   - `frmEmpresa.frm`
   - `frmObs.frm`
5. Verifique se os nomes dos objetos e controles estão exatamente como especificado em `ENTREGA.md`.
6. Salve o arquivo como **.XLSM**.

## Observação
Os arquivos `.frm` não incluem `.frx`. Isso significa que o layout visual do formulário deve ser ajustado manualmente conforme o guia.
