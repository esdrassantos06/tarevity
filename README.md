# Tarevity - Gerenciador de Tarefas

![Tarevity Logo](public/logo.png)

Tarevity é um aplicativo moderno de gerenciamento de tarefas construído com Next.js, React, TypeScript e Supabase. Ele oferece uma interface intuitiva para ajudar usuários a organizar suas tarefas diárias com facilidade.

## 🚀 Recursos

- ✅ Gerenciamento completo de tarefas (criar, editar, excluir, marcar como concluído)
- 🔄 Filtragem de tarefas por status, prioridade e busca textual
- 🔐 Sistema de autenticação seguro (Email/Senha, Google, GitHub)
- 🌓 Modo claro/escuro com detecção automática de preferência do sistema
- 📱 Design responsivo para todos os dispositivos
- 📊 Estatísticas de tarefas no perfil do usuário
- 🔑 Recuperação de senha segura via email

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 15, React 19, TypeScript
- **Estilização**: TailwindCSS 4
- **Autenticação**: NextAuth.js
- **Backend/Database**: Supabase
- **Email**: Resend
- **Formulários**: React Hook Form, Zod
- **Outros**: date-fns, react-icons, react-hot-toast

## 📷 Screenshots

### Página Inicial
![Página Inicial](public/screenshots/home.png)

### Dashboard de Tarefas
![Dashboard](public/screenshots/dashboard.png)

### Perfil do Usuário
![Perfil](public/screenshots/profile.png)

## 🚀 Começando

### Pré-requisitos

- Node.js 18.x ou superior
- npm, yarn ou pnpm
- Conta no Supabase (para o banco de dados)
- Conta no Resend (para envio de emails)

### Instalação

1. Clone o repositório
   ```bash
   git clone https://github.com/esdrassantos06/tarevity.git
   cd tarevity
   ```

2. Instale as dependências
   ```bash
   npm install
   # ou
   yarn install
   # ou
   pnpm install
   ```

3. Configure as variáveis de ambiente
   Crie um arquivo `.env.local` na raiz do projeto e adicione as seguintes variáveis:

   ```env
   # Next Auth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=seu_segredo_super_seguro
   O segredo deve ser um hash de 32 caracteres

   # Provedores OAuth
   GITHUB_ID=seu_github_client_id
   GITHUB_SECRET=seu_github_client_secret
   GOOGLE_ID=seu_google_client_id
   GOOGLE_SECRET=seu_google_client_secret

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=sua_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=sua_supabase_service_role_key

   # Email (Resend)
   RESEND_API_KEY=sua_resend_api_key
   EMAIL_FROM=noreply@seudominio.com
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. Configure o banco de dados Supabase
   - Crie uma nova organização e projeto no Supabase
   - Execute os scripts SQL em `database/schema.sql` para criar as tabelas necessárias ou use o editor do próprio site do Supabase
   - Configure as Row Level Security (RLS) policies conforme necessário

5. Inicie o servidor de desenvolvimento
   ```bash
   npm run dev
   # ou
   yarn dev
   # ou
   pnpm dev
   ```

6. Acesse o aplicativo em [http://localhost:3000](http://localhost:3000)

## 🗃️ Estrutura do Projeto

```
/src
  /app                   # Rotas e páginas (App Router do Next.js)
    /api                 # Rotas de API
    /auth                # Páginas de autenticação
    /dashboard           # Dashboard principal
    /profile             # Perfil do usuário
    /settings            # Configurações do usuário
  /components            # Componentes React reutilizáveis
    /auth                # Componentes relacionados à autenticação
    /common              # Componentes comuns (botões, cards, etc.)
    /layout              # Layout components (header, footer, etc.)
    /profile             # Componentes de perfil
    /settings            # Componentes de configurações
    /todos               # Componentes relacionados às tarefas
  /lib                   # Utilitários e hooks
  /types                 # Definições de tipos TypeScript
```

## 📱 Recursos Planejados

- [ ] Categorias/Tags para tarefas
- [ ] Subtarefas
- [ ] Compartilhamento de tarefas
- [ ] Notificações para prazos
- [ ] Visualização em calendário
- [ ] Estatísticas avançadas
- [ ] Temas personalizados
- [ ] Exportação de dados
- [ ] Tarefas recorrentes

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

1. Faça um fork do projeto
2. Crie sua branch de feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

- **Esdras Santos** - [Github](https://github.com/esdrassantos06)

## 🙏 Agradecimentos

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Supabase](https://supabase.io/)
- [TailwindCSS](https://tailwindcss.com/)
- [NextAuth.js](https://next-auth.js.org/)