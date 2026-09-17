// Arquivo isolado, sem dependências de Node.js/Prisma, para que possa ser
// importado com segurança tanto pelo middleware (Edge Runtime) quanto pelo
// código de sessão que roda em Node.js.
export const SESSION_COOKIE_NAME = "pf_session";
