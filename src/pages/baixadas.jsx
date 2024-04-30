import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { ref, get, getDatabase, child, onValue } from 'firebase/database';
import { db } from '../utils/firebase.js';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import { formatDate } from '../dateUtil.jsx';

const Baixadas = () => {
  // State to store the data from Firebase
  const [data, setData] = useState([]);

  // Function to fetch data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      const dbRef = ref(db, 'pessoas');
      onValue(dbRef, (snapshot) => {
        const fetchedData = [];
        snapshot.forEach((childSnapshot) => {
          fetchedData.push(childSnapshot.val());
        });
        setData(fetchedData);
      });
    };

    fetchData();
  }, []);

  return (
    <div>
   
      <h1 className="text-center mt-3" style={{ color: '#024102'}}>Controle de Baixada e Férias</h1>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>RG</th>
          
         
         
            <th>CPF</th>
       
    
            <th>NOME</th>
            <th>FUNCAO</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.CARTIDENTIDADE}</td>
         
            

              <td>{item.CPF}</td>
  
       
              <td>{item.NOME}</td>
              <td>{item.NOME_FUNCAO}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default Baixadas;
