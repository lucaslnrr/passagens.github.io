import React, { useState } from 'react';
import { ref, push } from 'firebase/database';
import { db } from '../utils/firebase.js';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const Sugestoes = () => {
  const [message, setMessage] = useState('');

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Send the message to Firebase
    const suggestionsRef = ref(db, 'sugestao');
    try {
      await push(suggestionsRef, {
        message: message,
        timestamp: Date.now() // Add a timestamp to track when the message was submitted
      });
      // Reset the message input field after submission
      setMessage('');
      alert('Sugestão enviada com sucesso!');
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      alert('Error');
    }
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@600;900&display=swap" rel="stylesheet" />
      <script src="https://kit.fontawesome.com/4b9ba14b0f.js" crossorigin="anonymous"></script>

      <style>{`
        body { background: #ECEFF1; color: rgba(0,0,0,0.87); font-family: 'Nunito Sans', sans-serif; margin: 0; padding: 0; }
        .mainbox { text-align: center; }
        .err { font-family: 'Nunito Sans', sans-serif; font-size: 09rem; }
        .far { font-size: 3.5rem; }
        .msg { font-size: 1.5rem; }
        #message { background: #dbdcdc; max-width: 360px; margin: 100px auto 16px; padding: 32px 24px 16px; border-radius: 3px; }
        #message h3 { color: #888; font-weight: normal; font-size: 16px; margin: 16px 0 12px; }
        #message h2 { color: #ffa100; font-weight: bold; font-size: 16px; margin: 0 0 8px; }
        #message h1 { font-size: 22px; font-weight: 300; color: rgba(0,0,0,0.6); margin: 0 0 16px;}
        #message p { line-height: 140%; margin: 16px 0 24px; font-size: 14px; }
        #message a { display: block; text-align: center; background: #039be5; text-transform: uppercase; text-decoration: none; color: white; padding: 16px; border-radius: 4px; }
        #message, #message a { box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24); }
        #load { color: rgba(0,0,0,0.4); text-align: center; font-size: 13px; }
        @media (max-width: 600px) {
          body, #message { margin-top: 0; background: white; box-shadow: none; }
          body { border-top: 16px solid #ffa100; }
        }
      `}</style>

      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <h1 className="text-center mb-4">Dicas e Sugestões</h1>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formSuggestion">
              <Form.Control
                as="textarea"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Adicione seu comentário aqui... É completamente anônimo."
                rows={5}
                required
              />
            </Form.Group>
            <div className="text-center">
            <Button type="submit" variant="dark" className="mt-3">Enviar</Button>

            </div>
          </Form>
        </Col>
      </Row>

      <div className="mainbox">
        <div id="message">
          <div className="image-container" style={{ maxWidth: '100%', maxHeight: '100%', overflow: 'hidden' }}>
            <img src="https://guerreroservicos.com.br/wp-content/uploads/2024/04/LOGO-GUERRERO-FUNDO-CLARO-4.png" alt="Page Not Found Image" style={{ width: '100%', height: 'auto' }} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Sugestoes;
