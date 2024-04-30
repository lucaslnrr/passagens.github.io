
import React, { useEffect, useState, useRef } from 'react';
import Modal from 'react-modal';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ref, set, onValue, remove, get, child} from 'firebase/database';
import { db } from '../utils/firebase';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import * as jsPDF from 'jspdf';

import Row from 'react-bootstrap/Row';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import * as XLSX from 'xlsx';
import { baixarRecord } from '../printUtil.jsx';
import { formatDate } from '../dateUtil.jsx';

Modal.setAppElement('#root');


const Compra = () => {
  const searchInputRef = useRef(null);
const filterDiagGroupRef = useRef(null); // Create a separate ref for the select element

  const [rowData, setRowData] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [showRegistrarModal, setShowRegistrarModal] = useState(false);
  const [solicitante, setSolicitante] = useState('');
  const [numeroFogos, setNumeroFogos] = useState(['']);
  const closeModal = () => {
    setModalIsOpen(false);
    setShowRegistrarModal(false); 
  };
  const openRegistrarModal = () => {
    setShowRegistrarModal(true); 
  };


  const updateData = () => {
    if (!rowData || !rowData.__key) {
        console.error('No valid data to update.');
        return;
    }

    updateRecordData();
};

const updateRecordData = () => {
    const { __key, ...updatedRecord } = rowData;
    const recordRef = ref(db, `compra/${__key}`);

    // Fetch the current record data
    get(recordRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const currentRecord = snapshot.val();

                // Generate a new unique key for the copied data in 'changed' database
                const newChangedRecordKey = generateCustomKey();
                const changedRecordRef = ref(db, `changed/${newChangedRecordKey}`);

                // Move the current record data to 'changed' database
                set(changedRecordRef, currentRecord)
                    .then(() => {
                        console.log('Old record data moved to "changed" database successfully!');
                    })
                    .catch((error) => {
                        console.error('Error moving old record data to "changed" database:', error);
                    });

                // Update the record in 'records' database with new data
                set(recordRef, updatedRecord)
                    .then(() => {
                        console.log('Record updated successfully!');
                        closeModal();
                    })
                    .catch((error) => {
                        console.error('Error updating record:', error);
                    });
            } else {
                console.error('Record does not exist.');
            }
        })
        .catch((error) => {
            console.error('Error fetching record data:', error);
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

  const downloadPdf = () => {
    if (tableRef.current) {
      const table = tableRef.current.table;
  
      if (table) {
        const tableData = table.getData();
  
        // Create a new PDF instance
        const doc = new jsPDF();
  
        // Define columns and rows
        const columns = table.getColumns().map((column) => column.getField());
        const rows = tableData.map((dataRow) => columns.map((column) => dataRow[column]));
  
        // Set table header and data
        doc.autoTable({
          head: [columns],
          body: rows,
        });
  
        // Save the PDF
        doc.save('table.pdf');
      }
    }
  };
  const fetchData = (user, setRowData, initializeTabulator, db) => {
    const recordsRef = ref(db, 'compra');
  
    onValue(recordsRef, (snapshot) => {
      const data = snapshot.val();
      const records = data ? Object.entries(data) : [];
      const mappedData = records.map(([key, value]) => ({
        __key: key,
        ...value,
      }));
      
      setRowData(mappedData);
      initializeTabulator(mappedData);
    });
  };
  
useEffect(() => {
  const auth = getAuth();
  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (user) {
      const userEmail = user.email;
      setSolicitante(userEmail);

      fetchData(user, setRowData, initializeTabulator, db);
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
      height: "100%",
    
      reactiveData: true,
       renderHorizontal:"virtual",
      pagination: "local",
      paginationSize: 20,
      backgroundColor: "#fff",
      border: "1px solid #212529",
      paginationSizeSelector: [10, 15, 20,30,50,100],
      movableColumns: true,
      paginationCounter: "rows",
      index: "__key",
      columns: [

  {title:"ID", field:"__key", visible:false, download:false},  
  {title:"N°Fogo", field:"numero_fogo", headerFilter:"list", headerFilterParams:{autocomplete:true, valuesLookup:true, clearable:true}},
  
  {title:"Sienge", field:"sienge", headerFilter:"list", headerFilterParams:{autocomplete:true, valuesLookup:true, clearable:true}},
  {title:"Conservação", field:"conservacao",headerFilter:"list", headerFilterParams:{autocomplete:true, valuesLookup:true, clearable:true}},
  {title:"Medida", field:"medida"},
  {title:"Pressão Ini", field:"pressaoini"},
  {title:"Pressão Fin", field:"pressaofin"},
  {title:"DOT", field:"dot"},
  {title:"Altura", field:"altura"},            
  {title:"Km", field:"km"},            
  
  {title:"Posição", field:"posicao", visible:true, download:true},
  {title:"Status", field:"status",headerFilter:"list", headerFilterParams:{autocomplete:true, valuesLookup:true, clearable:true}},                                       
  {title:"Obra", field:"centro_custo",download:false ,headerFilter:"list", headerFilterParams:{autocomplete:true, valuesLookup:true, clearable:true}},              
  {title:"Observações", field:"observacao", visible:true, download:false},
  {title:"Solicitante", field:"solicitante", visible:false, download:false}
],
          });
  
    table.on('rowClick', (e, row) => {
      const rowData = row.getData();
      setRowData(rowData);
      setModalIsOpen(true);
    }); 
    tableRef.current = { table }; 
    table.on('tableBuilt', () => {
      table.setData(data);
    });
  };
  const submitFormDataToFirebase = (formData) => {
    const customKey = generateCustomKey();
    const newRecordRef = ref(db, `compra/${customKey}`);
    
    if (!formData.sienge) {
        alert('Estão faltando dados obrigatórios');
        return;
    }
    
    set(newRecordRef, formData)
      .then(() => {
          console.log('Data added to Firebase successfully!');
          alert('Solicitação enviada com sucesso!');
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
        data.numero_fogo.toLowerCase().includes(searchTerm) ||
        
        data.sienge.toLowerCase().includes(searchTerm) ||
        data.status.toLowerCase().includes(searchTerm) ||
        data.conservacao.toLowerCase().includes(searchTerm) ||
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
    const recordRef = ref(db, `compra/${__key}`);
  
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
const addNumeroFogo = () => {
  setNumeroFogos([...numeroFogos, '']);
};

// Handle change in numero_fogo input
const handleNumeroFogoChange = (index, value) => {
  const updatedNumeroFogos = [...numeroFogos];
  updatedNumeroFogos[index] = value;
  setNumeroFogos(updatedNumeroFogos);
};

// Remove numero_fogo field
const removeNumeroFogo = (index) => {
  const updatedNumeroFogos = [...numeroFogos];
  updatedNumeroFogos.splice(index, 1);
  setNumeroFogos(updatedNumeroFogos);
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
      padding: '20px',
      backgroundColor: 'white',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    }
  }}
>
  
  <div className="modal-content" >
  {/* Content for the registrar modal */}
  <h3 className="modal-title">Registrar</h3>
  {/* Dados Passagem */}
  <h4 className="section-title" style={{ textAlign: 'center' }}></h4>
  <Form >
    <Row className="mb-3" style={{backgroundColor: '#e9ecef', padding: '10px'}}>
      {/* Número de Fogo */}
     {numeroFogos.map((numeroFogo, index) => (
          <Form.Group key={index} as={Row} className="mb-3">
            <Form.Label column md={3}>Número de Fogo</Form.Label>
            <Col md={8}>
              <Form.Control 
                type="text" 
                value={numeroFogo}
                onChange={(e) => handleNumeroFogoChange(index, e.target.value)}
                size="sm" 
              />
            </Col>
            {index > 0 && (
              <Col md={1}>
                <Button variant="danger" size="sm" onClick={() => removeNumeroFogo(index)}>X</Button>
              </Col>
            )}
          </Form.Group>
        ))}
        <Button variant="secondary" onClick={addNumeroFogo}>Add Número de Fogo</Button>
        {/* Submit button and other content... */}
      
      {/* Usuário */}
      <Form.Group as={Col} xs={12} md={3} style={{ marginBottom: '1rem' }}>
        <Form.Label>Data</Form.Label>
        <Form.Control type="date" placeholder="" value={currentDate}max="9999-12-31"size="sm" id="data_alteracao" disabled />
      </Form.Group>
      {/* Usuário */}
      <Form.Group as={Col} xs={12} md={6} style={{ marginBottom: '1rem' }}>
        <Form.Label>Usuário</Form.Label>
        <Form.Control
    type="text"
    placeholder=""
    size="sm"
    value={solicitante} 
    id="solicitante"
    disabled
  />
      </Form.Group>

    </Row>
    {/* Second row */}
    <Row className="mb-3" style={{  padding: '10px' }}>
            {/* ID Sienge/nº Frota */}
            <Form.Group as={Col} xs={12} md={6} style={{ marginBottom: '1rem' }}>
        <Form.Label>ID Sienge/nº Frota</Form.Label>
        <Form.Select id="sienge" size="sm">
          <option selected value="SEM FROTA" >SEM FROTA</option>
          <option value="MAQ-001|GUINDASTE MO/SANY STC 800">MAQ-001 | GUINDASTE MO/SANY STC 800</option>
          <option value="MAQ-002|GUINDASTE MO/SANY STC 800S">MAQ-002 | GUINDASTE MO/SANY STC 800S</option>
          <option value="MAQ-003|CAMINHAO CABINADO">MAQ-003 | CAMINHAO CABINADO</option>
          <option value="MAQ-004|CAMINHAO CABINADO">MAQ-004 | CAMINHAO PIPA</option>
          <option value="MAQ-008|RETROESCAVADEIRA-JCB-LUMA">MAQ-008 | RETROESCAVADEIRA-JCB-LUMA</option>
          <option value="MAQ-009|RETROESCAVADEIRA-JCB-GERMAN">MAQ-008 | RETROESCAVADEIRA-JCB-GERMAN</option>
        </Form.Select>
      </Form.Group>

      {/* Obra/Centro de Custo */}
      <Form.Group as={Col} xs={12} md={6} style={{ marginBottom: '1rem' }}>
        <Form.Label>Obra/Centro de Custo</Form.Label>
        <Form.Select id="centro_custo" size="sm">
          <option selected></option>
          <option value="ADMINISTRAÇÃO CENTRAL">ADMINISTRAÇÃO CENTRAL</option>
          <option value="ADMINISTRAÇÃO BASE LOCAL - ALAGOAS">ADMINISTRAÇÃO BASE LOCAL - ALAGOAS</option>
          <option value="LD 138 KV OEIRAS X CAMETA - EQTL PARA">LD 138 KV OEIRAS X CAMETA - EQTL PARA</option>
        </Form.Select>
      </Form.Group>
    </Row>
    {/* Third row */}
    <Row className="mb-3" style={{ backgroundColor: '#e9ecef', padding: '10px' }}>
            {/* Medida */}
            <Form.Group as={Col} xs={12} md={3} style={{ marginBottom: '1rem' }}>
        <Form.Label>Medida</Form.Label>
        <Form.Control type="text" id="medida" size="sm" />
      </Form.Group>
   
      {/* Altura */}
      <Form.Group as={Col} xs={12} md={3} style={{ marginBottom: '1rem' }}>
        <Form.Label>Altura</Form.Label>
        <Form.Control type="number" id="altura" size="sm" />
      </Form.Group>
  
      {/* DOT */}
      <Form.Group as={Col} xs={12} md={3} style={{ marginBottom: '1rem' }}>
        <Form.Label>DOT</Form.Label>
        <Form.Control type="number" id="dot" size="sm" />
      </Form.Group>
     {/* Km */}
     <Form.Group as={Col} xs={12} md={3} style={{ marginBottom: '1rem' }}>
        <Form.Label>Km</Form.Label>
        <Form.Control type="number" id="km" size="sm" />
      </Form.Group>

    </Row>
 
    {/* Fourth row */}
    <Row className="mb-3" style={{ padding: '10px' }}>
     
      {/* Pressão Ini */}
      <Form.Group as={Col} xs={12} md={3} style={{ marginBottom: '1rem' }}>
        <Form.Label>Pressão Inicial</Form.Label>
        <Form.Control type="number" id="pressaoini" size="sm" />
      </Form.Group>
      {/* Pressão Fin */}
      <Form.Group as={Col} xs={12} md={3} style={{ marginBottom: '1rem' }}>
        <Form.Label>Pressão Final</Form.Label>
        <Form.Control type="number" id="pressaofin" size="sm" />
      </Form.Group>
      {/* Posição */}
      <Form.Group as={Col} xs={12} md={6} style={{ marginBottom: '1rem' }}>
        <Form.Label>Eixo/Posição</Form.Label>
        <Form.Select id="posicao" size="sm">
      
          <option selected value="SEM FROTA">SEM FROTA</option>
          <option value="1-Dianteiro Direito">1 - Dianteiro Direito</option>
          <option value="1-Dianteiro Esquerdo">1 - Dianteiro Esquerdo</option>
          <option value="2-Traseiro Direito Externo">2-Traseiro Direito Externo</option>
          <option value="2-Traseiro Direito Interno">2-Traseiro Direito Interno</option>
          <option value="2-Traseiro Esquerdo Externo">2-Traseiro Esquerdo Externo</option>
          <option value="2-Traseiro Esquerdo Interno">2-Traseiro Esquerdo Interno</option>
          <option value="3-Traseiro Direito Externo">3-Traseiro Direito Externo</option>
          <option value="3-Traseiro Direito Interno">3-Traseiro Direito Interno</option>
          <option value="3-Traseiro Esquerdo Externo">3-Traseiro Esquerdo Externo</option>
          <option value="3-Traseiro Esquerdo Interno">3-Traseiro Esquerdo Interno</option>
          <option value="4-Traseiro Direito Externo">4-Traseiro Direito Externo</option>
          <option value="4-Traseiro Direito Interno">4-Traseiro Direito Interno</option>
          <option value="4-Traseiro Esquerdo Externo">4-Traseiro Esquerdo Externo</option>
          <option value="4-Traseiro Esquerdo Interno">4-Traseiro Esquerdo Interno</option>
          <option value="ESTEPE">ESTEPE</option>
        </Form.Select>
      </Form.Group>
    </Row>
    <Row className="mb-3" style={{ backgroundColor: '#e9ecef', padding: '10px' }}>
         {/* Status */}
   <Form.Group as={Col} xs={12} md={3} style={{ marginBottom: '1rem' }}>
        <Form.Label>Status</Form.Label>
        <Form.Select id="status" size="sm">
          <option selected></option>
          <option value="ativo">Ativo</option>
          <option value="manutencao">Manutenção</option>
          <option value="parado">Parado</option>
          <option value="estoque">Estoque</option>
        </Form.Select>
      </Form.Group>
   {/* Conservação */}
   <Form.Group as={Col} xs={12} md={3} style={{ marginBottom: '1rem' }}>
        <Form.Label>Conservação</Form.Label>
        <Form.Select id="conservacao" size="sm">
         
          <option selected value="novo">Novo</option>
          <option value="reforma 1">Reforma 1º</option>
          <option value="reforma 2">Reforma 2º</option>
          <option value="reforma 3">Reforma 3º</option>
          <option value="atencao">Atenção</option>
        </Form.Select>
      </Form.Group>
 
    </Row>
    {/* Fifth row */}
    <Row className="mb-3" style={{ padding: '10px' }}>
                 {/* Observações */}
                 <Form.Group as={Col} xs={12} md={12} style={{ marginBottom: '1rem' }}>
    <Form.Label>Observações</Form.Label>
    <Form.Control
      as="textarea"
      id="observacao"
      style={{ height: '1.4cm' }} // Set the height to 5cm
    />
  </Form.Group>
    <button
      type="button"
      className="btn btn-primary btn-dark rounded"
      id="submit-button-class"
      onClick={() => {
        const formData = {
          // Dados Passagem
          numero_fogo: numeroFogos.join(','), 
          data_alteracao: document.getElementById('data_alteracao').value,
          solicitante: document.getElementById('solicitante').value,
          sienge: document.getElementById('sienge').value,
          centro_custo: document.getElementById('centro_custo').value,
          altura: document.getElementById('altura').value,
          dot: document.getElementById('dot').value,
          medida: document.getElementById('medida').value,
          pressaoini: document.getElementById('pressaoini').value,
          pressaofin: document.getElementById('pressaofin').value,
          posicao: document.getElementById('posicao').value,
          km: document.getElementById('km').value,
          conservacao: document.getElementById('conservacao').value,
          observacao: document.getElementById('observacao').value,
          status: document.getElementById('status').value
        };submitFormDataToFirebase(formData);
      }}
    >
      Enviar
    </button>
  
    </Row>
  
  </Form>
</div>

</Modal>

<Modal
  isOpen={modalIsOpen}
  onRequestClose={closeModal}
  contentLabel="Edit Row"
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
      padding: '20px',
      backgroundColor: 'white',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    }
  }}
>
  <div className="modal-content">
    <h3 className="modal-title">Editar</h3>
   
    {rowData && (
      <Form>
        {/* First row */}
        <Row className="mb-3" style={{  backgroundColor: '#e9ecef',padding: '10px' }}>
          
           
            {/* Número_Fogo */}
            {numeroFogos.map((numeroFogo, index) => (
  <Form.Group key={index} as={Col} xs={12} md={3} style={{ marginBottom: '1rem' }}>
    <Form.Label>Nº de Fogo</Form.Label>
    <Form.Control
      type="text"
      size="sm"
      value={numeroFogo}
      disabled
      onChange={(e) => handleNumeroFogoChange(index, e.target.value)}
    />
  </Form.Group>
))}

           {/* Número_Fogo */}
           <Form.Group as={Col} xs={12} md={3} style={{ marginBottom: '1rem' }}>
            <Form.Label>Data Alteração</Form.Label>
            <Form.Control type="text" id="data_alteracao" size="sm" value={rowData.data_alteracao} disabled onChange={(e) => setRowData({ ...rowData, data_alteracao: e.target.value })}/>
          </Form.Group>
            {/* Número_Fogo */}
            <Form.Group as={Col} xs={12} md={6} style={{ marginBottom: '1rem' }}>
            <Form.Label>Usuário</Form.Label>
            <Form.Control type="text" id="solicitante" size="sm" value={rowData.solicitante} disabled onChange={(e) => setRowData({ ...rowData, solicitante: e.target.value })}/>
          </Form.Group>
          </Row>
          <Row className="mb-3" style={{ padding: '10px' }}>
          {/* ID Sienge/nº Frota */}
          <Form.Group as={Col} xs={12} md={6} style={{ marginBottom: '1rem' }}>
            <Form.Label>ID Sienge/nº Frota</Form.Label>
            <Form.Select id="sienge" size="sm"value={rowData.sienge} onChange={(e) => setRowData({ ...rowData, sienge: e.target.value })}>
              
              <option selected value="SEM FROTA" >SEM FROTA</option>
              <option value="MAQ-001|GUINDASTE MO/SANY STC 800">MAQ-001 | GUINDASTE MO/SANY STC 800</option>
          <option value="MAQ-002|GUINDASTE MO/SANY STC 800S">MAQ-002 | GUINDASTE MO/SANY STC 800S</option>
          <option value="MAQ-003|CAMINHAO CABINADO">MAQ-003 | CAMINHAO CABINADO</option>
          <option value="MAQ-004|CAMINHAO CABINADO">MAQ-004 | CAMINHAO PIPA</option>
          <option value="MAQ-008|RETROESCAVADEIRA-JCB-LUMA">MAQ-008 | RETROESCAVADEIRA-JCB-LUMA</option>
          <option value="MAQ-009|RETROESCAVADEIRA-JCB-GERMAN">MAQ-008 | RETROESCAVADEIRA-JCB-GERMAN</option>
            </Form.Select>
          </Form.Group>

          {/* Obra/Centro de Custo */}
          <Form.Group as={Col} xs={12} md={6} style={{ marginBottom: '1rem' }}>
            <Form.Label>Obra/Centro de Custo</Form.Label>
            <Form.Select id="centro_custo" size="sm" placeholder="" value={rowData.centro_custo} onChange={(e) => setRowData({ ...rowData, centro_custo: e.target.value })} >
              <option selected></option>
              <option value="ADMINISTRAÇÃO CENTRAL">ADMINISTRAÇÃO CENTRAL</option>
              <option value="ADMINISTRAÇÃO BASE LOCAL - ALAGOAS">ADMINISTRAÇÃO BASE LOCAL - ALAGOAS</option>
              <option value="LD 138 KV OEIRAS X CAMETA - EQTL PARA">LD 138 KV OEIRAS X CAMETA - EQTL PARA</option>
            </Form.Select>
          </Form.Group>
        </Row>

        {/* Second row */}
        <Row className="mb-3" style={{ backgroundColor: '#e9ecef', padding: '10px' }}>
          {/* Medida */}
          <Form.Group as={Col} xs={12} md={3} style={{ marginBottom: '1rem' }}>
            <Form.Label>Medida</Form.Label>
            <Form.Control type="text" id="medida" size="sm"value={rowData.medida} onChange={(e) => setRowData({ ...rowData, medida: e.target.value })} />
          </Form.Group>
         
          {/* Altura */}
          <Form.Group as={Col} xs={12} md={3} style={{ marginBottom: '1rem' }}>
            <Form.Label>Altura</Form.Label>
            <Form.Control type="number" id="altura" size="sm" value={rowData.altura} onChange={(e) => setRowData({ ...rowData, altura: e.target.value })}/>
          </Form.Group>
          
          {/* DOT */}
          <Form.Group as={Col} xs={12} md={3} style={{ marginBottom: '1rem' }}>
            <Form.Label>DOT</Form.Label>
            <Form.Control type="number" id="dot" size="sm"value={rowData.dot} onChange={(e) => setRowData({ ...rowData, dot: e.target.value })} />
          </Form.Group>
          
          {/* Km */}
          <Form.Group as={Col} xs={12} md={3} style={{ marginBottom: '1rem' }}>
            <Form.Label>Km</Form.Label>
            <Form.Control type="number" id="km" size="sm" value={rowData.km} onChange={(e) => setRowData({ ...rowData, km: e.target.value })}/>
          </Form.Group>
        </Row>

        {/* Third row */}
        <Row className="mb-3" style={{  padding: '10px' }}>
          {/* Pressão Ini */}
          <Form.Group as={Col} xs={12} md={3} style={{ marginBottom: '1rem' }}>
            <Form.Label>Pressão Inicial</Form.Label>
            <Form.Control type="number" id="pressaoini" size="sm" value={rowData.pressaoini} onChange={(e) => setRowData({ ...rowData, pressaoini: e.target.value })}/>
          </Form.Group>
          {/* Pressão Fin */}
          <Form.Group as={Col} xs={12} md={3} style={{ marginBottom: '1rem' }}>
            <Form.Label>Pressão Final</Form.Label>
            <Form.Control type="number" id="pressaofin" size="sm" value={rowData.pressaofin} onChange={(e) => setRowData({ ...rowData, pressaofin: e.target.value })}/>
          </Form.Group>
          {/* Posição */}
          <Form.Group as={Col} xs={12} md={6} style={{ marginBottom: '1rem' }}>
            <Form.Label>Eixo/Posição</Form.Label>
            <Form.Select id="posicao" size="sm"value={rowData.posicao} onChange={(e) => setRowData({ ...rowData, posicao: e.target.value })}>
              <option selected value="SEM FROTA">SEM FROTA</option>
              <option value="1-Dianteiro Direito">1 - Dianteiro Direito</option>
              <option value="1-Dianteiro Esquerdo">1 - Dianteiro Esquerdo</option>
              <option value="2-Traseiro Direito Externo">2-Traseiro Direito Externo</option>
              <option value="2-Traseiro Direito Interno">2-Traseiro Direito Interno</option>
              <option value="2-Traseiro Esquerdo Externo">2-Traseiro Esquerdo Externo</option>
              <option value="2-Traseiro Esquerdo Interno">2-Traseiro Esquerdo Interno</option>
              <option value="3-Traseiro Direito Externo">3-Traseiro Direito Externo</option>
              <option value="3-Traseiro Direito Interno">3-Traseiro Direito Interno</option>
              <option value="3-Traseiro Esquerdo Externo">3-Traseiro Esquerdo Externo</option>
              <option value="3-Traseiro Esquerdo Interno">3-Traseiro Esquerdo Interno</option>
              <option value="4-Traseiro Direito Externo">4-Traseiro Direito Externo</option>
              <option value="4-Traseiro Direito Interno">4-Traseiro Direito Interno</option>
              <option value="4-Traseiro Esquerdo Externo">4-Traseiro Esquerdo Externo</option>
              <option value="4-Traseiro Esquerdo Interno">4-Traseiro Esquerdo Interno</option>
              <option value="ESTEPE">ESTEPE</option>
            </Form.Select>
          </Form.Group>
        </Row>

        {/* Fourth row */}
        <Row className="mb-3" style={{ backgroundColor: '#e9ecef', padding: '10px' }}>
          {/* Status */}
          <Form.Group as={Col} xs={12} md={3} style={{ marginBottom: '1rem' }}>
            <Form.Label>Status</Form.Label>
            <Form.Select id="status" size="sm" value={rowData.status} onChange={(e) => setRowData({ ...rowData, status: e.target.value })}>
              <option selected></option>
              <option value="ativo">Ativo</option>
              <option value="manutencao">Manutenção</option>
              <option value="parado">Parado</option>
              <option value="estoque">Estoque</option>
            </Form.Select>
          </Form.Group>
          {/* Conservação */}
          <Form.Group as={Col} xs={12} md={3} style={{ marginBottom: '1rem' }}>
            <Form.Label>Conservação</Form.Label>
            <Form.Select id="conservacao" size="sm"value={rowData.conservacao} onChange={(e) => setRowData({ ...rowData, conservacao: e.target.value })}>
              <option selected value="novo">Novo</option>
              <option value="reforma 1">Reforma 1º</option>
              <option value="reforma 2">Reforma 2º</option>
              <option value="reforma 3">Reforma 3º</option>
              <option value="atencao">Atenção</option>
            </Form.Select>
          </Form.Group>
        </Row>

        {/* Fifth row */}
        <Row className="mb-3" style={{ padding: '10px' }}>
          {/* Observações */}
          <Form.Group as={Col} xs={12} md={12} style={{ marginBottom: '1rem' }}>
            <Form.Label>Observações</Form.Label>
            <Form.Control
              as="textarea"
              id="observacao"
              style={{ height: '1.4cm' }} // Set the height to 5cm
              value={rowData.observacao} onChange={(e) => setRowData({ ...rowData, observacao: e.target.value })}/>
          </Form.Group>
        </Row>
        
        {/* Buttons */}
        <Button variant="btn btn-primary btn-dark me-2 rounded" onClick={updateData}>
          Editar
        </Button>
        <Button variant="danger me-2" onClick={deleteRecord}>
          Deletar
        </Button>
        
      </Form>
    )}
  </div>
</Modal>


<div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <div style={{ width: '80%' }} className="mt-2" id="app">
        <h1 className="text-center mt-3">Requisição Compras</h1>
        <div className="row">
          <div className="col-md-6">
            <label className="form-label">Procurar por:</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control me-2 rounded"
                id="search-input"
                ref={searchInputRef} // Attach the ref to the input
                onChange={handleSearch} // Call handleSearch on input change
              />
              <button
                type="button"
                className="btn btn-success me-2 rounded"
                id="open-form-record-button"
                onClick={openRegistrarModal}
                style={{ zIndex: 0 }}
              >
                Registrar
              </button>
              {!modalIsOpen && (
                <>
                 
            {/*     <button
                    type="button"
                    className="btn btn-primary btn-dark me-2 rounded"
                    id="download-pdf"
                    onClick={downloadPdf}
                    style={{ zIndex: 0 }}
                  >
                    PDF
              </button>*/}
                </>
              )}
            </div>
          </div>
        </div>
      
    

        <div className="mt-2" id="data-table"></div>
        {/* Add your include("addForm") and include("editForm") here */}
      </div>
    </div>  </>
  );
};
export default Compra;