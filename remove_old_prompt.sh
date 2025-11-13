#!/bin/bash
# Remove linhas 918 até 1332 (prompt antigo)
sed -i '918,1332d' lib/ai-plan-generator.ts
echo "Old prompt removed"
