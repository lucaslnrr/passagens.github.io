import React, { useEffect, useMemo, useState } from 'react';
import Modal from 'react-modal';
import { ref, get, getDatabase, child, onValue } from 'firebase/database';
import { db } from '../utils/firebase';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import { useTable, usePagination, useSortBy, useFilters } from 'react-table';
import { formatDate } from '../dateUtil.jsx';

// Function to format numbers as Brazilian real
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

const Finalizadoss = () => {
  // State to store the data from Firebase
  const [data, setData] = useState([]);

  // Function to fetch data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      const controleCustosRef = ref(db, 'controlecustos');
      const recordsRef = ref(db, 'records');
      
      const controleCustosSnapshot = await get(controleCustosRef);
      const recordsSnapshot = await get(recordsRef);

      const fetchedData = [];
      controleCustosSnapshot.forEach((childSnapshot) => {
        const controleCustosData = childSnapshot.val();
        const idCompra = controleCustosData.idcompra;

        // Search for the corresponding firstName in records
        const record = recordsSnapshot.child(idCompra);
        const firstName = record.exists() ? record.child('firstName').val() : '';

        // Add the "Nome" (firstName) to the data
        fetchedData.push({ ...controleCustosData, nome: firstName });
      });

      setData(fetchedData);
    };

    fetchData();
  }, []);

  // Define columns
  const columns = useMemo(
    () => [
      { Header: 'ID Compra', accessor: 'idcompra' },
      { Header: 'Comprador', accessor: 'comprador' },
      { Header: 'Nome', accessor: 'nome' },
      { Header: 'Aéreo', accessor: 'custoa', Cell: ({ value }) => formatCurrency(value) },
      { Header: 'Terrestre', accessor: 'custot', Cell: ({ value }) => formatCurrency(value) },
      { Header: 'Marítimo', accessor: 'custom', Cell: ({ value }) => formatCurrency(value) },
      { Header: 'Outros', accessor: 'custoo', Cell: ({ value }) => formatCurrency(value) },
      { Header: 'Total', accessor: 'custototal', Cell: ({ value }) => formatCurrency(value) },
      { Header: 'Data da Compra', accessor: 'datacompra', Cell: ({ value }) => formatDate(value) },
      { Header: 'Emergencial', accessor: 'emergencial' },
      { Header: 'Observação', accessor: 'firstobscompra' },
    ],
    []
  );

  // Custom filter function to filter by 'nome' and 'datacompra' fields
  const customFilter = (rows, id, filterValue) => {
    return rows.filter((row) => {
      const rowValue = row.values[id];
      return rowValue.toLowerCase().includes(filterValue.toLowerCase());
    });
  };

  // Initialize react-table with custom filter
  const tableInstance = useTable(
    {
      columns,
      data,
      initialState: { filters: [{ id: 'nome', value: '' }, { id: 'datacompra', value: '' }] }, // Initialize filter state for 'nome' and 'datacompra'
      filterTypes: { // Register custom filter type
        text: customFilter, // Use custom filter for text type
      },
    },
    useFilters, // Apply filters for searching
    useSortBy,
    usePagination
  );

  // Destructure methods and state from tableInstance
  const { getTableProps, getTableBodyProps, headerGroups, prepareRow, pageOptions, page, nextPage, previousPage, canNextPage, canPreviousPage, state, setFilter } = tableInstance;

  const { pageIndex } = state;

  return (
    <div style={{ maxWidth: '90%', margin: '0 auto' }}>
      <h1 className="text-center mt-3" style={{ color: '#024102'}}>Controle de Custos</h1>
      
      {/* Add search inputs for 'nome' and 'datacompra' */}
      <div className="text-center mb-3">
        <input
          type="text"
          placeholder="Filtrar por Nome"
          onChange={(e) => setFilter('nome', e.target.value)} // Set filter for 'nome'
          style={{ padding: '5px', borderRadius: '3px', border: '1px solid #ccc', marginRight: '10px' }}
        />
        <input
          type="text"
          placeholder="Filtrar por Data" disabled
          onChange={(e) => setFilter('datacompra', e.target.value)} // Set filter for 'datacompra'
          style={{ padding: '5px', borderRadius: '3px', border: '1px solid #ccc' }}
        />
      </div>
      
      <Table striped bordered hover size="sm" {...getTableProps()} style={{ fontSize: '14px' }}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>{column.render('Header')}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </Table>
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Button onClick={() => previousPage()} disabled={!canPreviousPage} style={{ margin: '0 5px' }} variant="light">
          Previous
        </Button>
        <span>
          Page <strong>{pageIndex + 1}</strong> of <strong>{pageOptions.length}</strong>
        </span>
        <Button onClick={() => nextPage()} disabled={!canNextPage} style={{ margin: '0 5px' }} variant="light">
          Next
        </Button>
      </div>
    </div>
  );
};

export default Finalizadoss;
