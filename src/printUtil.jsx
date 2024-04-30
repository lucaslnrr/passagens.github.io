import {formatDate} from "./dateUtil.jsx";
export const baixarRecord = (rowData, formData) => {
    const img = new Image();
    img.src = 'https://i.ibb.co/6wvpQRL/women.jpg';
    img.onload = function() {
      // This function will be called when the image is fully loaded
      if (!rowData) {
        console.error('No data available to download.');
        return;
      }
    const emailMessage = `
    <!DOCTYPE html>
    <html lang="pt-br" xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <style type="text/css">
        body {
          margin:0 ;
          padding: 0;
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
        }
        table,
        td {
          border-collapse: collapse;
        }
      </style>
    </head>
    
    <body>
      <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align: bottom;" width="100%">
        <tr>
          <td align="center" style="padding: 5px 10px; word-break: break-word;">
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 28px; font-weight: bold; line-height: 1; text-align: center; color: #555;">
              Novo Cadastro ID: ${rowData.__key}
            </div>
          </td>
        </tr>
        <tr>
          <td align="left" style="padding: 5px 10px; word-break: break-word;">
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 16px; line-height: 22px; text-align: left; color: #555;">
              <h4 style="margin-bottom: 4px;">Dados da Passagem</h4>
                                                    <span style="color: #ba6464;">ID:</span> <span style="color: #333;">${rowData.__key}</span><br>
                                                    <span style="color: #ba6464;">Data Solicitação:</span> <span style="color: #333;">${formData.datasolicitacao ? formatDate(formData.datasolicitacao) : '___'}</span><br>
                                                    <span style="color: #ba6464;">Motivo da viagem:</span> <span style="color: #333;">${formData.motivo}</span><br>
                                                    <span style="color: #ba6464;">Obra/CC:</span> <span style="color: #333;">${formData.diagGroup}</span><br>
                                                    
                                                    <span style="color: #ba6464;">Status da Passagem:</span> <span style="color: #333;">${formData.biResult}</span><br>
                                                      <span style="color: #ba6464;">Será necessário passagem de volta?</span> <span style="color: #333;">${formData.passvolta}</span><br>
                                                      <span style="color: #ba6464;">Data de Ida:</span> <span style="color: #333;">${formData.dataida ? formatDate(formData.dataida) : '___'}</span><br>
                                                      <span style="color: #ba6464;">Data de Volta:</span> <span style="color: #333;">${formData.datavolta ? formatDate(formData.datavolta) : '___'}</span><br>
                                                      <span style="color: #ba6464;">Cidade Origem:</span> <span style="color: #333;">${formData.cidadeorigem}</span><br>
                                                      <span style="color: #ba6464;">Cidade Destino:</span> <span style="color: #333;">${formData.cidadedestino}</span><br>
                                                      <span style="color: #ba6464;">Solicitado por:</span> <span style="color: #333;">${formData.solicitante}</span><br>
                                                      <span style="color: #ba6464;">Observações:</span> <span style="color: #333;">${formData.firstobs}</span><br>
                                                      <h4 style="margin-bottom: 4px;">Informações Pessoais</h4>
                                                      <span style="color: #ba6464;">Nome Completo:</span> <span style="color: #333;">${formData.firstName}</span><br>
                                                      <span style="color: #ba6464;">RG:</span> <span style="color: #333;">${formData.firstrg}</span><br>
                                                      <span style="color: #ba6464;">CPF:</span> <span style="color: #333;">${formData.firstcpf}</span><br>
                                                      <span style="color: #ba6464;">Data de Nascimento: </span> <span style="color: #333;">${formData.nascimento ? formatDate(formData.nascimento) : '___'}</span><br>
                                                      <span style="color: #ba6464;">Função:</span> <span style="color: #333;">${formData.funcao}</span><br>
                                                
                                                    </div>
                                                    </td>
                                                </table>
                                                <div style="position: fixed; bottom: 0; width: 100%; background-color: #f2f2f2; padding: 10px; text-align: center;">
      <div style="display: flex; justify-content: center; align-items: center; flex-direction: column;">
        <div style="margin-bottom: 3px;">
          <img height="auto" src="https://guerreroservicos.com.br/wp-content/uploads/2024/04/LOGO-GUERRERO-FUNDO-CLARO-4.png" alt="Woman" style="display: block; max-width: 90px;">
        </div>
        <div style="width: 23%; border-bottom: #333957 solid 1px;"></div>
        <span style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; font-weight: 300; line-height: 1; color: #575757;">guerreropassagens.web.app</span>
      </div>
    </div>
                                              </body>
                                              
                                              </html>
    `; 
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
  
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(emailMessage);
    doc.close();
  
    // Initiating print once the content is ready
    iframe.contentWindow.onload = function() {
      iframe.contentWindow.print();
    };
  };
  };
  