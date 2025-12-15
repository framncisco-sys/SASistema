import React, { useState } from 'react';

// --- IMPORTAMOS LOS MÓDULOS QUE CREASTE ---
import SeleccionEmpresa from './components/SeleccionEmpresa';
import FormularioCompras from './components/FormularioCompras';
import FormularioVentas from './components/FormularioVentas';

function App() {
  // --- ESTADOS GLOBALES ---
  const [empresaActual, setEmpresaActual] = useState(null); // Qué empresa estamos trabajando
  const [vistaActual, setVistaActual] = useState("dashboard"); // Qué pantalla vemos (dashboard, compra, venta)

  // --- SI NO HAY EMPRESA SELECCIONADA, MOSTRAMOS EL SELECTOR ---
  if (!empresaActual) {
    return <SeleccionEmpresa alSeleccionar={(empresa) => setEmpresaActual(empresa)} />;
  }

  // --- LOGOUT / CAMBIAR EMPRESA ---
  const cerrarSesion = () => {
    setEmpresaActual(null);
    setVistaActual("dashboard");
  };

  // --- RENDERIZADO PRINCIPAL (DASHBOARD Y FORMULARIOS) ---
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: '#ecf0f1', minHeight: '100vh' }}>
      
      {/* BARRA SUPERIOR (NAVBAR) */}
      <div style={{ background: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.5em' }}>📊</span>
            <h1 style={{ margin: 0, fontSize: '1.2em', color: '#2c3e50' }}>Sistema Contable SA</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ color: '#27ae60', fontWeight: 'bold' }}>{empresaActual.nombre}</span>
            <button onClick={cerrarSesion} style={{ padding: '8px 15px', background: '#c0392b', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                🔒 Salir
            </button>
        </div>
      </div>

      {/* CONTENIDO CAMBIANTE SEGÚN LA VISTA */}
      <div style={{ padding: '30px' }}>
        
        {/* 1. VISTA DASHBOARD (MENU PRINCIPAL) */}
        {vistaActual === "dashboard" && (
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <h2>Hola, Contador 👋</h2>
                <p>¿Qué deseas registrar hoy para <strong>{empresaActual.nombre}</strong>?</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '30px' }}>
                    {/* BOTÓN COMPRA */}
                    <div onClick={() => setVistaActual("nuevaCompra")} 
                         style={{ background: '#3498db', color: 'white', padding: '30px', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', transition: '0.3s' }}>
                        <span style={{ fontSize: '3em', display: 'block' }}>🛍️</span>
                        <h3>Nueva Compra</h3>
                    </div>

                    {/* BOTÓN VENTA */}
                    <div onClick={() => setVistaActual("nuevaVenta")} 
                         style={{ background: '#9b59b6', color: 'white', padding: '30px', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', transition: '0.3s' }}>
                        <span style={{ fontSize: '3em', display: 'block' }}>💰</span>
                        <h3>Nueva Venta</h3>
                    </div>

                    {/* BOTÓN REPORTES (PRÓXIMAMENTE) */}
                    <div style={{ background: '#95a5a6', color: 'white', padding: '30px', borderRadius: '10px', cursor: 'not-allowed', textAlign: 'center', opacity: 0.7 }}>
                        <span style={{ fontSize: '3em', display: 'block' }}>📈</span>
                        <h3>Reportes (Pronto)</h3>
                    </div>
                </div>
            </div>
        )}

        {/* 2. VISTA FORMULARIO COMPRAS */}
        {vistaActual === "nuevaCompra" && (
            <FormularioCompras 
                clienteInfo={empresaActual} 
                volverAlInicio={() => setVistaActual("dashboard")} 
            />
        )}

        {/* 3. VISTA FORMULARIO VENTAS */}
        {vistaActual === "nuevaVenta" && (
            <FormularioVentas 
                clienteInfo={empresaActual} 
                volverAlInicio={() => setVistaActual("dashboard")} 
            />
        )}

      </div>
    </div>
  );
}

export default App;