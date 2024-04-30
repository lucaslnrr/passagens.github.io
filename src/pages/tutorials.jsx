import React, { useState } from 'react';
import step1Image from '../assets/login.png';
import p1 from '../assets/p1.png';
import p3 from '../assets/p3.png';
import p4 from '../assets/p4.png';
import p2 from '../assets/p2.png';
import p5 from '../assets/p5.png';
import p6 from '../assets/p6.png';

const Tutorials = () => {
  const [language, setLanguage] = useState('en'); // Default language is English

  const toggleLanguage = () => {
    setLanguage(prevLanguage => (prevLanguage === 'en' ? 'pt' : 'en')); // Toggle between English ('en') and Portuguese ('pt')
  };

  return (
    <div className="container mt-5">
      <div className="form-check form-switch mb-4">
        <input className="form-check-input" type="checkbox" id="languageSwitch" onChange={toggleLanguage} checked={language === 'pt'} />
        <label className="form-check-label" htmlFor="languageSwitch">
          {language === 'pt' ? 'Switch to Portuguese' : 'Mudar para Inglês'}
        </label>
      </div>
      <div className="tutorial-content">
        {language === 'en' ? (
          <>
            <h1 className="text-center mb-4">APP Tutorial</h1>
            <p>Bem vindo ao Tutorial do APP. Certifique-se que possua usuário e email corporativo cadastrado.</p>
            <h2>1º Passo: Login</h2>
            <p>Você pode estar acessando o app pelo seguinte <a href='https://guerreropassagens.web.app/'>link</a>. E será automaticamente redirecinado para a página de Login. Pode estar entrando com seu email e senha.</p>
            <img src={step1Image} alt="Step 1" className="img-fluid mb-4" />
            
            <pre className="mb-4">
              <code>Ocorrendo algum erro, poderá estar acionando o suporte, basta clicar em "Entre em contato com o suporte".</code>
            </pre>
            <h2>2º Passo: Home</h2>
            <p>Uma vez logado, será apresentado a Homepage, nela estará visualizando os pedidos solicitados dentro da tabela, poderá também estar baixando a tabela atual em xlsx, como também outras funcionalidades dentro do menu de navegação.</p>
            <img src={p1} alt="Step 1" className="img-fluid mb-4" />
            
            <pre className="mb-4">
              <code>A página "Dashboard Finalizados" está disponível apenas para administradores.</code>
            </pre>
            <h2>3º Passo: Registrar</h2>
            <p>Quando clicar no botão registrar, abrirá um modal onde deverá preencher as informações necessárias.</p>
            <img src={p3} alt="Step 1" className="img-fluid mb-4" />
            <pre className="mb-4">
              <code>O centro de custo a ser selecionado será o de despesa associado.</code>
            </pre>
            <pre className="mb-4">
              <code>É crucial que preencha adequadamente o campo de observações, registrando quaisquer informações pertinentes ao trajeto.</code>
            </pre>
            <img src={p4} alt="Step 1" className="img-fluid mb-4" />
          
            <pre className="mb-4">
              <code>Insira o CPF no campo disponível e clique na Lupa, caso o funcionário ainda não estaeja cadastrado no sistema, terá quer inserir manualmente as informações pessoais.</code>
            </pre>
            <p>Preenchido todos os campos, pode estar clicando para Enviar, será exibido uma mensagem de confirmação, e os dados estarã presentes na tabela inicial.</p>
            <img src={p5} alt="Step 1" className="img-fluid mb-4" />
            <pre className="mb-4">
              <code>Será enviado um email para o suprimentos com sua solicitação.</code>
            </pre>
            <h2>4º Passo: Editar</h2>
            <p>Clique em alguma linha da tabela inicial, e será possível vizualizar, dentro do modal, as informação da respectiva solicitação.</p>
            <img src={p2} alt="Step 1" className="img-fluid mb-4" />
            
            <pre className="mb-4">
              <code>Poderá estar baixando o PDF clicando em "Baixar".</code>
              </pre>
            <pre className="mb-4">
             <code>Somente o usuário Master tem permissão para editar e excluir pedidos.</code>
            </pre>
            <pre className="mb-4">
             <code>Caso deseje tal ação, entre em contato com o Suprimentos, justificando o pedido.</code>
            </pre>
            <pre className="mb-4">
             <code>Mediante alguma alteração por parte dos surpimentos, será enviado um email para você, referente as atualizações do ID cadastrado</code>
            </pre>
            <h2>-----------------------------------------------------------------------------</h2>
            <h2>Sugestões</h2>
            <p>Você pode estar registrando sugestões e reclamações acessando esse <a href='https://guerreropassagens.web.app/sugestao'>link</a>. Ou pelo menu, clicando em "Mais" e "Sugestões".</p>
            <img src={p6} alt="Step 1" className="img-fluid mb-4" />
            
            <pre className="mb-4">
              <code>Basta estar preenchendo a caixa de texto e enviando.</code>
            </pre>
          </>
        ) : (
          <>
            <h1 className="text-center mb-4">Tutorial do APP</h1>
            <p>Bem-vindo ao tutorial do APP! Neste tutorial, você aprenderá como acessar as funcionalidades da Plataforma.</p>
            {/* Translate the tutorial content to Portuguese */}
          </>
        )}
      </div>
    </div>
  );
};

export default Tutorials;
