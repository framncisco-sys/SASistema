import React, { useState, useEffect } from 'react';

const FormularioVentas = ({ clienteInfo, volverAlInicio }) => {
  // --- ESTADOS ---
  const [tipoDocumento, setTipoDocumento] = useState("CCF"); 
  const [fechaFactura, setFechaFactura] = useState("");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  
  // Datos del Cliente (El que compra en la ferretería)
  const [nrcCliente, setNrcCliente] = useState("");
  const [nombreCliente, setNombreCliente] = useState("");
  
  // Periodo Contable
  const [periodoContable, setPeriodoContable] = useState(""); 
  const [listaPeriodos, setListaPeriodos] = useState([]);

  // Montos
  const [montoGravado, setMontoGravado] = useState("");
  const [montoIva, setMontoIva] = useState("");
  const [montoTotal, setMontoTotal] = useState("");

  // --- USE EFFECT: Cargar Fecha y Periodo Automático ---
  useEffect(() => {
    const hoy = new Date();
    const mesActual = hoy.toISOString().slice(0, 7); 
    const proximoMesDate = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
    const mesSiguiente = proximoMesDate.toISOString().slice(0, 7);

    setListaPeriodos([mesActual, mesSiguiente]);
    setPeriodoContable(mesActual);
    setFechaFactura(hoy.toISOString().slice(0, 10)); 
  }, []);

  // --- CALCULOS ---
  const handleMontoChange = (e) => {
    const gravado = parseFloat(e.target.value) || 0;
    setMontoGravado(gravado);
    const iva = parseFloat((gravado * 0.13).toFixed(2));
    setMontoIva(iva);
    setMontoTotal((gravado + iva).toFixed(2));
  };

  // --- BUSCAR CLIENTE (Opcional) ---
  const buscarCliente = async () => {
    if(nrcCliente.length < 5) return;
    try {
        const res = await fetch(`https://backend-production-8f98.up.railway.app/api/clientes/buscar/?nrc=${nrcCliente}`);
        if(res.ok) {
            const data = await res.json();
            if(data.nombre) setNombreCliente(data.nombre);
        }
    } catch (error) {
        console.log("Cliente no encontrado en búsqueda rápida.");
    }
  };

  // --- FUNCIÓN DE RESPALDO: CREAR CLIENTE AUTOMÁTICAMENTE ---
  const crearClienteRapido = async () => {
      // Si no tenemos nombre, ponemos uno genérico para no trabar la venta
      const nombreFinal = nombreCliente || "Cliente General (Auto)";
      
      const nuevoCliente = {
          nombre: nombreFinal,
          nrc: nrcCliente,
          nit: "0000-000000-000-0", // NIT Genérico si no lo tienes
          es_importador: false
      };

      try {
          console.log("🛠️ Creando cliente fantasma...", nuevoCliente);
          const res = await fetch('https://backend-production-8f98.up.railway.app/api/clientes/crear/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(nuevoCliente)
          });
          return res.ok;
      } catch (e) {
          console.error("Fallo al crear cliente rápido", e);
          return false;
      }
  };

  // --- GUARDAR VENTA (INTELIGENTE) ---
  const guardarVenta = async (terminar) => {
    if (!montoGravado || !nrcCliente || !fechaFactura) {
        alert("⚠️ Faltan datos obligatorios (Monto, Cliente o Fecha)");
        return;
    }

    const payloadVenta = {
        empresa: clienteInfo.nrc,         
        cliente: nrcCliente,              
        fecha_emision: fechaFactura,
        periodo_aplicado: periodoContable,
        numero_documento: numeroDocumento,
        total_gravado: parseFloat(montoGravado),
        total_iva: parseFloat(montoIva),
        total: parseFloat(montoTotal),
        tipo_venta: tipoDocumento         
    };

    try {
        // INTENTO 1: Guardar Venta Directamente
        let respuesta = await fetch('https://backend-production-8f98.up.railway.app/api/ventas/crear/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payloadVenta)
        });

        // SI FALLA POR "CLIENTE NO EXISTE" (Error 400 y mensaje de pk invalid)
        if (respuesta.status === 400) {
            const errorData = await respuesta.json();
            // Detectamos si el error es sobre el cliente
            if (JSON.stringify(errorData).includes("does not exist") || JSON.stringify(errorData).includes("Invalid pk")) {
                
                // PREGUNTA INTELIGENTE AL USUARIO
                const deseaCrear = window.confirm(`⚠️ El cliente con NRC ${nrcCliente} no existe en la base de datos general.\n\n¿Deseas crearlo automáticamente como "${nombreCliente || 'Nuevo Cliente'}" y guardar la venta?`);
                
                if (deseaCrear) {
                    // 1. Creamos al cliente
                    const creado = await crearClienteRapido();
                    if (creado) {
                        // 2. Reintentamos guardar la venta
                        respuesta = await fetch('https://backend-production-8f98.up.railway.app/api/ventas/crear/', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payloadVenta)
                        });
                    } else {
                        alert("❌ No se pudo crear el cliente automático.");
                        return;
                    }
                } else {
                    return; // Usuario canceló
                }
            } else {
                 // Es otro error (ej. fecha), mostrarlo
                 alert(`Error: ${JSON.stringify(errorData)}`);
                 return;
            }
        }

        if (respuesta.ok) {
            alert("✅ Venta Guardada Exitosamente");
            setMontoGravado(""); setMontoIva(""); setMontoTotal("");
            setNumeroDocumento(""); setNrcCliente(""); setNombreCliente("");
            if (terminar) volverAlInicio();
        } 

    } catch (error) {
        console.error(error);
        alert("Error de conexión");
    }
  };

  return (
    <div style={{ background: 'white', padding: '30px', borderRadius: '10px', maxWidth: '800px', margin: '20px auto', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        
        <div style={{display: 'flex', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>
            <button onClick={volverAlInicio} style={{marginRight: '15px', cursor: 'pointer', border: 'none', background: 'transparent', fontSize: '1.5em'}}>⬅️</button>
            <h2 style={{margin: 0, color: '#9b59b6'}}>🛒 Registrar Nueva Venta</h2>
            <span style={{marginLeft: 'auto', fontSize: '0.9em', color: '#7f8c8d'}}>{clienteInfo.nombre}</span>
        </div>

        {/* FILA 1 */}
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px'}}>
            <div>
                <label style={{display: 'block'}}>Tipo Documento</label>
                <select value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)} style={{width: '100%', padding: '10px'}}>
                    <option value="CCF">CCF - Crédito Fiscal</option>
                    <option value="CF">CF - Factura</option>
                    <option value="EXP">EXP - Exportación</option>
                </select>
            </div>
            <div>
                <label style={{display: 'block'}}>Periodo</label>
                <select value={periodoContable} onChange={(e) => setPeriodoContable(e.target.value)} style={{width: '100%', padding: '10px', background: '#e8f6f3'}}>
                    {listaPeriodos.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
            <div>
                <label style={{display: 'block'}}>Fecha</label>
                <input type="date" value={fechaFactura} onChange={(e) => setFechaFactura(e.target.value)} style={{width: '100%', padding: '8px', border: '1px solid #ccc'}} />
            </div>
        </div>

        {/* FILA 2 */}
        <div style={{marginBottom: '20px'}}>
            <label style={{display: 'block'}}>Nº Correlativo</label>
            <input value={numeroDocumento} onChange={(e) => setNumeroDocumento(e.target.value)} style={{width: '100%', padding: '10px', border: '1px solid #ccc'}} />
        </div>

        {/* IMPORTANTE: AGREGAMOS VALUE Y ONCHANGE AL NOMBRE PARA PODER GUARDARLO */}
        <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
            <input placeholder="NRC Cliente (Ej: 123456-7)" value={nrcCliente} onChange={(e) => setNrcCliente(e.target.value)} onBlur={buscarCliente} style={{padding:'10px', width:'30%'}} />
            <input placeholder="Nombre Cliente (Escríbelo si es nuevo)" value={nombreCliente} onChange={(e)=>setNombreCliente(e.target.value)} style={{padding:'10px', flex: 1}} />
        </div>

        {/* FILA 3 */}
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px', background: '#fcf3cf', padding: '15px', borderRadius: '5px'}}>
            <div>
                <label>Gravado</label>
                <input type="number" placeholder="0.00" value={montoGravado} onChange={handleMontoChange} style={{padding:'10px', width: '100%'}} />
            </div>
            <div>
                <label>IVA (13%)</label>
                <input type="number" placeholder="0.00" value={montoIva} readOnly style={{padding:'10px', width: '100%', background:'#f9e79f'}} />
            </div>
            <div>
                <label>Total</label>
                <input type="number" placeholder="0.00" value={montoTotal} readOnly style={{padding:'10px', width: '100%', background:'#f9e79f', fontWeight: 'bold'}} />
            </div>
        </div>

        <div style={{marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
            <button onClick={() => guardarVenta(false)} style={{padding: '15px 20px', background: '#34495e', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer'}}>
                ➕ Guardar y Otra
            </button>
            <button onClick={() => guardarVenta(true)} style={{padding: '15px 30px', background: '#9b59b6', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer'}}>
                💾 Guardar y Terminar
            </button>
        </div>
    </div>
  );
};

export default FormularioVentas;