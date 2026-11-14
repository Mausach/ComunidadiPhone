import React from 'react'
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom'
import { HomeLogin } from '../Pages/HomeLogin/HomeLogin'
import { Dev } from '../Pages/Dev/Dev'
import { Admin } from '../Pages/Admin/Admin'
import { Ventas } from '../Pages/Ventas/Ventas'
import { CreatePass } from '../Pages/CreatePass/CreatePass'
//import { Cobranza } from '../Pages/Cobranza/Cobranza'
import { Ger_Comercial } from '../Pages/Ger_Comercial/Ger_Comercial'
import { Ceo } from '../Pages/Ceo/Ceo'
import { CobranzaV2 } from '../Pages/Cobranza/CobranzaV2'
import { SplashTransition } from '../Pages/HomeLogin/Componentes/SplashTransition'


export const AppRouter = () => {
    return (
        <HashRouter>
            <Routes>

                <Route path="/*" element={<HomeLogin />} />
                <Route path="/loading" element={<SplashTransition />} />
                <Route path="/dev" element={<Dev />} />
                <Route path="/Admin" element={<Admin />} />
                <Route path="/ventas" element={<Ventas />} />
                <Route path="/cobranza" element={<CobranzaV2 />} />
                <Route path="/ger_com" element={<Ger_Comercial />} />
                <Route path="/ceo" element={<Ceo />} />
                {/*Secundarias o especiales*/}
                <Route path="/pass-config" element={<CreatePass />} />

            </Routes>

        </HashRouter>

    )
}