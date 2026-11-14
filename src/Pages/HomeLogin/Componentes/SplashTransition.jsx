// src/Pages/Loading/SplashTransition.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../../Cobranza/Helperss/colors';
import logo from '../../../assets/logo.png';

const roleRoutes = {
  dev: '/dev',
  admin: '/Admin',
  ventas: '/ventas',
  cobranza: '/cobranza',
  ger_com: '/ger_com',
  ceo: '/ceo'
};

export const SplashTransition = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Leer usuario logueado
    const usuario = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Si no hay usuario, al login
    if (!usuario || !usuario.rol) {
      navigate('/', { replace: true });
      return;
    }

    // Animación de barra de progreso
    const interval = setInterval(() => {
      setProgress(p => (p >= 100 ? 100 : p + 2));
    }, 30);

    // Timer de redirección (2 segundos)
    const timer = setTimeout(() => {
      const ruta = roleRoutes[usuario.rol] || '/';
      navigate(ruta, { replace: true, state: { user: usuario } });
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: COLORS.bgGeneral,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.4s ease'
      }}
    >
      {/* Logo animado */}
      <div
        style={{
          animation: 'pulseLogo 1.5s ease-in-out infinite',
          marginBottom: '2rem'
        }}
      >
        <img
          src={logo}
          alt="Logo"
          style={{ width: '120px', height: 'auto', objectFit: 'contain' }}
        />
      </div>

      {/* Texto */}
      <h5
        className="fw-bold mb-4"
        style={{
          color: COLORS.azulOscuro,
          animation: 'fadeIn 0.6s ease 0.3s both'
        }}
      >
        Preparando tu panel...
      </h5>

      {/* Barra de progreso custom */}
      <div
        style={{
          width: '240px',
          height: '4px',
          backgroundColor: COLORS.bordes,
          borderRadius: '4px',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: COLORS.azul,
            borderRadius: '4px',
            transition: 'width 0.1s linear'
          }}
        />
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulseLogo {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
};