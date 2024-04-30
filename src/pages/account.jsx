
import React, { useEffect, useState, useRef } from 'react';
import Modal from 'react-modal';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ref, set, onValue, remove, get,getDatabase, child} from 'firebase/database';
import { db } from '../utils/firebase';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import * as XLSX from 'xlsx';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { baixarRecord } from '../printUtil.jsx';
import { formatDate } from '../dateUtil.jsx';


Modal.setAppElement('#root');


const Account = () => {
  const searchInputRef = useRef(null);


  const [rowData, setRowData] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const [showRegistrarModalf, setShowRegistrarModalf] = useState(false);
  const [showRegistrarModal, setShowRegistrarModal] = useState(false);
  const [solicitante, setSolicitante] = useState('');
  const closeModal = () => {
    setModalIsOpen(false);
   
    setShowRegistrarModalf(false); 
    setShowRegistrarModal(false); 
  };
  const openRegistrarModal = () => {
    setShowRegistrarModal(true); 
  };
  const openRegistrarModalf = () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
        const usersRef = ref(db, 'users');
        console.log("Reference:", usersRef); // Log the reference to ensure it's correct

        get(usersRef)
            .then((snapshot) => {
                // Log the snapshot to see what data it contains

                // Check if snapshot has data
                if (snapshot.exists()) {
                    // Assuming snapshot.val() returns the data, you can check permission here
                    const data = snapshot.val();
                    

                    // Check permission logic here, for example:
                    if (data && data[user.uid]) {
                      setShowRegistrarModalf(true);
                  } else {
                      console.error('You do not have permission to access this node.');
                  }
                  
                } else {
                    console.error('Node does not exist.');
                }
            })
            .catch((error) => {
                console.error('Error fetching user data:', error);
            });
    } else {
        console.error('User is not authenticated.');
    }
};



  const updateData = () => {
    const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.error('User is not authenticated.');
    return;
  }

  const usersRef = ref(db, 'users');
  const masterRef = ref(db, 'master');

  get(child(usersRef, user.uid))
    .then((usersSnapshot) => {
      if (usersSnapshot.exists()) {
        updateBiResultData();
      } else {
        get(child(masterRef, user.uid))
          .then((masterSnapshot) => {
            if (masterSnapshot.exists()) {
              updateRecordData();
            } else {
              console.error('User does not have permission to update.');
              alert("Usuário não tem permissão para editar");
            }
          })
          .catch((error) => {
            console.error('Error checking master:', error);
          });
      }
    })
    .catch((error) => {
      console.error('Error checking users:', error);
    });
};
const updateRecordData = () => {
  if (!rowData || !rowData.__key) {
    console.error('No valid data to update.');
    return;
  }

  const { __key, ...updatedRecord } = rowData;
  const recordRef = ref(db, `records/${__key}`);
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.error('User is not authenticated.');
    return;
  }

  const usersRef = ref(db, 'master');
  get(child(usersRef, user.uid))
    .then((snapshot) => {
      if (snapshot.exists()) {
        set(recordRef, updatedRecord)
          .then(() => {
            console.log('Record updated successfully!');
            closeModal();
          })
          .catch((error) => {
            console.error('Error updating record:', error);
          });
      } else {
        console.error('You do not have permission to update this record.');
      }
    })
    .catch((error) => {
      console.error('Error fetching user data:', error);
    });
};
const updateBiResultData = () => {
  if (!rowData || !rowData.__key || !rowData.biResult || !rowData.solicitante) {
    console.error('No valid data to update.');
    return;
  }

  const { __key, biResult, solicitante, firstobs } = rowData;
  const biResultRef = ref(db, `records/${__key}/biResult`);
  const firstobsRef = ref(db, `records/${__key}/firstobs`);
  const auth = getAuth();
  const user = auth.currentUser;
  const customKey = rowData.__key;

  if (!user) {
    console.error('User is not authenticated.');
    return;
  }

  const usersRef = ref(db, 'users');
  get(child(usersRef, user.uid))
    .then((snapshot) => {
      if (snapshot.exists()) {
        set(biResultRef, biResult)
          .then(() => {
            console.log('biResult updated successfully!');
          })
          .catch((error) => {
            console.error('Error updating biResult:', error);
          });

        set(firstobsRef, firstobs)
          .then(() => {
            console.log('firstobs updated successfully!');
            
            alert('Status Atualizado');
            closeModal();    
            if (biResult === 'Finalizado') {
              setShowRegistrarModalf(customKey);
            }
             const baseurlb = process.env.REACT_APP_BASEURLB;
            fetch(`${baseurlb}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ customKey, biResult, solicitante, firstobs }),
            })
              .then((response) => {
                console.log('enviou');
                if (!response.ok) {
                  throw new Error('Network response was not ok');
                }
                return response.json();
              })
              .then((data) => {
    
              })
              .catch((error) => {
                console.error('Error sending updated data to server:', error);
              });
          })
          .catch((error) => {
            console.error('Error updating firstobs:', error);
          });
      } else {
        alert('Você não tem permissão para editar dados');
        console.error('You do not have permission to update this field.');
      }
    })
    .catch((error) => {
      console.error('Error fetching user data:', error);
    });
};
  
  
  const currentDateUTC = new Date(); // Get current date in UTC
  currentDateUTC.setHours(currentDateUTC.getHours() - 3); // Adjust for Brazilian time zone
  
  const currentDate = currentDateUTC.toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
  
  // Update the input field with ID 'datasolicitacao'
  const dateInput = document.getElementById('datasolicitacao');
  if (dateInput) {
    dateInput.value = currentDate;
  }
  const generateCustomKey = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    // Format the date and time components into a single string
    const key = `${day}${month}${year}_${hours}${minutes}${seconds}`;
    return key;
  };
  const tableRef = useRef(null); // Create a ref for the Tabulator instance

  // ... other state and functions ...

  const downloadExcel = () => {
    if (tableRef.current) {
      const table = tableRef.current.table;

      if (table) {
        const tableData = table.getData();

        const worksheet = XLSX.utils.json_to_sheet(tableData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'My Data');

        XLSX.writeFile(workbook, 'data.xlsx');
      }
    }
  };
  
// Memoized functions
const filterRecordsByEmail = (records, userEmail) => {
  const filteredRecords = records.filter(([key, value]) => value.solicitante === userEmail);
  return filteredRecords.map(([key, value]) => ({
    __key: key,
    ...value,
  }));
};

const fetchData = (user, userEmail, setRowData, initializeTabulator, db) => {
  const recordsRef = ref(db, 'records');
  const usersRef = ref(db, 'users');
  const masterRef = ref(db, 'master');

  onValue(recordsRef, (snapshot) => {
    const data = snapshot.val();
    const records = data ? Object.entries(data) : [];
    const mappedDataMaster = records.map(([key, value]) => ({
      __key: key,
      ...value,
    }));

    get(child(usersRef, user.uid))
      .then((snapshot) => {
        if (snapshot.exists()) {
          setRowData(mappedDataMaster);
          initializeTabulator(mappedDataMaster);
        } else {
          get(child(masterRef, user.uid)).then((masterSnapshot) => {
            if (masterSnapshot.exists()) {
              setRowData(mappedDataMaster);
              initializeTabulator(mappedDataMaster);
            } else {
              const filteredData = filterRecordsByEmail(records, userEmail);
              setRowData(filteredData);
              initializeTabulator(filteredData);
            }
          });
        }
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
      });
  });
};

useEffect(() => {
  const auth = getAuth();
  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (user) {
      const userEmail = user.email;
      setSolicitante(userEmail);

      fetchData(user, userEmail, setRowData, initializeTabulator, db);
    } else {
      setSolicitante('');
    }
  });

  return () => {
    unsubscribeAuth();
  };
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  
  const initializeTabulator = (data) => {
    const table = new Tabulator('#data-table', {
        height: 'fitDataFill',
        layout: 'fitColumns',
        pagination: 'local',
        paginationSize: 12,
        paginationSizeSelector: [10, 15, 20, 30, 50, 100,500],
        movableColumns: true,
        paginationCounter: 'rows',
        virtualDom: true, // Enable virtual DOM rendering
    virtualDomBuffer: 50,
        index: '__key',
        columns: [
          {title:"ID", field:"__key",visible:true, download:true},  
              {title:"Nome", field:"firstName"},
              {
                title: "Data Solicitação",
                field: "datasolicitacao",
            
                formatter: function(cell, formatterParams, onRendered) {
                    return formatDate(cell.getValue());
                }
            },{title:"Obra", field:"diagGroup", headerFilter:true,visible:false, download:true },
              {title:"Função", field:"funcao",visible:true, download:true},          
              {title:"Data Volta", field:"datavolta",visible:false, download:true},
              {title:"Data Início", field:"datainicio",visible:false, download:true},
              {title:"Data Final", field:"datafinal",visible:false, download:true},
              {title:"Status", field:"biResult", formatter: function(cell, formatterParams, onRendered) {
                const cellValue = cell.getValue();
                const cellColor = 'white';
                const cellBackgroundColor = cellValue === 'Solicitado'? 'red' : cellValue === 'Rejeitado'? 'grey' : cellValue === 'Andamento'? 'orange' : cellValue === 'Finalizado'? 'green' : 'black';
                return `<div style="background-color: ${cellBackgroundColor}; color: ${cellColor};">${cellValue}</div>`;
              }},
              {
                title: "Data Ida",
                field: "dataida",
                formatter: function(cell, formatterParams, onRendered) {
                    return formatDate(cell.getValue());
                }
            },
              {title:"Data Volta", field:"datavolta",visible:false, download:true},
              {title:"CPF", field:"firstcpf",visible:false, download:true},
              {title:"RG", field:"firstrg",visible:false, download:true},
              {title:"firstobs", field:"firstobs",visible:false, download:true},
              {title:"passvolta", field:"passvolta",visible:false, download:true},
              {title:"Nascimento", field:"nascimento",visible:false, download:true},            
              {title:"cidadedestino", field:"cidadedestino",visible:false, download:true},
              {title:"cidadeorigem", field:"cidadeorigem",visible:false, download:true},
              {title:"Van/Ônibus", field:"van",visible:false, download:true},
              {title:"Cidade Origem", field:"cidadeorigemv",visible:false, download:true},
              {title:"Cidade Destino", field:"cidadedestinov",visible:false, download:true},
              {title:"Uber", field:"uber",visible:false, download:true},
              {title:"Maritmo", field:"maritmo",visible:false, download:true},
              {title:"Cidade Origem", field:"cidadeorigemm",visible:false, download:true},
              {title:"Cidade Destino", field:"cidadedestinom",visible:false, download:true},
              {title:"Uber", field:"uberm",visible:false, download:true},
              {title:"Solicitante", field:"solicitante",visible:true, download:true}
            ],
          });
  
    table.on('rowClick', (e, row) => {
      const rowData = row.getData();
      setRowData(rowData);
      setModalIsOpen(true);
    }); 
    tableRef.current = { table }; 
    table.on('tableBuilt', () => {
      table.setData(data, { sort:[{column:'datasolicitacao', dir:'asc'}] });
    });
  };
  const submitFormDataToFirebase = (formData) => {
    const customKey = generateCustomKey();
    const newRecordRef = ref(db, `records/${customKey}`);
    const cidadeRegex = /\/[A-Z]{2}$/;

    // Check if any required field is missing
    if (!formData.motivo || !formData.diagGroup || !formData.dataida || !formData.passvolta || !formData.cidadeorigem || !formData.cidadedestino || !formData.firstName || !formData.firstcpf || !formData.firstrg || !formData.nascimento || !formData.firstobs ) {
      alert('Estão faltando dados obrigatórios');
      return;
    }

    // Check if cidadeorigem meets the required format
    if (!cidadeRegex.test(formData.cidadeorigem)) {
      alert('A cidade de origem deve terminar com uma barra "/" seguida por duas letras maiúsculas.');
      return;
    }

    // Check if cidadedestino meets the required format
    if (!cidadeRegex.test(formData.cidadedestino)) {
      alert('A cidade de destino deve terminar com uma barra "/" seguida por duas letras maiúsculas.');
      return;
    }
    set(newRecordRef, formData)
      .then(() => {
        console.log('Data added to Firebase successfully!');
        alert('Solicitação enviada com sucesso!')
        const auth = getAuth();
        const user = auth.currentUser;
        const userEmail = user ? user.email : null;
        const baseurla = process.env.REACT_APP_BASEURLA;
fetch(`${baseurla}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ customKey, formData, userEmail }),
        })
        .then(response => {
          if (response.ok) {
            console.log('Email sent successfully!');
            alert("Email enviado!");
            
          } else {
            console.error('Failed to send email.');
          }
        })
        .catch(error => {
          console.error('Error sending email:', error);
        });
        closeModal();
      })
      .catch(error => {
        console.error('Error adding data to Firebase:', error);
      });
 };
 const submitFormDataToFirebasef = (formData) => {
  const customKey = generateCustomKey();
  const newRecordRef = ref(db, `controlecustos/${customKey}`);

  if (!formData.idcompra ||!formData.comprador ||!formData.datacompra ||!formData.custototal ) {
    alert('Estão faltando dados obrigatórios');
    return;
  }

  set(newRecordRef, formData)
   .then(() => {
      console.log('Data added to Firebase successfully!');
      alert('Enviado!')
      closeModal();
    })
   .catch(error => {
      console.error('Error adding data to Firebase:', error);
    });
};
 const handleSearch = () => {
  const searchTerm = searchInputRef.current.value.trim().toLowerCase(); // Get the search term


  if (tableRef.current && tableRef.current.table) {
    tableRef.current.table.setFilter(function (data) {
      return (
        data.motivo.toLowerCase().includes(searchTerm) ||
        data.biResult.toLowerCase().includes(searchTerm) ||
        data.firstName.toLowerCase().includes(searchTerm) ||
        data.solicitante.toLowerCase().includes(searchTerm) ||
        formatDate(data.datasolicitacao).toLowerCase().includes(searchTerm) ||
        data.__key.toLowerCase().includes(searchTerm) 
        
      );
    });
  }
};




  const deleteRecord = () => {
    if (!rowData || !rowData.__key) {
      console.error('No valid data to delete.');
      return;
    }
  
    const { __key } = rowData;
    const recordRef = ref(db, `records/${__key}`);
  
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (!user) {
      console.error('User is not authenticated.');
      return;
    }
  
    const usersRef = ref(db, 'master');
    get(child(usersRef, user.uid))
      .then((snapshot) => {
        if (snapshot.exists()) {
          // If the user's UID exists in 'users', proceed with deletion
          remove(recordRef)
            .then(() => {
              console.log('Record deleted successfully!');
              alert('Deletado com sucesso!');
              closeModal();
            })
            .catch((error) => {
              console.error('Error deleting record:', error);
            });
        } else {
          alert('Você não tem permissão para deletar');
          console.error('You do not have permission to delete this record.');
          // Handle the lack of permission, e.g., display a message to the user
        }
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
      });
  };
const handleClickDownload = () => {
  const formData = rowData;
  baixarRecord(rowData, formData);
};
const calculateTotal = () => {
  const custoa = parseFloat(document.getElementById('custoa').value) || 0;
  const custot = parseFloat(document.getElementById('custot').value) || 0;
  const custom = parseFloat(document.getElementById('custom').value) || 0;
  const custoo = parseFloat(document.getElementById('custoo').value) || 0;

  const custototal = custoa + custot + custom + custoo;

  // Update the value of the custototal input
  document.getElementById('custototal').value = custototal;
};

const [rg, setRg] = useState('');
const [firstName, setFirstName] = useState('');
const [funcao, setFuncao] = useState('');
const [nascimento, setNascimento] = useState('');

const fillData = () => {
  const cpf = document.getElementById('firstcpf').value;
  const db = getDatabase();
  const pessoasRef = ref(db, 'pessoas');

  get(pessoasRef).then((snapshot) => {
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const pessoa = childSnapshot.val();
        if (pessoa.CPF=== cpf) {
          setRg(pessoa.CARTIDENTIDADE);
          setFirstName(pessoa.NOME);
          setFuncao(pessoa.NOME_FUNCAO);
          setNascimento(pessoa.DTNASCIMENTO);
          return; // Exit the loop once a match is found
        }
      });
    } else {
      console.log("No data available");
    }
  }).catch((error) => {
    console.error("Error getting document:", error);
  });
  };
return (
  <>
    {/* Registrar Modal */}
    <Modal 
  isOpen={showRegistrarModal}
  onRequestClose={closeModal}
  contentLabel="Registrar Modal"
  style={{
    content: {
      size:'80%',
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      maxWidth: '95%', // Adjust the maximum width as needed
      maxHeight: '80%', // Set the maximum height to enable scrolling
      height: 'auto', // Allow the height to adjust based on content
      width: 'auto', // Allow the height to adjust based on content
      padding: '10px', // Reduce padding
      backgroundColor: 'white',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
     
    }
  }}
>
  <div className="modal-content" >
    {/* Content for the registrar modal */}
    
    {/* Dados Passagem */}
    <h5 className="section-title" style={{ textAlign: 'center', padding: '10px', color:'#024102' }}>Dados Passagem</h5>
    <Form>
    <Row className="mb-3" style={{backgroundColor: '#e9ecef', padding: '10px'}}>
      {/* Data Solicitação */}
      <Form.Group as={Col} xs={12} md={3} style={{ marginBottom: '1rem' }}>
        <Form.Label>Data Solicitação</Form.Label>
        <Form.Control type="date" id="datasolicitacao" disabled value={currentDate} size="sm" />
      </Form.Group>
      
      {/* Motivo */}
      <Form.Group as={Col} xs={12} md={3} style={{ marginBottom: '1rem' }}>
        <Form.Label>Motivo</Form.Label>
        <Form.Select id="motivo" size="sm">
          <option selected></option>
          <option value="Baixada">Baixada</option>
    <option value="Férias">Férias</option>
    <option value="Outros">Outros</option>
    <option value="Licença">Licença</option>
    <option value="Mobilização">Mobilização</option>
    <option value="Transferência">Transferência</option>
    <option value="Admissão">Admissão</option>
    <option value="Demissão">Demissão</option>
        </Form.Select>
      </Form.Group>
      
      {/* Passagem de Volta */}
      <Form.Group as={Col} xs={12} md={3} style={{ marginBottom: '1rem' }}>
        <Form.Label>Passagem de Volta</Form.Label>
        <Form.Select id="passvolta" size="sm">
          <option selected></option>
          <option value="sim">sim</option>
    <option value="nao">nao</option>

        </Form.Select>
      </Form.Group>
         {/* Resultado Biológico */}
         <Form.Group as={Col} xs={12} md={3} style={{ marginBottom: '1rem' }}>
        <Form.Label>Status</Form.Label>
        <Form.Select id="biResult" disabled size="sm">
       
          <option value="Solicitado">Solicitado</option>
    <option value="Andamento">Andamento</option>
    <option value="Rejeitado">Rejeitado</option>
    <option value="Cancelado">Cancelado</option>
    <option value="Finalizado">Finalizado</option>
        </Form.Select>
      </Form.Group>
    </Row>

    {/* Second row */}
    <Row className="mb-3" style={{padding: '10px'}}>
   {/* Solicitante */}
   <Form.Group as={Col} xs={12} md={6} style={{ marginBottom: '1rem' }}>
        <Form.Label>Solicitante</Form.Label>
        <Form.Control type="text" id="solicitante" disabled value={solicitante} size="sm" />
      </Form.Group>
   
      <Form.Group as={Col} xs={12} md={6} style={{ marginBottom: '1rem' }}>
        <Form.Label>Centro de Custo <span style={{ color: 'red', fontSize:'12px'}}> *CC despesa associado</span></Form.Label>
        <Form.Select id="diagGroup"  size="sm" >
   
  <option value="1 - ADMINISTRAÇAO CENTRAL">1 - ADMINISTRAÇAO CENTRAL</option>
    <option value="2 - ADMINISTRAÇAO BASE LOCAL - ALAGOAS">2 - ADMINISTRAÇAO BASE LOCAL - ALAGOAS</option>
    <option value="3 - ADMINISTRAÇAO BASE LOCAL - RIO GRANDE DO SUL">3 - ADMINISTRAÇAO BASE LOCAL - RIO GRANDE DO SUL</option>
    <option value="11 - BRUNO GUERRERO">11 - BRUNO GUERRERO</option>
    <option value="12 - VICTOR GUERRERO">12 - VICTOR GUERRERO</option>
    <option value="13 - ROMINO GUERRERO">13 - ROMINO GUERRERO</option>
    <option value="14 - ROMEL GUERRERO">14 - ROMEL GUERRERO</option>
    <option value="15 - CUSTOS GERAL DE OBRAS">15 - CUSTOS GERAL DE OBRAS</option>
    <option value="98 - LT 230 KV MARITUBA / UTINGA - LIG GLOBAL">98 - LT 230 KV MARITUBA / UTINGA - LIG GLOBAL</option>
    <option value="99 - PATRIMONIO CENTRAL">99 - PATRIMONIO CENTRAL</option>
    <option value="100 - GUERRERO LOCACOES">100 - GUERRERO LOCACOES</option>
    <option value="101 - SISTEMA CASTANHAL - EQUATORIAL PA">101 - SISTEMA CASTANHAL - EQUATORIAL PA</option>
    <option value="102 - MANUTENCOES - SE's NORTE MARANHAO">102 - MANUTENCOES - SE's NORTE MARANHAO</option>
    <option value="103 - SISTEMA NORTE ALAGOAS - EQUATORIAL AL">103 - SISTEMA NORTE ALAGOAS - EQUATORIAL AL</option>
    <option value="104 - SUBESTAÇÃO BATISTA CAMPOS- EQUATORIAL PA">104 - SUBESTAÇÃO BATISTA CAMPOS- EQUATORIAL PA</option>
    <option value="105 - LD 69kV TORRES 2 - 5,4KM - EQUATORIAL RS">105 - LD 69kV TORRES 2 - 5,4KM - EQUATORIAL RS</option>
    <option value="106 - LPU LD 69 KV VIA MAO - AGUAS CLARAS - EQUATORIAL RS">106 - LPU LD 69 KV VIA MAO - AGUAS CLARAS - EQUATORIAL RS</option>
    <option value="107 - DESATIVAÇAO LD 69KV ANGELIM X VIÇOSA - EQUATORIAL AL">107 - DESATIVAÇAO LD 69KV ANGELIM X VIÇOSA - EQUATORIAL AL</option>
    <option value="108 - LD 69 KV MATRIZ DE CAMARAGIBE / PORTO CALVO - EQUATORIAL AL">108 - LD 69 KV MATRIZ DE CAMARAGIBE / PORTO CALVO - EQUATORIAL AL</option>
    <option value="109 - LD 69KV RIO LARGO II / CIDADE UNIVERSITARIA - EQUATORIAL AL">109 - LD 69KV RIO LARGO II / CIDADE UNIVERSITARIA - EQUATORIAL AL</option>
    <option value="110 - LD 69KV PORTO CALVO I MARAGOGI - EQUATORIAL AL">110 - LD 69KV PORTO CALVO I MARAGOGI - EQUATORIAL AL</option>
    <option value="111 - LPU - PACOTE 24 - EQUATORIAL/AL">111 - LPU - PACOTE 24 - EQUATORIAL/AL</option>
    <option value="112 - LD 69 KV PAL 14 I DEMAE - 8,3 KM - EQUATORIAL RS">112 - LD 69 KV PAL 14 I DEMAE - 8,3 KM - EQUATORIAL RS</option>
    <option value="113 - LD 69 KV RESTINGA - PAL 14 4,7 KM - EQUATORIAL/RS">113 - LD 69 KV RESTINGA - PAL 14 4,7 KM - EQUATORIAL/RS</option>
    <option value="114 - LD 69KV PAL 8 I PAL 17 - 2,9 KM - EQUATORIAL/RS">114 - LD 69KV PAL 8 I PAL 17 - 2,9 KM - EQUATORIAL/RS</option>
    <option value="115 - LT 138 KV - TESTA BRANCA - TABULEIROS II - SUBST. E-13 e E-14  - OMEGA ENERGIA">115 - LT 138 KV - TESTA BRANCA - TABULEIROS II - SUBST. E-13 e E-14  - OMEGA ENERGIA</option>
    <option value="116 - OBRA LD SSMC PEP - LUZIAPOLIS - EQUATORIAL AL">116 - OBRA LD SSMC PEP - LUZIAPOLIS - EQUATORIAL AL</option>
    <option value="117 - LPU UNIAO DOS PALMARES - EQUATORIAL AL">117 - LPU UNIAO DOS PALMARES - EQUATORIAL AL</option>
    <option value="118 - SERVIÇOS EXTRAS REGIONAL PARÁ - EQUATORIAL PA">118 - SERVIÇOS EXTRAS REGIONAL PARÁ - EQUATORIAL PA</option>
    <option value="120 - SERVIÇOS EXTRAS REGIONAL ALAGOAS - EQUATORIAL AL">120 - SERVIÇOS EXTRAS REGIONAL ALAGOAS - EQUATORIAL AL</option>
    <option value="121 - UTINGA - POLIMIX PARA">121 - UTINGA - POLIMIX PARA</option>
    <option value="122 - LD 69 KV OLHO DAGUA DAS FLORES - JACARÉ DOS HOMENS - EQUATORIAL AL">122 - LD 69 KV OLHO DAGUA DAS FLORES - JACARÉ DOS HOMENS - EQUATORIAL AL</option>
    <option value="123 - SERVIÇOS EXTRAS - REGIONAL RIO GRANDE DO SUL - EQUATORIAL">123 - SERVIÇOS EXTRAS - REGIONAL RIO GRANDE DO SUL - EQUATORIAL</option>
    <option value="124 - SERVIÇOS EXTRAS REGIONAL MARANHAO - EQUATORIAL MA">124 - SERVIÇOS EXTRAS REGIONAL MARANHAO - EQUATORIAL MA</option>
    <option value="125 - LD 138 KV PCH RETIRO VELHO SD CHAPADÃO DO SUL - BRASIL PCH">125 - LD 138 KV PCH RETIRO VELHO SD CHAPADÃO DO SUL - BRASIL PCH</option>
    <option value="126 - COMERCIAL / ENGENHARIA GUERRERO CONSTRUTORA">126 - COMERCIAL / ENGENHARIA GUERRERO CONSTRUTORA</option>
    <option value="127 - AREA DE CONVIVENCIA">127 - AREA DE CONVIVENCIA</option>
    <option value="128 - SE 138kV SALSO - EQUATORIAL RS">128 - SE 138kV SALSO - EQUATORIAL RS</option>
    <option value="129 - LD 138kV CAPIVARI DO SUL - EQUATORIAL RS">129 - LD 138kV CAPIVARI DO SUL - EQUATORIAL RS</option>
    <option value="130 - OBRA LD 69KV ARAPIRACA - CRAÍBAS - EQUATORIAL AL">130 - OBRA LD 69KV ARAPIRACA - CRAÍBAS - EQUATORIAL AL</option>
    <option value="131 - OBRA COMPOSIÇAO LD 69 KV PAL 14 I DEMAE - 8,3 KM - EQUATORIAL RS">131 - OBRA COMPOSIÇAO LD 69 KV PAL 14 I DEMAE - 8,3 KM - EQUATORIAL RS</option>
    <option value="132 - CONSTRUÇAO SE PORTO ALEGRE 17 - EQUATORIAL PORTO ALEGRE RS">132 - CONSTRUÇAO SE PORTO ALEGRE 17 - EQUATORIAL PORTO ALEGRE RS</option>
    <option value="133 - AMPLIAÇAO SE PORTO ALEGRE 14 - EQUATORIAL PORTO ALEGRE RS">133 - AMPLIAÇAO SE PORTO ALEGRE 14 - EQUATORIAL PORTO ALEGRE RS</option>
    <option value="134 - CONSTRUÇAO SE DMAE - EQUATORIAL PORTO ALEGRE RS">134 - CONSTRUÇAO SE DMAE - EQUATORIAL PORTO ALEGRE RS</option>
    <option value="135 - LD 69 KV MARECHAL DEODORO / BARRA DE SÃO MIGUEL - EQUATORIAL/AL">135 - LD 69 KV MARECHAL DEODORO / BARRA DE SÃO MIGUEL - EQUATORIAL/AL</option>
    <option value="136 - NOVO BAY 230KV SE ALBRÁS E SE ALUNORTE - HYDRO ALLUNORTE">136 - NOVO BAY 230KV SE ALBRÁS E SE ALUNORTE - HYDRO ALLUNORTE</option>
    <option value="137 - LT 230 KV ALBRAS - HYDRO ALUNORTE">137 - LT 230 KV ALBRAS - HYDRO ALUNORTE</option>
    <option value="138 - CONTENÇÃO DE ESTRUTURA 60/3 LD MRA X TMA - EQUATORIAL MA">138 - CONTENÇÃO DE ESTRUTURA 60/3 LD MRA X TMA - EQUATORIAL MA</option>
    <option value="139 - LD 69KV MATRIZ DE CAMARAGIBE / COSTA DOS CORAIS - EQUATORIAL AL">139 - LD 69KV MATRIZ DE CAMARAGIBE / COSTA DOS CORAIS - EQUATORIAL AL</option>
    <option value="140 - LD 69kV DELMIRO GOLVEIA - OLHO DAGUA DAS FLORES - EQUATORIAL AL">140 - LD 69kV DELMIRO GOLVEIA - OLHO DAGUA DAS FLORES - EQUATORIAL AL</option>
    <option value="141 - CONSTRUÇÃO SE BAGÉ 3 - EQUATORIAL RS">141 - CONSTRUÇÃO SE BAGÉ 3 - EQUATORIAL RS</option>
    <option value="142 - RENOVAÇÃO SE BAGÉ 1 - EQUATORIAL RS">142 - RENOVAÇÃO SE BAGÉ 1 - EQUATORIAL RS</option>
    <option value="143 - RENOVAÇÃO SE RIO GRANDE 1 - EQUATORIAL RS">143 - RENOVAÇÃO SE RIO GRANDE 1 - EQUATORIAL RS</option>
    <option value="144 - AMPLIAÇÃO SE SANTA VITÓRIA DO PALMAR - EQUATORIAL RS">144 - AMPLIAÇÃO SE SANTA VITÓRIA DO PALMAR - EQUATORIAL RS</option>
    <option value="145 - AMPLIAÇÃO SE TAIM 1 - EQUATORIAL RS">145 - AMPLIAÇÃO SE TAIM 1 - EQUATORIAL RS</option>
    <option value="146 - LD 138 KV OEIRAS X CAMETA - EQTL PARA">146 - LD 138 KV OEIRAS X CAMETA - EQTL PARA</option>
    <option value="147 - LD 69KV SÃO MIGUEL DOS CAMPOS X PERIPERI - EQUATORIAL AL">147 - LD 69KV SÃO MIGUEL DOS CAMPOS X PERIPERI - EQUATORIAL AL</option>
    <option value="148 - LPU AMAPÁ - EQUATORIAL AP">148 - LPU AMAPÁ - EQUATORIAL AP</option>
    <option value="149 - LT 69 KV CALHEIROS - BRASIL PCH - RJ">149 - LT 69 KV CALHEIROS - BRASIL PCH - RJ</option>              
    <option value="150 - LT PCH PIRAPETINGA X SE ITAPERUNA - ESSENTIA ENERGIA">150 - LT PCH PIRAPETINGA X SE ITAPERUNA - ESSENTIA ENERGIA</option>              
    <option value="151 - LD 69KV CAM1 - CAM3 - RS">151 - LD 69KV CAM1 - CAM3 - RS</option>      
       </Form.Select>
      </Form.Group>

    
    
    </Row>

    {/* Third row */}
    <Row className="mb-3" style={{ backgroundColor: '#e9ecef', padding: '10px' }}>
        {/* Data Ida */}
        <Form.Group as={Col} xs={12} md={3} style={{ marginBottom: '1rem' }}>
        <Form.Label>Data Ida</Form.Label>
        <Form.Control type="date" id="dataida" size="sm" />
      </Form.Group>
      {/* Data Volta */}
      <Form.Group as={Col} xs={12} md={3} style={{ marginBottom: '1rem' }}>
        <Form.Label>Data Volta</Form.Label>
        <Form.Control type="date" id="datavolta" size="sm" />
      </Form.Group>
   
      {/* Cidade Origem */}
 <Form.Group as={Col} xs={12} md={3} style={{ marginBottom: '1rem' }}>
  <Form.Label>Cidade Origem</Form.Label>
  <Form.Control type="text" id="cidadeorigem" size="sm" placeholder="Cidade/UF" />
</Form.Group>

      {/* Cidade Destino */}
      <Form.Group as={Col} xs={12} md={3} style={{ marginBottom: '1rem' }}>
        <Form.Label>Cidade Destino</Form.Label>
        <Form.Control type="text" id="cidadedestino" placeholder="Cidade/UF" size="sm" />
      </Form.Group>
    </Row>
 
    {/* Fourth row */}
    <Row className="mb-3" style={{ padding: '10px' }}>
 
   
      
      {/* Observações */}
      <Form.Group as={Col} xs={12} md={12} style={{ marginBottom: '1rem' }}>
    <Form.Label>Observações<span style={{ color: 'red', fontSize:'12px'}}> *</span></Form.Label>
    <Form.Control
      as="textarea"
      id="firstobs"
      placeholder="Por favor, indique se haverá necessidade de transporte para o deslocamento, especificando se será utilizado van, uber, ônibus ou transporte marítimo, e forneça quaisquer outras informações relevantes sobre o translado."
      style={{ height: '2.4cm' }} // Set the height to 5cm
    />
  </Form.Group>
    </Row>
    <h5 className="section-title" style={{ textAlign: 'center' , padding: '10px', color:'#024102'}}>Informações Pessoais</h5>
    {/* Fifth row */}
    <Row className="mb-3" style={{ backgroundColor: '#e9ecef', padding: '10px' }}>
      {/* Nome Completo */}
      <Form.Group as={Col} xs={12} md={4} style={{ marginBottom: '1rem' }}>
        <Form.Label>Nome Completo</Form.Label>
        <Form.Control type="text" id="firstName" size="sm" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
      </Form.Group>
      
      {/* RG */}
      <Form.Group as={Col} xs={12} md={4} style={{ marginBottom: '1rem' }}>
        <Form.Label>RG</Form.Label>
        <Form.Control type="text" id="firstrg" size="sm" value={rg} onChange={(e) => setRg(e.target.value)} />
      </Form.Group>

      {/* CPF */}
      <Form.Group as={Col} xs={12} md={4} style={{ marginBottom: '1rem' }}>
        <Form.Label htmlFor="firstcpf">CPF</Form.Label>
        <div className="input-group">
          <Form.Control type="text" id="firstcpf" size="sm" className="form-control" />
          <Button variant="secondary" type="button" className="btn btn-primary" onClick={fillData}>
            <i className="fas fa-search"></i>
          </Button>
        </div>
      </Form.Group>

      {/* Data de Nascimento */}
      <Form.Group as={Col} xs={12} md={4} style={{ marginBottom: '1rem' }}>
        <Form.Label>Data de Nascimento</Form.Label>
        <Form.Control type="date" id="nascimento" size="sm" value={nascimento} onChange={(e) => setNascimento(e.target.value)} />
      </Form.Group>

      {/* Função */}
      <Form.Group as={Col} xs={12} md={4} style={{ marginBottom: '1rem' }}>
        <Form.Label>Função</Form.Label>
        <Form.Control type="text" id="funcao" size="sm" value={funcao} onChange={(e) => setFuncao(e.target.value)} />
      </Form.Group>
      <button
  type="button"
  style={{ textAlign: 'center' , marginTop:'20px'}}
  className="btn btn-primary btn-dark rounded"
  id="submit-button-class"
  onClick={() => {
    
    const formData = {
      // Dados Passagem
      datasolicitacao: document.getElementById('datasolicitacao').value,
      motivo: document.getElementById('motivo').value,
      passvolta: document.getElementById('passvolta').value,
      
      
      diagGroup: document.getElementById('diagGroup').value,
      biResult: document.getElementById('biResult').value,
      dataida: document.getElementById('dataida').value,
      datavolta: document.getElementById('datavolta').value,
      cidadeorigem: document.getElementById('cidadeorigem').value,
      cidadedestino: document.getElementById('cidadedestino').value,
      solicitante: document.getElementById('solicitante').value,
      firstobs: document.getElementById('firstobs').value,
    
      // Informações Pessoais
      firstName: document.getElementById('firstName').value,
      firstrg: document.getElementById('firstrg').value,
      firstcpf: document.getElementById('firstcpf').value,
      nascimento: document.getElementById('nascimento').value,
      funcao: document.getElementById('funcao').value,
  
    
   
      // Repeat for all other fields...
    };
    
    submitFormDataToFirebase(formData);
      

  }}

>
  Enviar
</button>
    </Row>

  




      {/* Add Form.Group for each field */}
      {/* Replace the placeholders and labels as needed */}
      
      

    </Form>
    
  </div>

</Modal>
    <Modal 
  isOpen={showRegistrarModalf}
  onRequestClose={closeModal}
  contentLabel="Registrar Modal"
  style={{
    content: {
      size:'80%',
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      maxWidth: '50%', // Adjust the maximum width as needed
      maxHeight: '80%', // Set the maximum height to enable scrolling
      height: 'auto', // Allow the height to adjust based on content
      width: 'auto', // Allow the height to adjust based on content
      padding: '10px', // Reduce padding
      backgroundColor: 'white',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
     
    }
  }}
>
  <div className="modal-content" >
    {/* Content for the registrar modal */}
    
    {/* Dados Passagem */}
    <h5 className="section-title" style={{ textAlign: 'center', padding: '10px', color:'#024102' }}>Dados da Compra Passagem</h5>
    <span style={{ color: 'red', fontSize:'12px'}}> *Todos os campos são obrigatórios</span>
    <Form>
    <Row className="mb-3" style={{backgroundColor: '#e9ecef', padding: '10px'}}>
      {/* ID */}
      <Form.Group as={Col} xs={12} md={3} style={{ marginBottom: '1rem' }}>
        <Form.Label>ID</Form.Label>
        <Form.Control type="text" id="idcompra"  size="sm" />
      </Form.Group>
      
      {/* Data Solicitação */}
      <Form.Group as={Col} xs={12} md={3} style={{ marginBottom: '1rem' }}>
        <Form.Label>Data Compra</Form.Label>
        <Form.Control type="date" id="datacompra" size="sm" />
      </Form.Group>
      
      {/* Comprador */}
      <Form.Group as={Col} xs={12} md={3} style={{ marginBottom: '1rem' }}>
        <Form.Label>Comprador</Form.Label>
        <Form.Select id="comprador" size="sm">
          <option selected></option>
          <option value="Jackson">Jackson</option>
    <option value="Drielly">Drielly</option>
        </Form.Select>
      </Form.Group>
      <Form.Group as={Col} xs={12} md={3} style={{ marginBottom: '1rem' }}>
        <Form.Label>Emergencial?</Form.Label>
        <Form.Select id="emergencial" size="sm">
          <option selected></option>
          <option value="Sim">Sim</option>
    <option value="Não">Não</option>
        </Form.Select>
      </Form.Group>
      </Row>
      <h5 className="section-title" style={{ textAlign: 'center', padding: '10px', color:'#0b3067' }}>Custos</h5>
      <Row className="mb-3" style={{backgroundColor: '#e9ecef', padding: '10px'}}>
     {/* Data Solicitação */}
     <Form.Group as={Col} xs={12} md={2} style={{ marginBottom: '1rem' }}>
    <Form.Label>Aéreo</Form.Label>
    <Form.Control type="number" id="custoa" size="sm" onChange={calculateTotal} />
</Form.Group>

<Form.Group as={Col} xs={12} md={2} style={{ marginBottom: '1rem' }}>
    <Form.Label>Terrestre</Form.Label>
    <Form.Control type="number" id="custot" size="sm" onChange={calculateTotal} />
</Form.Group>

<Form.Group as={Col} xs={12} md={2} style={{ marginBottom: '1rem' }}>
    <Form.Label>Marítimo</Form.Label>
    <Form.Control type="number" id="custom" size="sm" onChange={calculateTotal} />
</Form.Group>

<Form.Group as={Col} xs={12} md={2} style={{ marginBottom: '1rem' }}>
    <Form.Label>Outros</Form.Label>
    <Form.Control type="number" id="custoo" size="sm" onChange={calculateTotal} />
</Form.Group>

<Form.Group as={Col} xs={12} md={4} style={{ marginBottom: '1rem' }}>
    <Form.Label>Custo Total</Form.Label>
    <Form.Control type="number" id="custototal" size="sm" readOnly />
</Form.Group>

    </Row>

    {/* Second row */}
    <Row className="mb-3" style={{padding: '10px'}}>
    <Form.Group as={Col} xs={12} md={12} style={{ marginBottom: '1rem' }}>
    <Form.Label>Observações</Form.Label>
    <Form.Control
      as="textarea"
      id="firstobscompra"
       style={{ height: '2.4cm' }} // Set the height to 5cm
    />
  </Form.Group>

      <button
  type="button"
  style={{ textAlign: 'center' , marginTop:'20px'}}
  className="btn btn-primary btn-dark rounded"
  id="submit-button-class"
  onClick={() => {
    
    const formData = {

      idcompra: document.getElementById('idcompra').value,
      datacompra: document.getElementById('datacompra').value,
      comprador: document.getElementById('comprador').value,
      emergencial: document.getElementById('emergencial').value,
      custoa: document.getElementById('custoa').value,
      custot: document.getElementById('custot').value,
      custom: document.getElementById('custom').value,
      custoo: document.getElementById('custoo').value,
      custototal: document.getElementById('custototal').value,
      firstobscompra: document.getElementById('firstobscompra').value,
    };  
    submitFormDataToFirebasef(formData);
  }}

>
  Enviar
</button>
    </Row>
    </Form>  
  </div>

</Modal>
      {/* Modal */}
      {/* Modal for adding data */}
      <Modal 
  isOpen={modalIsOpen}
  onRequestClose={closeModal}
  contentLabel="Editar Modal"
  style={{
    content: {
      size:'80%',
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      maxWidth: '95%', // Adjust the maximum width as needed
      maxHeight: '80%', // Set the maximum height to enable scrolling
      height: 'auto', // Allow the height to adjust based on content
      padding: '10px', // Reduce padding
      backgroundColor: 'white',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    }
  }}
>
  <div className="modal-content">
  <h5 className="section-title" style={{ textAlign: 'center', padding: '10px', color:'#024102' }}>Dados Passagem</h5>
   
    {rowData && (
      <Form>
        <Row className="mb-3" style={{ backgroundColor: '#e9ecef', padding: '10px' }}>
          <Form.Group as={Col} xs={12} md={3} controlId="datasolicitacao">
            <Form.Label>Data Solicitação</Form.Label>
            <Form.Control type="date" placeholder="" value={rowData.datasolicitacao} disabled />
          </Form.Group>
          <Form.Group as={Col} xs={12} md={3}  controlId="motivo">
            <Form.Label>Motivo da viagem</Form.Label>
            <Form.Control type="text" placeholder="" value={rowData.motivo} disabled onChange={(e) => setRowData({ ...rowData, motivo: e.target.value })} />
          </Form.Group>
          <Form.Group as={Col} xs={12} md={3}  controlId="passvolta">
            <Form.Label>Passagem de volta?</Form.Label>
            <Form.Control type="text" placeholder="" value={rowData.passvolta} disabled onChange={(e) => setRowData({ ...rowData, passvolta: e.target.value })} />
          </Form.Group>
        
          <Form.Group as={Col} xs={12} md={3}  controlId="biResult">
            <Form.Label>Status da Passagem</Form.Label>
            <Form.Control as="select" value={rowData.biResult} onChange={(e) => setRowData({ ...rowData, biResult: e.target.value })}>
              <option value="Solicitado">Solicitado</option>
              <option value="Andamento">Andamento</option>
              <option value="Rejeitado">Rejeitado</option>
              <option value="Cancelado">Cancelado</option>
              <option value="Finalizado">Finalizado</option>
              {/* Add other options as needed */}
            </Form.Control>
          </Form.Group>
        </Row>
        <Row className="mb-3" style={{ backgroundColor: '#e9ecef', padding: '10px' }}>
          <Form.Group as={Col} xs={12} md={6}  controlId="diagGroup">
            <Form.Label>Obra/CC</Form.Label>
            <Form.Control type="text" placeholder="" value={rowData.diagGroup} disabled onChange={(e) => setRowData({ ...rowData, diagGroup: e.target.value })} />
          </Form.Group>
          <Form.Group as={Col} xs={12} md={6}  controlId="solicitante">
            <Form.Label>Solicitado por:</Form.Label>
            <Form.Control type="text" placeholder="" value={rowData.solicitante} disabled />
          </Form.Group>
    
        </Row>
        <Row className="mb-3" style={{ backgroundColor: '#e9ecef', padding: '10px' }}>
          <Form.Group as={Col} xs={12} md={3}  controlId="dataida">
            <Form.Label>Data de Ida:</Form.Label>
            <Form.Control type="date" placeholder="" value={rowData.dataida} disabled onChange={(e) => setRowData({ ...rowData, dataida: e.target.value })} />
          </Form.Group>
          <Form.Group as={Col} xs={12} md={3}  controlId="datavolta">
            <Form.Label>Data de Volta:</Form.Label>
            <Form.Control type="date" placeholder="" value={rowData.datavolta} disabled onChange={(e) => setRowData({ ...rowData, datavolta: e.target.value })} />
          </Form.Group>
       
          <Form.Group as={Col} xs={12} md={3}  controlId="cidadeorigem">
            <Form.Label>Cidade Origem:</Form.Label>
            <Form.Control type="text" placeholder="" value={rowData.cidadeorigem} disabled onChange={(e) => setRowData({ ...rowData, cidadeorigem: e.target.value })} />
          </Form.Group>
          <Form.Group as={Col} xs={12} md={3}  controlId="cidadedestino">
            <Form.Label>Cidade Destino:</Form.Label>
            <Form.Control type="text" placeholder="" value={rowData.cidadedestino} disabled onChange={(e) => setRowData({ ...rowData, cidadedestino: e.target.value })} />
          </Form.Group>
        </Row>
        <Row className="mb-3" >
          <Form.Group as={Col} controlId="firstobs">
            <Form.Label>Observações:</Form.Label>
            <Form.Control as="textarea" style={{ height: '3cm' }} placeholder="" value={rowData.firstobs} onChange={(e) => setRowData({ ...rowData, firstobs: e.target.value })} />
          </Form.Group>
        </Row>
        <h5 className="section-title" style={{ textAlign: 'center' , padding: '10px', color:'#024102'}}>Informações Pessoais</h5>
        <Row className="mb-3" style={{ backgroundColor: '#e9ecef', padding: '10px' }}>
          <Form.Group as={Col} xs={12} md={4}  controlId="firstName">
            <Form.Label>Nome Completo:</Form.Label>
            <Form.Control type="text" value={rowData.firstName} placeholder="" disabled onChange={(e) => setRowData({ ...rowData, firstName: e.target.value })} />
          </Form.Group>
          <Form.Group as={Col} xs={12} md={4}  controlId="firstrg">
            <Form.Label>RG:</Form.Label>
            <Form.Control type="text" placeholder="" value={rowData.firstrg} disabled onChange={(e) => setRowData({ ...rowData, firstrg: e.target.value })} />
          </Form.Group>
          <Form.Group as={Col} xs={12} md={4}  controlId="firstcpf">
            <Form.Label>CPF:</Form.Label>
            <Form.Control type="text" placeholder="" value={rowData.firstcpf} disabled onChange={(e) => setRowData({ ...rowData, firstcpf: e.target.value })} />
          </Form.Group>
          </Row><Row className="mb-3" style={{ backgroundColor: '#e9ecef', padding: '10px' }}>
          <Form.Group as={Col} xs={12} md={4}  controlId="nascimento">
            <Form.Label>Data de Nascimento:</Form.Label>
            <Form.Control type="date" placeholder="" value={rowData.nascimento} disabled onChange={(e) => setRowData({ ...rowData, nascimento: e.target.value })} />
          </Form.Group>
          <Form.Group as={Col} xs={12} md={4}  controlId="funcao">
            <Form.Label>Função:</Form.Label>
            <Form.Control type="text" value={rowData.funcao} placeholder="" disabled onChange={(e) => setRowData({ ...rowData, funcao: e.target.value })} />
          </Form.Group>
        </Row>
        <Row className="mb-3">
          <Col>
            <Button variant="dark me-2" onClick={updateData}>
              Editar
            </Button>
            <Button variant="danger me-2" onClick={deleteRecord}>
              Deletar
            </Button>
            <Button variant="secondary" onClick={handleClickDownload}>
              Baixar
            </Button>
          </Col>
        </Row>
      </Form>
    )}
  </div>
</Modal>




<div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
  <div style={{ width: '80%' }} className="mt-2" id="app">
    <h1 className="text-center mt-3" style={{ color: '#024102'}}>Solicitação de Passagens</h1>
    <div className="row">
      <div className="col-md-4 mt-3">
        <label className="form-label mt-2">Procurar por Nome</label>
        <div className="input-group">
          <input
            type="text"
            className="form-control rounded"
            id="search-input"
            ref={searchInputRef} // Attach the ref to the input
            onChange={handleSearch} // Call handleSearch on input change
          />
        </div>
      </div>
      <div className="col-md-4 mt-3 d-flex align-items-end">
        <div className="input-group">
          <button
            type="button"
            style={{ zIndex:0 }}
            className="btn btn-dark me-2 rounded"
            onClick={openRegistrarModal}
          >
            Registrar
          </button>
          <button
            type="button"
            style={{ zIndex:0 }}
            className="btn btn-secondary me-2 rounded"
            onClick={openRegistrarModalf}
          >
            Finalizar
          </button>
          <Button
  variant="light"
  className="rounded"
  style={{ zIndex: 0, border: '1px solid #024102', color: '#024102' }}
  onClick={downloadExcel}
>
  Download
</Button>


        </div>
      </div>
    </div>

    <div className="mt-2" id="data-table"></div>
    {/* Add your include("addForm") and include("editForm") here */}
  </div>
</div>
 </>
  );
};
export default Account;