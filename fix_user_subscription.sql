-- Script para diagnosticar e corrigir o problema do usuário mmaurillio2@gmail.com

-- 1. Verificar se o usuário existe
SELECT 'Usuários encontrados:' as status;
SELECT id, email, name, "createdAt" FROM users WHERE email = 'mmaurillio2@gmail.com';

-- 2. Verificar profiles
SELECT 'Profiles encontrados:' as status;
SELECT p.id, p."userId", u.email 
FROM profiles p 
LEFT JOIN users u ON p."userId" = u.id 
WHERE u.email = 'mmaurillio2@gmail.com';

-- 3. Verificar subscriptions
SELECT 'Subscriptions encontradas:' as status;
SELECT s.id, s."userId", s.status, u.email 
FROM subscriptions s 
LEFT JOIN users u ON s."userId" = u.id 
WHERE u.email = 'mmaurillio2@gmail.com';

-- 4. Se não houver usuário, listar todos
SELECT 'Todos os usuários:' as status;
SELECT id, email, name FROM users LIMIT 10;
