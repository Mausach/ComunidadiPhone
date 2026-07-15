import React from 'react'
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { CardCreatePass } from './Componentes/CardCreatePass';


export const CreatePass = () => {
  return (
    <>
            <Navbar className="bg-body-tertiary">
                <Container>
                    <Navbar.Brand href="#home">
                        <img
                            alt=""
                            src="/img/logo.svg"
                            width="30"
                            height="30"
                            className="d-inline-block align-top"
                        />{' '}
                        React Bootstrap
                    </Navbar.Brand>
                </Container>
            </Navbar>

            <Container>
                <Row>
                    <Col>     <CardCreatePass/>      </Col>
                    <Col>   Ingresá tu e‑mail y contraseña para iniciar sesión   </Col>
                </Row>
            </Container>

        </>
  )
}
