# 📚 Documentação Técnica - Athera Run

Esta pasta contém evidências técnicas e audits do sistema.

## 📁 Estrutura

```
docs/
├── README.md                           ← Este arquivo
├── lighthouse-audit-v5.1.0.html       ← Report Lighthouse completo
├── lighthouse-audit-v5.1.0.png        ← Screenshot scores
└── (futuros audits e evidências)
```

## 🔍 Lighthouse Audits

### Como Adicionar

1. Executar Lighthouse (ver `../LIGHTHOUSE_AUDIT_GUIDE.md`)
2. Salvar report HTML aqui: `lighthouse-audit-vX.X.X.html`
3. Salvar screenshot aqui: `lighthouse-audit-vX.X.X.png`
4. Atualizar `../LIGHTHOUSE_AUDIT_RESULTS.md`
5. Commit tudo junto

### Naming Convention

```
lighthouse-audit-v{MAJOR}.{MINOR}.{PATCH}.{html|png}

Exemplo:
- lighthouse-audit-v5.1.0.html
- lighthouse-audit-v5.1.0.png
```

## 📊 Histórico de Audits

| Versão | Data       | PWA Score | Performance | Notes             |
|--------|------------|-----------|-------------|-------------------|
| v5.1.0 | 11/Dez/25  | TBD       | TBD         | PWA implementation|

## 🎯 Targets

- **PWA Score:** 100 (obrigatório)
- **Performance:** 90+ (mobile 3G)
- **Accessibility:** 95+
- **Best Practices:** 100
- **SEO:** 90+

---

**Atualizado:** 11/Dez/2025
