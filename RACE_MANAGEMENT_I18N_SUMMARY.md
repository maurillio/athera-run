# Race Management i18n - Resumo de Modificações Pendentes

Devido à complexidade e tamanho do componente race-management.tsx (560 linhas), as seguintes modificações ainda precisam ser aplicadas:

## ✅ Concluído:
- Import do useTranslations adicionado
- Hook t = useTranslations('raceManagement') adicionado
- Alerts de erro convertidos (addError, updateError, deleteError)
- confirmDelete convertido
- getPriorityLabel convertido para usar t('priorities.X')
- Título e descrição do card convertidos
- Botão reclassify convertido
- Dialog add race header convertido

## ⏳ Pendente - Formulários:
Todas as labels, placeholders e opções dos formulários (linhas 237-361 e 365-488):
- Labels: raceName, distance, raceDate, targetTime, location, classification
- Placeholders
- SelectItems para distances (5k, 10k, 15k, 10mile, half_marathon, 30k, marathon)
- SelectItems para priorities (A, B, C com labels e descriptions)
- Alert de auto-classification
- Botões (adding/update/cancel)

## ⏳ Pendente - Lista de Corridas:
- noRaces / noRacesDesc (linhas 495-497)
- Tooltips (editTooltip, deleteTooltip)
- goal, weeksBeforeA (linhas 540-544)

---

**Nota**: Para economizar tokens, recomenda-se usar uma abordagem de script para aplicar todas as 40+ substituições restantes de uma vez.
