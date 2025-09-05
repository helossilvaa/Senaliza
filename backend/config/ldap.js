//config/ldap.js
import passport from 'passport'; //estrategia de autenticação
import LdapStrategy from 'passport-ldapauth'; //conecta ao servidor LDAP da escola, pegando os usuarios e senhas do Active Directory 

//Configiração do LDAP para autenticação e puxar os usuários 
const ldapOptions = {
  server: {
    url: 'ldap://10.189.87.7:389',
    bindDN: 'cn=script,ou=Funcionarios,ou=Usuarios123,dc=educ123,dc=sp,dc=senai,dc=br',
    bindCredentials: '7GFGOy4ATCiqW9c86eStgCe0RA9BgA',
    searchBase: 'ou=Alunos,ou=Usuarios123,dc=educ123,dc=sp,dc=senai,dc=br',
    searchFilter: '(sAMAccountName={{username}})'
  }
  
};


//Identificação e retorno do usuário autenticado
passport.use(new LdapStrategy(ldapOptions, (user, done) => {
  if (!user) {
    return done(null, false, { message: 'Usuário não encontrado' });
  }
  return done(null, user);
}));

//serialização (Essa função define o que será salvo na sessão do usuário autenticado), ou seja, o objeto será guardado na sessão do usuário após o login 
passport.serializeUser((user, done) => {
  done(null, user);
});

//esserialização (Essa função define como o usuário será recuperado da sessão) Ou seja, o user salvo lá na sessão volta automaticamente para ser usado no seu backend
passport.deserializeUser((user, done) => {
  done(null, user);
});

export default passport;


