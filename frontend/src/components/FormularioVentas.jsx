import React, { useState, useEffect } from 'react';

const FormularioVentas = ({ clienteInfo, volverAlInicio }) => {
  // --- ESTADOS ---
  const [tipoDocumento, setTipoDocumento] = useState("CCF"); // Valor por defecto corregido
  const [fechaFactura, setFechaFactura] = useState("");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  
  // Datos del Cliente
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
    
    // 1. Calcular Mes Actual y Siguiente
    const mesActual = hoy.toISOString().slice(0, 7); 
    const proximoMesDate = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
    const mesSiguiente = proximoMesDate.toISOString().slice(0, 7);

    setListaPeriodos([mesActual, mesSiguiente]);
    setPeriodoContable(mesActual);
    
    // 2. Poner la fecha de HOY en el input para evitar errores
    setFechaFactura(hoy.toISOString().slice(0, 10)); 
  }, []);

  // --- CALCULOS ---
  const handleMontoChange = (e) => {
    const gravado = parseFloat(e.target.value) || 0;
    setMontoGravado(gravado);
    
    // Calcular IVA (13%)
    const iva = parseFloat((gravado * 0.13).toFixed(2));
    setMontoIva(iva);
    
    setMontoTotal((gravado + iva).toFixed(2));
  };

  // --- BUSCAR CLIENTE (Opcional) ---
  const buscarCliente = async () => {
    if(nrcCliente.length < 5) return;
    try {
        // Ajusta la URL si tu backend tiene ruta de búsqueda, si no, ignora esto.
        const res = await fetch(`https://backend-production-8f98.up.railway.app/api/clientes/buscar/?nrc=${nrcCliente}`);
        if(res.ok) {
            const data = await res.json();
            if(data.nombre) setNombreCliente(data.nombre);
        }
    } catch (error) {
        console.log("Cliente no encontrado automáticamente.");
    }
  };

  // --- GUARDAR VENTA (VERSIÓN CORREGIDA) ---
  const guardarVenta = async (terminar) => {
    // 1. Validar
    if (!montoGravado || !nrcCliente || !fechaFactura) {
        alert("⚠️ Faltan datos obligatorios (Monto, Cliente o Fecha)");
        return;
    }

    // 2. Preparar datos con los nombres EXACTOS que pide Django
    const nuevaVenta = {
        empresa: clienteInfo.nrc,         // La ferretería que vende
        cliente: nrcCliente,              // El cliente que compra (NRC)
        fecha_emision: fechaFactura,
        periodo_aplicado: periodoContable,
        numero_documento: numeroDocumento,
        total_gravado: parseFloat(montoGravado),
        total_iva: parseFloat(montoIva),
        total: parseFloat(montoTotal),
        tipo_venta: tipoDocumento         // "CCF" o "CF"
    };

    console.log("📤 ENVIANDO VENTA:", nuevaVenta);

    try {
        const respuesta = await fetch('https://backend-production-8f98.up.railway.app/api/ventas/crear/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaVenta)
        });

        if (respuesta.ok) {
            alert("✅ Venta Guardada");
            // Limpiar formulario
            setMontoGravado(""); setMontoIva(""); setMontoTotal("");
            setNumeroDocumento(""); setNrcCliente(""); setNombreCliente("");
            
            if (terminar) {
                volverAlInicio();
            }
        } else {
            // Muestra el error exacto del servidor si falla
            const errorData = await respuesta.json();
            console.error("❌ Error del servidor:", errorData);
            alert(`Error al guardar: ${JSON.stringify(errorData)}`);
        }
    } catch (error) {
        console.error(error);
        alert("Error de conexión");
    }
  };

  return (
    <div style={{ background: 'white', padding: '30px', borderRadius: '10px', maxWidth: '800px', margin: '20px auto', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        
        {/* ENCABEZADO */}
        <div style={{display: 'flex', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>
            <button onClick={volverAlInicio} style={{marginRight: '15px', cursor: 'pointer', border: 'none', background: 'transparent', fontSize: '1.5em'}}>⬅️</button>
            <h2 style={{margin: 0, color: '#9b59b6'}}>🛒 Registrar Nueva Venta</h2>
            <span style={{marginLeft: 'auto', fontSize: '0.9em', color: '#7f8c8d'}}>{clienteInfo.nombre}</span>
        </div>

        {/* FILA 1: TIPO, PERIODO Y FECHA */}
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px'}}>
            <div>
                <label style={{display: 'block'}}>Tipo Documento</label>
                {/* CORRECCIÓN: Values con texto (CCF, CF) en lugar de números */}
                <select value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)} style={{width: '100%', padding: '10px'}}>
                    <option value="CCF">CCF - Crédito Fiscal</option>
                    <option value="CF">CF - Factura</option>
                    <option value="EXP">EXP - Exportación</option>
                </select>
            </div>
            
            <div>
                <label style={{display: 'block'}}>Periodo</label>
                <select 
                    value={periodoContable} 
                    onChange={(e) => setPeriodoContable(e.target.value)} 
                    style={{width: '100%', padding: '10px', background: '#e8f6f3'}}
                >
                    {listaPeriodos.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>

            <div>
                <label style={{display: 'block'}}>Fecha</label>
                <input type="date" value={fechaFactura} onChange={(e) => setFechaFactura(e.target.value)} style={{width: '100%', padding: '8px', border: '1px solid #ccc'}} />
            </div>
        </div>

        {/* FILA 2: CORRELATIVO Y CLIENTE */}
        <div style={{marginBottom: '20px'}}>
            <label style={{display: 'block'}}>Nº Correlativo</label>
            <input value={numeroDocumento} onChange={(e) => setNumeroDocumento(e.target.value)} style={{width: '100%', padding: '10px', border: '1px solid #ccc'}} />
        </div>

        <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
            <input placeholder="NRC Cliente (Ej: 123456-7)" value={nrcCliente} onChange={(e) => setNrcCliente(e.target.value)} onBlur={buscarCliente} style={{padding:'10px', width:'30%'}} />
            <input placeholder="Nombre Cliente" value={nombreCliente} onChange={(e)=>setNombreCliente(e.target.value)} style={{padding:'10px', flex: 1}} />
        </div>

        {/* FILA 3: MONTOS */}
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

        {/* BOTONES */}
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