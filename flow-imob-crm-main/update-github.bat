@echo off
echo ========================================
echo ATUALIZANDO PROJETO NO GITHUB
echo ========================================

echo.
echo 1. Verificando status do Git...
git status

echo.
echo 2. Adicionando todos os arquivos...
git add .

echo.
echo 3. Fazendo commit das alterações...
git commit -m "feat: Implementar sistema completo de campanhas de marketing

- Adicionar páginas de campanhas (/campaigns e /campaign/:id)
- Implementar interface Kanban com 5 estágios
- Criar sistema de ações com drag & drop
- Adicionar upload de arquivos e links externos
- Implementar sistema de notas e progresso
- Configurar banco de dados (campaigns e campaign_actions)
- Adicionar políticas RLS e storage bucket
- Integrar com sistema de autenticação existente

Funcionalidades:
✅ Criação e gestão de campanhas
✅ Interface Kanban interativa
✅ Upload de arquivos (fotos, vídeos, PDFs)
✅ Links para redes sociais
✅ Sistema de progresso visual
✅ Controle de permissões por usuário
✅ 5 estágios: Captação, Atração, Engajamento, Conversão, Pós-venda"

echo.
echo 4. Enviando para o GitHub...
git push origin main

echo.
echo ========================================
echo ATUALIZAÇÃO CONCLUÍDA! 🎉
echo ========================================
pause