import React, { useState, useEffect } from 'react';

const SeleccionEmpresa = ({ alSeleccionar }) => {
  const [empresas, setEmpresas] = useState([]);
  const [modoCrear, setModoCrear] = useState(false);
  
  // Estados para nueva empresa
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoNrc, setNuevoNrc] = useState("");
  const [nuevoNit, setNuevoNit] = useState("");
  const [nuevoEsImportador, setNuevoEsImportador] = useState(false);

  // Cargar empresas al iniciar este componente
  useEffect(() => {
    cargarEmpresas();
  }, []);

  const cargarEmpresas = () => {
    fetch('https://backend-production-8f98.up.railway.app/api/clientes/')
      .then(res => res.json())
      .then(data => setEmpresas(data))
      .catch(err => console.error("Error cargando empresas:", err));
  };

  const guardarNuevaEmpresa = () => {
    if(!nuevoNombre || !nuevoNrc) { alert("Nombre y NRC son obligatorios"); return; }

    const payload = { 
        nombre: nuevoNombre, 
        nrc: nuevoNrc, 
        nit: nuevoNit, 
        es_importador: nuevoEsImportador 
    };

    fetch('https://backend-production-8f98.up.railway.app/api/clientes/', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
    })
    .then(async res => { 
        if(res.ok) { 
            alert("✅ Empresa Creada"); 
            cargarEmpresas(); 
            setModoCrear(false); 
            // Limpiar campos
            setNuevoNombre(""); setNuevoNrc(""); setNuevoNit(""); setNuevoEsImportador(false);
        } else {
            alert("❌ Error: Posible NRC duplicado o conexión fallida."); 
        }
    });
  };

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#2c3e50' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '10px', width: '500px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
        
        {/* --- PANTALLA LISTA DE EMPRESAS --- */}
        {!modoCrear && (
            <>
                <h2>Selecciona una Empresa</h2>
                <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                    <button onClick={() => setModoCrear(true)} style={{ padding: '8px 15px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                        ➕ Nueva Empresa
                    </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                    {empresas.map(empresa => (
                        <div key={empresa.nrc} onClick={() => alSeleccionar(empresa)} 
                             style={{ padding: '15px', border: '1px solid #eee', borderRadius: '5px', cursor: 'pointer', textAlign: 'left', background: '#f9f9f9' }}>
                            <strong style={{ display: 'block', fontSize: '1.1em' }}>{empresa.nombre}</strong>
                            <span style={{ color: '#7f8c8d', fontSize: '0.9em' }}>NRC: {empresa.nrc}</span>
                        </div>
                    ))}
                    {empresas.length === 0 && <p>Cargando empresas...</p>}
                </div>
            </>
        )}

        {/* --- PANTALLA CREAR EMPRESA --- */}
        {modoCrear && (
            <>
                <h2>🏢 Nueva Empresa</h2>
                <input placeholder="Nombre de la Empresa" value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '10px' }} />
                <input placeholder="NRC" value={nuevoNrc} onChange={e => setNuevoNrc(e.target.value)} style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '10px' }} />
                <input placeholder="NIT (Opcional)" value={nuevoNit} onChange={e => setNuevoNit(e.target.value)} style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '10px' }} />
                
                <div style={{ marginBottom: '15px', textAlign: 'left' }}>
                    <label>
                        <input type="checkbox" checked={nuevoEsImportador} onChange={e => setNuevoEsImportador(e.target.checked)} />
                        {' '} Es Importador
                    </label>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button onClick={() => setModoCrear(false)} style={{ padding: '10px 20px', background: 'transparent', color: '#e74c3c', border: '1px solid #e74c3c', borderRadius: '5px', cursor: 'pointer' }}>Cancelar</button>
                    <button onClick={guardarNuevaEmpresa} style={{ padding: '10px 20px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Guardar</button>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default SeleccionEmpresa;